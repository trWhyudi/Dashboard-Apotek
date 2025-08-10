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

// Generate report route
router.post('/generate', isAuthenticated, adminTokenAuth, generateReport);
// Dashboard stats route
router.get('/dashboard-stats', isAuthenticated, adminTokenAuth, getDashboardStats);
// all reports route
router.get('/all-reports', isAuthenticated, adminTokenAuth, getAllReports);
// Single report route
router.get('/single-report/:id', isAuthenticated, adminTokenAuth, getReportById);
// Delete report route
router.delete('/delete-report/:id', isAuthenticated, adminTokenAuth, deleteReport);
// Download report route
router.get('/download-report/:id', isAuthenticated, adminTokenAuth, downloadReportPDF);

export default router;
