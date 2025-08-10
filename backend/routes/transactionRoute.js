import express from 'express';
import { 
    createTransaction,
    getAllTransactions,
    getTransactionById,
    getTransactionsByDateRange,
    cancelTransaction,
    deleteTransaction,
} from '../controllers/transactionController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Create transaction - accessible to authenticated users (cashiers & admin)
router.post('/create-transaction', isAuthenticated, createTransaction);

// Get all transactions - admin only
router.get('/all-transactions', isAuthenticated, getAllTransactions);

// Get transaction by ID - accessible to authenticated users
router.get('/single-transaction/:id', isAuthenticated, getTransactionById);

// Get transactions by date range - admin only
router.get('/transactions-by-date', isAuthenticated, getTransactionsByDateRange);

// Cancel transaction - admin only
router.put('/cancel-transaction/:id', isAuthenticated, cancelTransaction);

// Delete transaction - admin only
router.delete('/delete-transaction/:id', isAuthenticated, deleteTransaction);

export default router;