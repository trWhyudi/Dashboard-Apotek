import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["daily", "monthly", "yearly"],
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pdfPath: {
      type: String,
      required: false,
    },
    summary: {
      totalSales: {
        type: Number,
        default: 0,
      },
      totalTransactions: {
        type: Number,
        default: 0,
      },
      averageTransactionValue: {
        type: Number,
        default: 0,
      },
      topProducts: [
        {
          medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
          },
          medicineName: String,
          quantity: Number,
          revenue: Number,
        },
      ],
      totalMedicinesSold: {
        type: Number,
        default: 0,
      },
      dailyBreakdown: [
        {
          date: String,
          sales: Number,
          transactions: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk pencarian cepat
reportSchema.index({ type: 1, startDate: 1, endDate: 1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });

// Generate judul laporan otomatis
reportSchema.methods.generateTitle = function () {
  const typeLabel = {
    daily: "Laporan Harian",
    monthly: "Laporan Bulanan",
    yearly: "Laporan Tahunan",
  };

  const startStr = this.startDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endStr = this.endDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (this.startDate.toDateString() === this.endDate.toDateString()) {
    return `${typeLabel[this.type]} - ${startStr}`;
  } else {
    return `${typeLabel[this.type]} - ${startStr} s/d ${endStr}`;
  }
};

// Format angka ke rupiah
reportSchema.methods.formatCurrency = function (amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Hitung ringkasan dari koleksi Transaction
reportSchema.methods.generateSummary = async function () {
  try {
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    console.log(`Generating report summary for: ${start} to ${end}`);

    const Transaction = mongoose.model("Transaction");

    const transactions = await Transaction.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
      status: "completed",
    })
      .populate("items.medicine")
      .populate("cashier", "name");

    console.log(`Found ${transactions.length} completed transactions`);

    let totalSales = 0;
    let totalTransactions = transactions.length;
    let totalMedicinesSold = 0;
    const productMap = new Map();
    const dailyMap = new Map();

    for (const transaction of transactions) {
      totalSales += transaction.totalAmount || 0;

      const dateKey = transaction.createdAt.toISOString().split("T")[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { sales: 0, transactions: 0 });
      }
      const dailyData = dailyMap.get(dateKey);
      dailyData.sales += transaction.totalAmount || 0;
      dailyData.transactions += 1;

      if (transaction.items && Array.isArray(transaction.items)) {
        for (const item of transaction.items) {
          if (item.medicine && item.medicine._id) {
            // Tambahkan ke total obat terjual
            totalMedicinesSold += item.quantity || 0;

            const key = item.medicine._id.toString();
            if (!productMap.has(key)) {
              productMap.set(key, {
                medicine: item.medicine._id,
                medicineName: item.medicine.name,
                quantity: item.quantity || 0,
                revenue: item.subtotal || 0,
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

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product) => ({
        medicine: product.medicine,
        medicineName: product.medicineName,
        quantity: product.quantity,
        revenue: product.revenue,
      }));

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        transactions: data.transactions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log("Total medicines sold:", totalMedicinesSold);

    this.title = this.generateTitle();
    this.summary = {
      totalSales,
      totalTransactions,
      averageTransactionValue:
        totalTransactions > 0 ? totalSales / totalTransactions : 0,
      topProducts,
      totalMedicinesSold,
      dailyBreakdown,
    };

    console.log("Report Summary Generated:", {
      totalSales: this.summary.totalSales,
      totalTransactions: this.summary.totalTransactions,
      topProductsCount: this.summary.topProducts.length,
      totalMedicinesSold: this.summary.totalMedicinesSold,
    });

    await this.save();
    return this.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

// Generate PDF report
reportSchema.methods.generatePDF = async function (outputPath) {
  try {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      info: {
        Title: this.title,
        Author: "Pharmacy Management System",
        Creator: "Pharmacy Management System",
      },
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    let yPosition = 50;
    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    const checkNewPage = (neededHeight = 50) => {
      if (yPosition + neededHeight > doc.page.height - 50) {
        doc.addPage();
        yPosition = 50;
        return true;
      }
      return false;
    };

    const formatCurrency = (amount) => {
      return `Rp ${(amount || 0).toLocaleString("id-ID")}`;
    };

    // ========== HEADER SECTION ==========
    // Judul laporan
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(this.title, margin, yPosition, {
        width: contentWidth,
        align: "center",
      });

    yPosition += 30;

    // Tanggal generasi
    const now = new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000000")
      .text(
        `Dihasilkan pada: ${dayName}, ${day} ${month} ${year} pukul ${time}`,
        margin,
        yPosition,
        {
          width: contentWidth,
          align: "left",
        }
      );

    yPosition += 40;

    // ========== PERIODE SECTION ==========
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("PERIODE LAPORAN", margin, yPosition);

    yPosition += 20;

    doc.fontSize(10).font("Helvetica").fillColor("#000000");

    const startDateStr = this.startDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const endDateStr = this.endDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.text(`Tanggal Mulai: ${startDateStr}`, margin, yPosition);
    yPosition += 15;
    doc.text(`Tanggal Selesai: ${endDateStr}`, margin, yPosition);
    yPosition += 30;

    // ========== SUMMARY METRICS SECTION ==========
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("RINGKASAN KINERJA", margin, yPosition);

    yPosition += 25;

    const metrics = [
      {
        label: "TOTAL PENJUALAN",
        value: formatCurrency(this.summary.totalSales),
      },
      {
        label: "TOTAL TRANSAKSI",
        value: this.summary.totalTransactions.toString(),
      },
      {
        label: "RATA-RATA TRANSAKSI",
        value: formatCurrency(this.summary.averageTransactionValue),
      },
      {
        label: "JUMLAH OBAT TERJUAL",
        value: `${this.summary.totalMedicinesSold.toLocaleString("id-ID")} pcs`,
      },
    ];

    const cardWidth = (contentWidth - 20) / 2;
    const cardHeight = 50;
    const cardSpacing = 20;

    for (let i = 0; i < metrics.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;

      const x = margin + col * (cardWidth + cardSpacing);
      const y = yPosition + row * (cardHeight + 15);

      checkNewPage(cardHeight + 20);

      doc
        .rect(x, y, cardWidth, cardHeight)
        .stroke("#cccccc")
        .fillAndStroke("#f8f9fa", "#cccccc");

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(metrics[i].label, x + 10, y + 10, {
          width: cardWidth - 20,
        });

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(metrics[i].value, x + 10, y + 28, {
          width: cardWidth - 20,
        });
    }

    yPosition += 2 * cardHeight + 40;

    // ========== PRODUCTS SECTION ==========
    if (this.summary.topProducts && this.summary.topProducts.length > 0) {
      checkNewPage(100);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("PRODUK TERJUAL", margin, yPosition);

      yPosition += 25;

      // Header tabel
      const tableStartY = yPosition;
      const colWidths = [30, 250, 80, 100];
      let colX = margin;

      // Header background
      doc.rect(margin, yPosition, contentWidth, 20).fill("#e9ecef");

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000");

      // Header kolom
      doc.text("NO", colX + 5, yPosition + 5, { width: colWidths[0] - 10 });
      colX += colWidths[0];
      doc.text("NAMA PRODUK", colX + 5, yPosition + 5, {
        width: colWidths[1] - 10,
      });
      colX += colWidths[1];
      doc.text("TERJUAL", colX + 5, yPosition + 5, {
        width: colWidths[2] - 10,
        align: "center",
      });
      colX += colWidths[2];
      doc.text("PENDAPATAN", colX + 5, yPosition + 5, {
        width: colWidths[3] - 10,
        align: "center",
      });

      yPosition += 25;

      // Data rows
      this.summary.topProducts.forEach((item, index) => {
        checkNewPage(25);

        colX = margin;
        const rowColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        // Row background
        doc.rect(margin, yPosition, contentWidth, 20).fill(rowColor);

        doc.fontSize(9).font("Helvetica").fillColor("#000000");

        // Data kolom
        doc.text((index + 1).toString(), colX + 5, yPosition + 5, {
          width: colWidths[0] - 10,
          align: "center",
        });
        colX += colWidths[0];

        doc.text(
          item.medicineName || "Nama Tidak Tersedia",
          colX + 5,
          yPosition + 5,
          {
            width: colWidths[1] - 10,
            ellipsis: true,
          }
        );
        colX += colWidths[1];

        doc.text(item.quantity.toString() + " pcs", colX + 5, yPosition + 5, {
          width: colWidths[2] - 10,
          align: "center",
        });
        colX += colWidths[2];

        doc.text(formatCurrency(item.revenue), colX + 5, yPosition + 5, {
          width: colWidths[3] - 10,
          align: "center",
        });

        yPosition += 20;
      });

      // Garis border tabel
      doc
        .rect(margin, tableStartY, contentWidth, yPosition - tableStartY)
        .stroke("#cccccc");

      yPosition += 30;
    }

    // ========== DAILY SECTION ==========
    if (this.summary.dailyBreakdown && this.summary.dailyBreakdown.length > 0) {
      checkNewPage(100);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("RINCIAN HARIAN", margin, yPosition);

      yPosition += 25;

      // Header tabel
      const tableStartY = yPosition;
      const colWidths = [200, 150, 100];
      let colX = margin;

      // Header background
      doc.rect(margin, yPosition, contentWidth, 20).fill("#e9ecef");

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000");

      // Header kolom
      doc.text("TANGGAL", colX + 5, yPosition + 5, {
        width: colWidths[0] - 10,
      });
      colX += colWidths[0];
      doc.text("PENJUALAN", colX + 5, yPosition + 5, {
        width: colWidths[1] - 10,
        align: "center",
      });
      colX += colWidths[1];
      doc.text("TRANSAKSI", colX + 5, yPosition + 5, {
        width: colWidths[2] - 10,
        align: "center",
      });

      yPosition += 25;

      // Data rows
      this.summary.dailyBreakdown.forEach((daily, index) => {
        checkNewPage(25);

        colX = margin;
        const rowColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

        doc.rect(margin, yPosition, contentWidth, 20).fill(rowColor);

        doc.fontSize(9).font("Helvetica").fillColor("#000000");

        const date = new Date(daily.date);
        const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];

        const dayName = dayNames[date.getDay()];
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        const dateStr = `${dayName}, ${day} ${month} ${year}`;

        // Data kolom
        doc.text(dateStr, colX + 5, yPosition + 5, {
          width: colWidths[0] - 10,
        });
        colX += colWidths[0];

        doc.text(formatCurrency(daily.sales), colX + 5, yPosition + 5, {
          width: colWidths[1] - 10,
          align: "center",
        });
        colX += colWidths[1];

        doc.text(daily.transactions.toString(), colX + 5, yPosition + 5, {
          width: colWidths[2] - 10,
          align: "center",
        });

        yPosition += 20;
      });

      // Garis border tabel
      doc
        .rect(margin, tableStartY, contentWidth, yPosition - tableStartY)
        .stroke("#cccccc");

      yPosition += 30;
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    this.pdfPath = outputPath;
    await this.save();

    console.log(`PDF generated successfully: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const Report = mongoose.model("Report", reportSchema);
export default Report;
