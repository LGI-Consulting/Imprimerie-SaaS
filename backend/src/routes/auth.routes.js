import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, checksadmin, checkTenantAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 💥 Anti brute-force : limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    success: false,
    message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes employés des tenants
router.post('/register', verifyToken, checkTenantAdmin, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

// Super Admin
router.post('/super-admin/login', loginLimiter, authController.sadminLogin);
// Added middleware for authentication on super admin creation
router.post('/super-admin/create', verifyToken, checksadmin, authController.createsadmin);

// Tenant
router.post('/tenant/register', verifyToken, checksadmin, authController.registerTenant);
router.post('/tenant/admin/register', verifyToken, checksadmin, authController.registerTenantAdmin);

// 🔄 Refresh token route
router.post('/token/refresh', authController.refreshToken);

export default router;