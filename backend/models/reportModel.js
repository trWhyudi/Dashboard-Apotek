import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['daily', 'monthly', 'yearly', 'inventory', 'expiry']
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
    reportFormat: {
        type: String,
        enum: ['pdf', 'excel'],
        default: 'pdf'
    },
    summary: {
        totalSales: Number,
        totalTransactions: Number,
        totalRevenue: Number,
        averageTransactionValue: Number,
        topSellingMedicines: [{
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine'
            },
            quantity: Number,
            revenue: Number
        }],
        profitMargin: Number,
        growthRate: Number // percentage compared to previous period
    },
    details: {
        sales: [{
            date: Date,
            totalSales: Number,
            totalTransactions: Number
        }],
        inventory: [{
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine'
            },
            stockStart: Number,
            stockEnd: Number,
            sold: Number,
            revenue: Number
        }],
        expiryAlerts: [{
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine'
            },
            expiryDate: Date,
            currentStock: Number
        }]
    }
}, {
    timestamps: true
});

// Index for efficient querying
reportSchema.index({ type: 1, startDate: 1, endDate: 1 });

// Method to generate report summary
reportSchema.methods.generateSummary = async function() {
    const sales = await mongoose.model('Sale').find({
        date: {
            $gte: this.startDate,
            $lte: this.endDate
        }
    }).populate('medicines.medicine');

    // Calculate basic summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalSales, 0);
    const totalTransactions = sales.reduce((sum, sale) => sum + sale.totalTransactions, 0);

    // Calculate top selling medicines
    const medicineMap = new Map();
    sales.forEach(sale => {
        sale.medicines.forEach(item => {
            const key = item.medicine._id.toString();
            if (medicineMap.has(key)) {
                const existing = medicineMap.get(key);
                existing.quantity += item.quantity;
                existing.revenue += item.revenue;
            } else {
                medicineMap.set(key, {
                    medicine: item.medicine._id,
                    quantity: item.quantity,
                    revenue: item.revenue
                });
            }
        });
    });

    // Sort and get top 5 medicines
    const topSellingMedicines = Array.from(medicineMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Get previous period data for growth rate calculation
    const periodLength = this.endDate - this.startDate;
    const previousPeriodStart = new Date(this.startDate.getTime() - periodLength);
    const previousPeriodSales = await mongoose.model('Sale').find({
        date: {
            $gte: previousPeriodStart,
            $lt: this.startDate
        }
    });

    const previousPeriodRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.totalSales, 0);
    const growthRate = previousPeriodRevenue ? ((totalSales - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

    this.title = this.generateReportTitle();
    this.summary = {
        totalSales,
        totalTransactions,
        totalRevenue: totalSales,
        averageTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0,
        topSellingMedicines,
        growthRate
    };

    await this.save();
};

// Generate formatted data for PDF
reportSchema.methods.getFormattedData = async function() {
    await this.populate('generatedBy');
    await this.populate('details.inventory.medicine');
    await this.populate('details.expiryAlerts.medicine');
    await this.populate('summary.topSellingMedicines.medicine');

    return {
        reportInfo: {
            title: this.title,
            type: this.type,
            period: `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`,
            generatedBy: this.generatedBy.name,
            generatedAt: this.createdAt.toLocaleDateString(),
            logo: 'path_to_logo' // You can set this in frontend
        },
        summary: {
            ...this.summary,
            totalSales: this.formatCurrency(this.summary.totalSales),
            totalRevenue: this.formatCurrency(this.summary.totalRevenue),
            averageTransactionValue: this.formatCurrency(this.summary.averageTransactionValue),
            growthRate: this.summary.growthRate.toFixed(2) + '%'
        },
        details: {
            ...this.details,
            charts: {
                salesTrend: this.getSalesTrendData(),
                topProducts: this.getTopProductsData(),
                inventoryStatus: this.getInventoryStatusData()
            }
        }
    };
};

// Helper method to generate report title
reportSchema.methods.generateReportTitle = function() {
    const typeMap = {
        daily: 'Laporan Harian',
        monthly: 'Laporan Bulanan',
        yearly: 'Laporan Tahunan',
        inventory: 'Laporan Inventaris',
        expiry: 'Laporan Kadaluarsa'
    };
    
    const date = this.startDate.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return `${typeMap[this.type]} - ${date}`;
};

// Helper method to format currency
reportSchema.methods.formatCurrency = function(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
};

// Helper methods for chart data
reportSchema.methods.getSalesTrendData = function() {
    return this.details.sales.map(sale => ({
        date: sale.date.toLocaleDateString(),
        sales: sale.totalSales
    }));
};

reportSchema.methods.getTopProductsData = function() {
    return this.summary.topSellingMedicines.map(item => ({
        name: item.medicine.name,
        quantity: item.quantity,
        revenue: this.formatCurrency(item.revenue)
    }));
};

reportSchema.methods.getInventoryStatusData = function() {
    return this.details.inventory.map(item => ({
        name: item.medicine.name,
        currentStock: item.stockEnd,
        sold: item.sold,
        revenue: this.formatCurrency(item.revenue)
    }));
};

const Report = mongoose.model('Report', reportSchema);
export default Report;
