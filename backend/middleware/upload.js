import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const createUploadDirectories = () => {
  const directories = ["uploads/avatars", "uploads/medicines"];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest =
      file.fieldname === "avatar" ? "uploads/avatars" : "uploads/medicines";
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === "avatar" ? "avatar" : "image";
    cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB max file size
  },
});

// Helper function to delete old file
export const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

export const uploadAvatar = upload.single("avatar");
export const uploadMedicine = upload.single("image");

export default upload;
