import express from 'express';
import { 
    createTransaction,
    getAllTransactions,
    getTransactionById,
    getTransactionsByDateRange,
    cancelTransaction,
    deleteTransaction,
} from '../controllers/transactionController.js';
import { isAuthenticated, adminTokenAuth } from '../middleware/auth.js';

const router = express.Router();

// Create transaction - accessible to authenticated users (cashiers & admin)
router.post('/create-transaction', isAuthenticated, adminTokenAuth, createTransaction);

// Get all transactions - admin only
router.get('/all-transactions', isAuthenticated, adminTokenAuth, getAllTransactions);

// Get transaction by ID - accessible to authenticated users
router.get('/single-transaction/:id', isAuthenticated, adminTokenAuth, getTransactionById);

// Get transactions by date range - admin only
router.get('/transactions-by-date', isAuthenticated, adminTokenAuth, getTransactionsByDateRange);

// Cancel transaction - admin only
router.put('/cancel-transaction/:id', isAuthenticated, adminTokenAuth, cancelTransaction);

// Delete transaction - admin only
router.delete('/delete-transaction/:id', isAuthenticated, adminTokenAuth, deleteTransaction);

export default router;