import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    totalSales: {
        type: Number,
        required: true,
        default: 0
    },
    totalTransactions: {
        type: Number,
        required: true,
        default: 0
    },
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        revenue: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for date-based queries
saleSchema.index({ date: 1, cashier: 1 });

// Static method to aggregate sales data
saleSchema.statics.aggregateDailySales = async function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                totalSales: { $sum: "$totalSales" },
                totalTransactions: { $sum: "$totalTransactions" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
