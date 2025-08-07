import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['daily', 'monthly', 'yearly']
    },
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pdfPath: {
        type: String,
        required: false
    },
    summary: {
        totalSales: {
            type: Number,
            default: 0
        },
        totalTransactions: {
            type: Number,
            default: 0
        },
        averageTransactionValue: {
            type: Number,
            default: 0
        },
        topProducts: [{
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine'
            },
            medicineName: String,
            quantity: Number,
            revenue: Number
        }],
        growthRate: {
            type: Number,
            default: 0
        },
        dailyBreakdown: [{
            date: String,
            sales: Number,
            transactions: Number
        }]
    }
}, {
    timestamps: true
});

// Index untuk pencarian cepat
reportSchema.index({ type: 1, startDate: 1, endDate: 1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });

// Generate judul laporan otomatis
reportSchema.methods.generateTitle = function () {
    const typeLabel = {
        daily: 'Laporan Harian',
        monthly: 'Laporan Bulanan',
        yearly: 'Laporan Tahunan'
    };

    const startStr = this.startDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const endStr = this.endDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    if (this.startDate.toDateString() === this.endDate.toDateString()) {
        return `${typeLabel[this.type]} - ${startStr}`;
    } else {
        return `${typeLabel[this.type]} - ${startStr} s/d ${endStr}`;
    }
};

// Format angka ke rupiah
reportSchema.methods.formatCurrency = function (amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

// Hitung ringkasan dari koleksi Transaction
reportSchema.methods.generateSummary = async function () {
    try {
        // Normalize dates
        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);

        console.log(`Generating report summary for: ${start} to ${end}`);

        const Transaction = mongoose.model('Transaction');

        // Query transactions within the date range dengan status completed
        const transactions = await Transaction.find({
            createdAt: {
                $gte: start,
                $lte: end
            },
            status: 'completed'
        }).populate('items.medicine').populate('cashier', 'name');

        console.log(`Found ${transactions.length} completed transactions`);

        // Initialize accumulators
        let totalSales = 0;
        let totalTransactions = transactions.length;
        const productMap = new Map();
        const dailyMap = new Map();

        // Process each transaction
        for (const transaction of transactions) {
            totalSales += transaction.totalAmount || 0;

            // Daily breakdown
            const dateKey = transaction.createdAt.toISOString().split('T')[0];
            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, { sales: 0, transactions: 0 });
            }
            const dailyData = dailyMap.get(dateKey);
            dailyData.sales += transaction.totalAmount || 0;
            dailyData.transactions += 1;

            // Process items for top products
            if (transaction.items && Array.isArray(transaction.items)) {
                for (const item of transaction.items) {
                    if (item.medicine && item.medicine._id) {
                        const key = item.medicine._id.toString();
                        if (!productMap.has(key)) {
                            productMap.set(key, {
                                medicine: item.medicine._id,
                                medicineName: item.medicine.name,
                                quantity: item.quantity || 0,
                                revenue: item.subtotal || 0
                            });
                        } else {
                            const existing = productMap.get(key);
                            existing.quantity += item.quantity || 0;
                            existing.revenue += item.subtotal || 0;
                        }
                    }
                }
            }
        }

        // Sort top 5 products by revenue
        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map(product => ({
                medicine: product.medicine,
                medicineName: product.medicineName,
                quantity: product.quantity,
                revenue: product.revenue
            }));

        // Daily breakdown
        const dailyBreakdown = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                sales: data.sales,
                transactions: data.transactions
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ===== PERBAIKAN GROWTH RATE CALCULATION =====
        let growthRate = 0;

        // Hitung periode sebelumnya berdasarkan durasi periode yang sama
        const periodDuration = end.getTime() - start.getTime();
        
        // Untuk periode sebelumnya, mundur sebanyak durasi periode
        const prevEnd = new Date(start.getTime() - 1); // 1ms sebelum start periode current
        const prevStart = new Date(prevEnd.getTime() - periodDuration);

        console.log('Growth Rate Calculation:', {
            currentPeriod: { start: start.toISOString(), end: end.toISOString() },
            previousPeriod: { start: prevStart.toISOString(), end: prevEnd.toISOString() },
            periodDurationDays: Math.ceil(periodDuration / (1000 * 60 * 60 * 24))
        });

        // Cari transaksi periode sebelumnya
        const previousTransactions = await Transaction.find({
            createdAt: {
                $gte: prevStart,
                $lte: prevEnd
            },
            status: 'completed'
        });

        const prevRevenue = previousTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        console.log('Growth Rate Data:', {
            currentRevenue: totalSales,
            previousRevenue: prevRevenue,
            previousTransactionsCount: previousTransactions.length
        });

        // Hitung growth rate
        if (prevRevenue > 0) {
            growthRate = ((totalSales - prevRevenue) / prevRevenue) * 100;
        } else if (totalSales > 0) {
            // Jika tidak ada data sebelumnya tapi ada data sekarang = 100% growth
            growthRate = 100;
        }
        // Jika keduanya 0, growth rate tetap 0

        console.log(`Final Growth Rate: ${growthRate.toFixed(2)}%`);

        // Generate title and assign summary
        this.title = this.generateTitle();
        this.summary = {
            totalSales,
            totalTransactions,
            averageTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0,
            topProducts,
            growthRate: Math.round(growthRate * 100) / 100,
            dailyBreakdown
        };

        console.log('Report Summary Generated:', {
            totalSales: this.summary.totalSales,
            totalTransactions: this.summary.totalTransactions,
            topProductsCount: this.summary.topProducts.length,
            growthRate: this.summary.growthRate
        });

        await this.save();
        return this.summary;

    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
};

