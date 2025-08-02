import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { errorHandleMiddleware } from "../middlewares/errorMiddleware.js";

export const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.adminToken || 
    req.cookies.pelannganToken ||
    req.cookies.apotekerToken;

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

// Middleware for Admin Role
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

export const apotekerTokenAuth = errorHandleMiddleware(async (req, res, next) => {
    const token = req.cookies.apotekerToken;
    if (!token) {
        return next(new ErrorHandler("Apoteker tidak terautentikasi", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user || req.user.role !== "Apoteker") {
            return next(new ErrorHandler("User tidak diizinkan", 403));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
});

// Middleware for Pelanggan Role
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
