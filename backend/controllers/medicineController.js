import Medicine from '../models/medicineModel.js';
import ErrorHandler from "../middleware/errorMiddleware.js";
import { errorHandleMiddleware } from "../middleware/errorHandleMiddleware.js";
import upload from '../middleware/upload.js';

// Middleware for single image upload
export const uploadMedicineImage = upload.single('image');

// Create medicine
export const createMedicine = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { name, description, category, price, stock, expired } = req.body;
        
        if (!name || !description || !category || !price || !stock || !expired ) {
            return next(new ErrorHandler("Semua field harus diisi", 400));
        }

        // Get the image path from multer
        const image = `/uploads/medicines/${req.file.filename}`;

        const medicine = new Medicine({
            name,
            description,
            category,
            price,
            stock,
            image,
            expired
        });

        await medicine.save();

        res.status(201).json({
            success: true,
            message: "Obat berhasil dibuat",
            medicine
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat membuat obat",
            error: error.message
        });
    }
})

// Search medicines by name
export const searchMedicines = errorHandleMiddleware(async (req, res, next) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return next(new ErrorHandler("Nama obat harus diisi untuk pencarian", 400));
        }

        // Create a case-insensitive regular expression for the search
        const searchRegex = new RegExp(name, 'i');
        
        const medicines = await Medicine.find({ name: searchRegex });

        if (medicines.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Tidak ada obat yang ditemukan",
                medicines: []
            });
        }

        res.status(200).json({
            success: true,
            count: medicines.length,
            medicines
        });
    } catch (error) {
        next(new ErrorHandler("Error dalam pencarian obat", 500));
    }
});

// get all medicines
export const getAllMedicines = errorHandleMiddleware(async (req, res, next) => {
    try {
        const medicines = await Medicine.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Obat berhasil ditemukan",
            medicines
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil daftar obat",
            error: error.message
        });
    }
});

// get medicine by id
export const getMedicineById = errorHandleMiddleware(async (req, res, next) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return next(new ErrorHandler("Obat tidak ditemukan", 404));
        }

        res.status(200).json({
            success: true,
            message: "Obat berhasil ditemukan",
            medicine
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil detail obat",
            error: error.message
        });
    }
})

// Get medicine count by category
export const getCategorySummary = errorHandleMiddleware(async (req, res, next) => {
  try {
    const summary = await Medicine.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      categories: summary
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan kategori",
      error: error.message
    });
  }
});

// update medicine
export const updateMedicine = errorHandleMiddleware(async (req, res, next) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return next(new ErrorHandler("Obat tidak ditemukan", 404));
        }

        const { name, description, category, price, stock, expired } = req.body;

        if (!name || !description || !price || !stock || !expired) {
            return next(new ErrorHandler("Semua field harus diisi", 400));
        }

        medicine.name = name;
        medicine.description = description;
        medicine.category = category;
        medicine.price = price;
        medicine.stock = stock;
        medicine.expired = expired;

        // Handle image update if new image is uploaded
        if (req.file) {
            // Delete old image file
            const fs = await import('fs/promises');
            const path = await import('path');
            const oldImagePath = path.join(process.cwd(), medicine.image);
            
            try {
                await fs.access(oldImagePath);
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.log('Old image file not found:', error);
            }

            // Set new image path
            medicine.image = `/uploads/medicines/${req.file.filename}`;
        }

        await medicine.save();

        res.status(200).json({
            success: true,
            message: "Obat berhasil diperbarui",
            medicine
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat memperbarui obat",
            error: error.message
        });
    }
});

// delete medicine
export const deleteMedicine = errorHandleMiddleware(async (req, res, next) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return next(new ErrorHandler("Obat tidak ditemukan", 404));
        }

        // Delete image file
        const fs = await import('fs/promises');
        const path = await import('path');
        const imagePath = path.join(process.cwd(), medicine.image);

        try {
            await fs.access(imagePath); // Check if file exists
            await fs.unlink(imagePath); // Delete the file
        } catch (error) {
            console.log('Image file not found:', error);
        }

        await medicine.deleteOne();

        res.status(200).json({
            success: true,
            message: "Obat berhasil dihapus",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat menghapus obat",
            error: error.message
        });
    }
});