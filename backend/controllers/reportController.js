import Report from '../models/reportModel.js';
import Transaction from '../models/transactionModel.js';
import Medicine from '../models/medicineModel.js';
import path from 'path';
import fs from 'fs';
import ErrorHandler from "../middleware/errorMiddleware.js";
import { errorHandleMiddleware } from "../middleware/errorHandleMiddleware.js";

// Generate new report
export const generateReport = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { type, startDate, endDate } = req.body;
        const userId = req.user._id;

        // Validasi input
        const allowedTypes = ['daily', 'monthly', 'yearly'];
        if (!allowedTypes.includes(type)) {
            return next(new ErrorHandler("Tipe laporan tidak valid. Pilih: daily, monthly, atau yearly", 400));
        }

        if (!startDate || !endDate) {
            return next(new ErrorHandler("Tanggal mulai dan akhir harus diisi", 400));
        }

        // Validasi tanggal
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return next(new ErrorHandler("Format tanggal tidak valid", 400));
        }

        if (start > end) {
            return next(new ErrorHandler("Tanggal mulai tidak boleh lebih besar dari tanggal akhir", 400));
        }

        console.log(`Generating ${type} report from ${startDate} to ${endDate}`);

        // Create report instance
        const report = new Report({
            type,
            startDate: start,
            endDate: end,
            generatedBy: userId
        });

        // Generate summary dari Transaction data
        await report.generateSummary();

        // Generate file path
        const timestamp = Date.now();
        const filename = `laporan-${type}-${timestamp}.pdf`;
        const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const outputPath = path.join(uploadsDir, filename);

        // Generate PDF
        await report.generatePDF(outputPath);

        res.status(201).json({
            success: true,
            message: 'Laporan berhasil dibuat',
            data: {
                reportId: report._id,
                title: report.title,
                type: report.type,
                period: {
                    startDate: report.startDate,
                    endDate: report.endDate
                },
                summary: report.summary,
                pdfPath: `/uploads/reports/${filename}`,
                createdAt: report.createdAt
            }
        });

    } catch (error) {
        console.error('[Generate Report Error]', error);
        
        if (error.name === 'ValidationError') {
            return next(new ErrorHandler("Data tidak valid: " + error.message, 400));
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Gagal membuat laporan', 
            error: error.message 
        });
    }
});

// Get all reports
export const getAllReports = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { page = 1, limit = 10, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build filter
        const filter = {};
        if (type && ['daily', 'monthly', 'yearly'].includes(type)) {
            filter.type = type;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reports = await Report.find(filter)
            .populate('generatedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Daftar laporan berhasil diambil',
            data: {
                reports,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('[Get Reports Error]', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar laporan',
            error: error.message
        });
    }
});

// Get report by ID
export const getReportById = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate('generatedBy', 'name email')
            .populate('summary.topProducts.medicine', 'name price');

        if (!report) {
            return next(new ErrorHandler("Laporan tidak ditemukan", 404));
        }

        res.status(200).json({
            success: true,
            message: 'Detail laporan berhasil diambil',
            data: report
        });

    } catch (error) {
        console.error('[Get Report Error]', error);
        
        if (error.name === 'CastError') {
            return next(new ErrorHandler("ID laporan tidak valid", 400));
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail laporan',
            error: error.message
        });
    }
});

// Delete report
export const deleteReport = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);

        if (!report) {
            return next(new ErrorHandler("Laporan tidak ditemukan", 404));
        }

        // Delete PDF file if exists
        if (report.pdfPath) {
            const fullPath = path.join(process.cwd(), report.pdfPath);
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`PDF file deleted: ${fullPath}`);
                }
            } catch (fileError) {
                console.error('Error deleting PDF file:', fileError);
            }
        }

        await Report.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Laporan berhasil dihapus'
        });

    } catch (error) {
        console.error('[Delete Report Error]', error);
        
        if (error.name === 'CastError') {
            return next(new ErrorHandler("ID laporan tidak valid", 400));
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus laporan',
            error: error.message
        });
    }
});

// Download PDF report
export const downloadReportPDF = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);

        if (!report) {
            return next(new ErrorHandler("Laporan tidak ditemukan", 404));
        }

        if (!report.pdfPath) {
            return next(new ErrorHandler("File PDF tidak tersedia", 404));
        }

        const fullPath = path.join(process.cwd(), report.pdfPath);

        if (!fs.existsSync(fullPath)) {
            return next(new ErrorHandler("File PDF tidak ditemukan di server", 404));
        }

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);

        // Stream the file
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('[Download PDF Error]', error);
        
        if (error.name === 'CastError') {
            return next(new ErrorHandler("ID laporan tidak valid", 400));
        }
        
        res.status(500).json({
            success: false,
            message: 'Gagal mengunduh file PDF',
            error: error.message
        });
    }
});

// Get dashboard statistics
export const getDashboardStats = errorHandleMiddleware(async (req, res, next) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Today's transactions
        const todayTransactions = await Transaction.find({
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: 'completed'
        });

        // This month's transactions
        const monthTransactions = await Transaction.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: 'completed'
        });

        // Calculate stats
        const todayStats = {
            totalSales: todayTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0),
            totalTransactions: todayTransactions.length
        };

        const monthStats = {
            totalSales: monthTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0),
            totalTransactions: monthTransactions.length
        };

        // Total medicines
        const totalMedicines = await Medicine.countDocuments();

        // Low stock medicines (stock < 10)
        const lowStockMedicines = await Medicine.countDocuments({ stock: { $lt: 10 } });

        res.status(200).json({
            success: true,
            message: 'Statistik dashboard berhasil diambil',
            data: {
                today: todayStats,
                thisMonth: monthStats,
                medicines: {
                    total: totalMedicines,
                    lowStock: lowStockMedicines
                }
            }
        });

    } catch (error) {
        console.error('[Dashboard Stats Error]', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik dashboard',
            error: error.message
        });
    }
});

