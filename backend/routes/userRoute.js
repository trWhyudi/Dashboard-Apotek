import express from 'express';
import { createUser, loginUser, createAdmin, getSingleAdmin, getAdminProfile, logOutAdmin, getCurrentUser, getAllUser, updateUser, deleteUser, forgotPassword, resetPassword } from '../controllers/userController.js';
import { adminTokenAuth, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// create admin
router.post('/create-admin', adminTokenAuth, createAdmin);
// Login
router.post('/login-user', loginUser);
// get single admin
router.get('/single-admin/:id', adminTokenAuth, getSingleAdmin);
// get admin profile
router.get('/admin-profile', isAuthenticated, adminTokenAuth, getAdminProfile);
// Logout admin
router.get('/logout-admin', isAuthenticated, adminTokenAuth, logOutAdmin);
// Create user
router.post('/create-user', createUser);
// get current user
router.get('/me', isAuthenticated, getCurrentUser);
// get all users
router.get('/all-users', isAuthenticated, getAllUser);
// Update user
router.put("/update-user/:id", isAuthenticated, updateUser);
// Delete user
router.delete("/delete-user/:id", isAuthenticated, deleteUser);
// Lupa password
router.post("/forgot-password", forgotPassword);
// reset password
router.put("/reset-password/:token", resetPassword);


export default router;
