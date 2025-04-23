import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, checkAdmin } from '../middlewares/auth.middleware.js';

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
router.post('/register', verifyToken, checkAdmin, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

// 🔄 Refresh token route
router.post('/token/refresh', authController.refreshToken);

export default router;