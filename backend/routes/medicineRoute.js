import express from 'express';
import { createMedicine, updateMedicine, uploadMedicineImage, getAllMedicines, searchMedicines, deleteMedicine, getMedicineById, getCategorySummary } from '../controllers/medicineController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Create medicine
router.post('/create-medicine', isAuthenticated, uploadMedicineImage, createMedicine);
// Get all medicines
router.get('/all-medicines', isAuthenticated, getAllMedicines);
// Get medicine by ID
router.get('/single-medicine/:id', isAuthenticated, getMedicineById);
// Search medicines by name
router.get('/search-medicines', isAuthenticated, searchMedicines);
// get medicine categories summary
router.get('/categories-summary', isAuthenticated, getCategorySummary)
// Update medicine
router.put('/update-medicine/:id', isAuthenticated, uploadMedicineImage, updateMedicine);
// Delete medicine
router.delete('/delete-medicine/:id', isAuthenticated, deleteMedicine);

export default router;
