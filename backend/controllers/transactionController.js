import Transaction from "../models/transactionModel.js";
import Medicine from "../models/medicineModel.js";
import Sale from "../models/saleModel.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { errorHandleMiddleware } from "../middleware/errorHandleMiddleware.js";
import mongoose from "mongoose";

// Create transaction
export const createTransaction = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { items, paymentAmount } = req.body;

        if (!items || items.length === 0) {
            return next(new ErrorHandler("Item transaksi harus diisi", 400));
        }

        if (!paymentAmount || paymentAmount <= 0) {
            return next(new ErrorHandler("Jumlah pembayaran harus valid", 400));
        }

        // Calculate total amount and validate stock
        let totalAmount = 0;
        const updatedItems = [];
        const medicineMap = new Map(); // Use map to prevent duplicate medicine queries

        for (const item of items) {
            // Check if we already fetched this medicine
            let medicine;
            if (medicineMap.has(item.medicine)) {
                medicine = medicineMap.get(item.medicine);
            } else {
                medicine = await Medicine.findById(item.medicine);
                if (!medicine) {
                    return next(new ErrorHandler(`Obat dengan ID ${item.medicine} tidak ditemukan`, 404));
                }
                medicineMap.set(item.medicine, medicine);
            }

            if (medicine.stock < item.quantity) {
                return next(new ErrorHandler(`Stok tidak cukup untuk obat ${medicine.name}. Sisa stock: ${medicine.stock}`, 400));
            }

            const subtotal = medicine.price * item.quantity;
            updatedItems.push({
                medicine: item.medicine,
                quantity: item.quantity,
                price: medicine.price,
                subtotal
            });

            totalAmount += subtotal;
        }

        if (paymentAmount < totalAmount) {
            return next(new ErrorHandler("Pembayaran kurang dari total pembelian", 400));
        }

        const changeAmount = paymentAmount - totalAmount;

        // Generate transaction number
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        // Get count of transactions for today
        const todayStart = new Date(date);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(date);
        todayEnd.setHours(23, 59, 59, 999);
        
        const count = await Transaction.countDocuments({
            createdAt: {
                $gte: todayStart,
                $lt: todayEnd
            }
        });
        
        // Format: TRX-YYMMDD-XXXX (XXXX is sequential number)
        const transactionNumber = `TRX-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;

        // Create transaction
        const transaction = new Transaction({
            transactionNumber,
            cashier: req.user._id, // from auth middleware
            items: updatedItems,
            totalAmount,
            paymentAmount,
            changeAmount,
            status: 'completed'
        });

        // Begin transaction process
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update medicine stock
            for (const item of updatedItems) {
                const medicine = await Medicine.findById(item.medicine).session(session);
                if (!medicine) {
                    throw new Error(`Obat dengan ID ${item.medicine} tidak ditemukan`);
                }
                
                // Recheck stock to prevent race conditions
                if (medicine.stock < item.quantity) {
                    throw new Error(`Stok tidak cukup untuk obat ${medicine.name}. Sisa stock: ${medicine.stock}`);
                }
                
                // Update stock
                medicine.stock = medicine.stock - item.quantity;
                await medicine.save({ session });
            }

            // Save transaction
            await transaction.save({ session });

            // Commit the transaction
            await session.commitTransaction();
        } catch (error) {
            // If an error occurred, abort the transaction and rollback changes
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }

        // Create/update sale record
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let sale = await Sale.findOne({
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            cashier: req.user._id
        });

        if (!sale) {
            sale = new Sale({
                date: today,
                cashier: req.user._id,
                totalSales: 0,
                totalTransactions: 0,
                medicines: []
            });
        }

        // Update sales record
        sale.totalSales += totalAmount;
        sale.totalTransactions += 1;

        // Update sales medicine records
        for (const item of updatedItems) {
            const existingMedicineIndex = sale.medicines.findIndex(
                m => m.medicine.toString() === item.medicine.toString()
            );

            if (existingMedicineIndex !== -1) {
                sale.medicines[existingMedicineIndex].quantity += item.quantity;
                sale.medicines[existingMedicineIndex].revenue += item.subtotal;
            } else {
                sale.medicines.push({
                    medicine: item.medicine,
                    quantity: item.quantity,
                    revenue: item.subtotal
                });
            }
        }

        await sale.save();

        res.status(201).json({
            success: true,
            message: "Transaksi berhasil dibuat",
            transaction,
            changeAmount
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat logout",
            error: error.message
        });
    }
});

// Get all transactions
export const getAllTransactions = errorHandleMiddleware(async (req, res, next) => {
    try {
        const transactions = await Transaction.find()
            .populate('cashier', 'name')
            .populate('items.medicine', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat logout",
            error: error.message
        });
    }
});

// Get transaction by ID
export const getTransactionById = errorHandleMiddleware(async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('cashier', 'name')
            .populate('items.medicine', 'name price');

        if (!transaction) {
            return next(new ErrorHandler("Transaksi tidak ditemukan", 404));
        }

        res.status(200).json({
            success: true,
            transaction
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil detail transaksi",
            error: error.message
        });
    }
});

// Get transactions by date range
export const getTransactionsByDateRange = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return next(new ErrorHandler("Tanggal awal dan akhir harus diisi", 400));
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const transactions = await Transaction.find({
            createdAt: {
                $gte: start,
                $lte: end
            }
        })
        .populate('cashier', 'name')
        .populate('items.medicine', 'name price')
        .sort({ createdAt: -1 });

        const totalAmount = transactions.reduce((sum, trans) => sum + trans.totalAmount, 0);
        const totalTransactions = transactions.length;

        res.status(200).json({
            success: true,
            count: totalTransactions,
            totalAmount,
            transactions
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil transaksi berdasarkan tanggal",
            error: error.message
        });
    }
});

// Cancel transaction
export const cancelTransaction = errorHandleMiddleware(async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return next(new ErrorHandler("Transaksi tidak ditemukan", 404));
        }

        if (transaction.status === 'cancelled') {
            return next(new ErrorHandler("Transaksi sudah dibatalkan", 400));
        }

        // Restore medicine stock
        for (const item of transaction.items) {
            const medicine = await Medicine.findById(item.medicine);
            if (medicine) {
                medicine.stock += item.quantity;
                await medicine.save({ validateBeforeSave: false });
            }
        }

        // Update sale record
        const transactionDate = new Date(transaction.createdAt);
        transactionDate.setHours(0, 0, 0, 0);

        const sale = await Sale.findOne({
            date: {
                $gte: transactionDate,
                $lt: new Date(transactionDate.getTime() + 24 * 60 * 60 * 1000)
            },
            cashier: transaction.cashier
        });

        if (sale) {
            sale.totalSales -= transaction.totalAmount;
            sale.totalTransactions -= 1;

            for (const item of transaction.items) {
                const medicineIndex = sale.medicines.findIndex(
                    m => m.medicine.toString() === item.medicine.toString()
                );

                if (medicineIndex !== -1) {
                    sale.medicines[medicineIndex].quantity -= item.quantity;
                    sale.medicines[medicineIndex].revenue -= item.subtotal;

                    if (sale.medicines[medicineIndex].quantity === 0) {
                        sale.medicines.splice(medicineIndex, 1);
                    }
                }
            }

            await sale.save();
        }

        transaction.status = 'cancelled';
        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Transaksi berhasil dibatalkan"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat membatalkan transaksi",
            error: error.message
        });
    }
});

// Delete transaction
export const deleteTransaction = errorHandleMiddleware(async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return next(new ErrorHandler("Transaksi tidak ditemukan", 404));
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            message: "Transaksi berhasil dihapus"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat menghapus transaksi",
            error: error.message
        });
    }
});