// Generate PDF report
reportSchema.methods.generatePDF = async function (outputPath) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Header dengan styling yang lebih baik
        doc.fontSize(20).font('Helvetica-Bold')
           .text(this.title, { align: 'center' });
        
        doc.fontSize(12).font('Helvetica')
           .text(`Dihasilkan pada: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        
        doc.moveDown(2);

        // Period info
        doc.fontSize(14).font('Helvetica-Bold')
           .text('INFORMASI PERIODE');
        
        doc.fontSize(12).font('Helvetica')
           .text(`Periode: ${this.startDate.toLocaleDateString('id-ID')} - ${this.endDate.toLocaleDateString('id-ID')}`);
        
        doc.moveDown();

        // Summary metrics
        doc.fontSize(14).font('Helvetica-Bold')
           .text('RINGKASAN PENJUALAN');
        
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Penjualan: ${this.formatCurrency(this.summary.totalSales)}`);
        doc.text(`Total Transaksi: ${this.summary.totalTransactions.toLocaleString('id-ID')}`);
        doc.text(`Rata-rata per Transaksi: ${this.formatCurrency(this.summary.averageTransactionValue)}`);
        
        const growthText = this.summary.growthRate >= 0 ? '+' : '';
        doc.text(`Pertumbuhan: ${growthText}${this.summary.growthRate.toFixed(2)}%`);
        
        doc.moveDown(2);

        // Top Products
        if (this.summary.topProducts && this.summary.topProducts.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold')
               .text('PRODUK TERLARIS');
            
            doc.fontSize(12).font('Helvetica');
            
            let rank = 1;
            for (const item of this.summary.topProducts) {
                const medicineName = item.medicineName || 'Nama Tidak Tersedia';
                doc.text(`${rank}. ${medicineName}`);
                doc.text(`   Terjual: ${item.quantity.toLocaleString('id-ID')} pcs`);
                doc.text(`   Pendapatan: ${this.formatCurrency(item.revenue)}`);
                doc.moveDown(0.5);
                rank++;
            }
        } else {
            doc.fontSize(14).font('Helvetica-Bold')
               .text('PRODUK TERLARIS');
            doc.fontSize(12).font('Helvetica')
               .text('Tidak ada data produk dalam periode ini.');
        }

        doc.moveDown();

        // Daily breakdown (jika ada)
        if (this.summary.dailyBreakdown && this.summary.dailyBreakdown.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold')
               .text('RINCIAN HARIAN');
            
            doc.fontSize(12).font('Helvetica');
            
            for (const daily of this.summary.dailyBreakdown) {
                const date = new Date(daily.date).toLocaleDateString('id-ID');
                doc.text(`${date}: ${this.formatCurrency(daily.sales)} (${daily.transactions} transaksi)`);
            }
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica')
           .text('--- Laporan ini dihasilkan secara otomatis oleh sistem ---', { align: 'center' });

        doc.end();

        // Wait for file to be written
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        this.pdfPath = outputPath;
        await this.save();

        console.log(`PDF generated successfully: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

const Report = mongoose.model('Report', reportSchema);
export default Report;