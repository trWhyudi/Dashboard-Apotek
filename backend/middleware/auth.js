import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { errorHandleMiddleware } from "../middleware/errorHandleMiddleware.js";

export const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.adminToken || 
    req.cookies.pelangganToken;

    if (!token) {
        return next(new ErrorHandler("User tidak terautentikasi", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorHandler("User tidak ditemukan", 404));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
}

// Middleware Admin Role
export const adminTokenAuth = errorHandleMiddleware(async (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return next(new ErrorHandler("Admin tidak terautentikasi", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user || req.user.role !== "Admin") {
            return next(new ErrorHandler("User tidak diizinkan", 403));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
});

// Middleware Pelanggan Role
export const pelangganTokenAuth = errorHandleMiddleware(async (req, res, next) => {
    const token = req.cookies.pelangganToken;
    if (!token) {
        return next(new ErrorHandler("Pelanggan tidak terautentikasi", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user || req.user.role !== "Pelanggan") {
            return next(new ErrorHandler("User tidak diizinkan", 403));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
});
