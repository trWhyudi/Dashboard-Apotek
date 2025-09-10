import User from "../models/userModel.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { errorHandleMiddleware } from "../middleware/errorHandleMiddleware.js";
import { jsontoken } from "../utils/token.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { deleteFile } from "../middleware/upload.js";

// Create/Register admin
export const createAdmin = errorHandleMiddleware(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Semua field harus diisi", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email sudah terdaftar", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "Admin",
    });

    jsontoken(user, "Admin berhasil dibuat", 201, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat admin",
      error: error.message,
    });
  }
});

// Login user and admin
export const loginUser = errorHandleMiddleware(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email dan password harus diisi", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Email atau password salah", 401));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Email atau password salah", 401));
  }

  jsontoken(user, "Login berhasil", 200, res);
});

// Get admin by ID
export const getSingleAdmin = errorHandleMiddleware(async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "Admin") {
      return next(new ErrorHandler("Admin tidak ditemukan", 404));
    }

    res.status(200).json({
      success: true,
      message: "Admin ditemukan",
      admin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil admin",
      error: error.message,
    });
  }
});

// Get admin profile
export const getAdminProfile = errorHandleMiddleware(async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== "Admin") {
      return next(new ErrorHandler("Admin tidak ditemukan", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profil admin ditemukan",
      admin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil profil admin",
      error: error.message,
    });
  }
});

// Create/register user
export const createUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Semua field harus diisi", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email sudah terdaftar", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    jsontoken(user, "User berhasil dibuat", 201, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat user",
      error: error.message,
    });
  }
});

// Get current user
export const getCurrentUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("Pengguna tidak ditemukan", 404));
    }

    res.status(200).json({
      success: true,
      message: "Pengguna ditemukan",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil pengguna",
      error: error.message,
    });
  }
});

// Get all users
export const getAllUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Semua pengguna ditemukan",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil semua pengguna",
      error: error.message,
    });
  }
});

// Update user
export const updateUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("Pengguna tidak ditemukan", 404));
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (req.body.removeAvatar) {
      deleteFile(user.avatar);
      user.avatar = null;
    } else if (req.file) {
      deleteFile(user.avatar);
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Pengguna berhasil diperbarui",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui pengguna",
      error: error.message,
    });
  }
});

export const updateUserRole = errorHandleMiddleware(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role) {
    return next(new ErrorHandler("Role harus diisi", 400));
  }

  const allowedRoles = ["Admin", "Kasir"];
  if (!allowedRoles.includes(role)) {
    return next(new ErrorHandler("Role tidak valid", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("Pengguna tidak ditemukan", 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Role pengguna berhasil diperbarui",
    user,
  });
});

// Delete user
export const deleteUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return next(new ErrorHandler("Akses ditolak", 403));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User tidak ditemukan", 404));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Gagal menghapus user", 500));
  }
});

// Logout user
export const logoutUser = errorHandleMiddleware(async (req, res, next) => {
  try {
    let cookieName;
    if (req.user.role === "Admin") cookieName = "adminToken";
    else if (req.user.role === "Kasir") cookieName = "kasirToken";
    else cookieName = "token";

    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat logout",
      error: error.message,
    });
  }
});

// Lupa password
export const forgotPassword = errorHandleMiddleware(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User tidak ditemukan dengan email ini", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
            <h2 style="color: #1E90FF; margin-bottom: 10px;">Reset Password Akun Anda</h2>
            </div>

            <p style="font-size: 16px; color: #333;">Halo <strong>${user.name}</strong>,</p>
            <p style="font-size: 15px; color: #555;">
            Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk melanjutkan proses reset:
            </p>

            <div style="text-align: center; margin: 30px 0;">
            <a href="${resetPasswordUrl}" style="background-color: #1E90FF; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Reset Password
            </a>
            </div>

            <p style="font-size: 14px; color: #777;">
            Link ini hanya berlaku selama <strong>15 menit</strong> untuk alasan keamanan. Jika Anda tidak meminta reset ini, Anda bisa mengabaikan email ini dan tidak ada perubahan yang akan dilakukan.
            </p>

            <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;" />

            <p style="font-size: 13px; color: #999; text-align: center;">
            © 2025 Apoteku – Semua Hak Dilindungi.
            </p>
        </div>
    `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      text: `Reset password link: ${resetPasswordUrl}`,
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: `Email reset password telah dikirim ke ${user.email}`,
    });
  } catch (error) {
    console.error("Email send error:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Gagal mengirim email", 500));
  }
});

// Reset password
export const resetPassword = errorHandleMiddleware(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Token reset tidak valid atau kadaluarsa", 400)
    );
  }

  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(new ErrorHandler("Password minimal 6 karakter", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password berhasil diubah",
  });
});
