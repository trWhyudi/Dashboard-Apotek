import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transactionNumber: {
        type: String,
        required: true,
        unique: true
    },
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "ID kasir harus diisi"]
    },
    items: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Jumlah minimal 1"]
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    changeAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Generate transaction number before saving
transactionSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        // Get count of transactions for today
        const count = await mongoose.model('Transaction').countDocuments({
            createdAt: {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999))
            }
        });
        
        // Format: TRX-YYMMDD-XXXX (XXXX is sequential number)
        this.transactionNumber = `TRX-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
