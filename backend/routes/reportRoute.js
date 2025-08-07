import { isAuthenticated, adminTokenAuth } from '../middleware/auth.js';
import express from 'express';
import {
    generateReport,
    getAllReports,
    getReportById,
    deleteReport,
    downloadReportPDF,
    getDashboardStats
} from '../controllers/reportController.js';

const router = express.Router();

// Routes
router.post('/generate', isAuthenticated, adminTokenAuth, generateReport);
router.get('/dashboard-stats', isAuthenticated, adminTokenAuth, getDashboardStats);
router.get('/all-reports', isAuthenticated, adminTokenAuth, getAllReports);
router.get('/single-report/:id', isAuthenticated, adminTokenAuth, getReportById);
router.delete('/delete-report/:id', isAuthenticated, adminTokenAuth, deleteReport);
router.get('/download-report/:id', isAuthenticated, adminTokenAuth, downloadReportPDF);

export default router;
