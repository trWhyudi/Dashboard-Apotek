import express from 'express';
import { createMedicine, updateMedicine, uploadMedicineImage, getAllMedicines, searchMedicines, deleteMedicine, getMedicineById } from '../controllers/medicineController.js';
import { isAuthenticated, adminTokenAuth } from '../middleware/auth.js';

const router = express.Router();

// Create medicine - only admin can create medicines
router.post('/create-medicine', isAuthenticated, adminTokenAuth, uploadMedicineImage, createMedicine);
// Get all medicines - accessible to authenticated users
router.get('/all-medicines', isAuthenticated, getAllMedicines);
// Get medicine by ID - accessible to authenticated users
router.get('/single-medicine/:id', isAuthenticated, getMedicineById);
// Search medicines by name - accessible to authenticated users
router.get('/search-medicines', isAuthenticated, searchMedicines);
// Update medicine - only admin can update medicines
router.put('/update-medicine/:id', isAuthenticated, adminTokenAuth, uploadMedicineImage, updateMedicine);
// Delete medicine - only admin can delete medicines
router.delete('/delete-medicine/:id', isAuthenticated, adminTokenAuth, deleteMedicine);

export default router;
