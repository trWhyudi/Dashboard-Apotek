import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Obat Bebas', 'Obat Keras', 'Herbal', 'Alat Kesehatan', 'Vitamin']
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Harga tidak boleh negatif"],
    },
    stock: {
        type: Number,
        required: true,
        min: [0, "Stok tidak boleh negatif"],
    },
    image: {
        type: String,
        required: true,
    },
    expired: {
        type: Date,
        required: true,
    }
})

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;