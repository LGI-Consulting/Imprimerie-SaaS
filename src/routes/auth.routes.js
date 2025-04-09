import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, checkRole, checkSuperAdmin, checkTenantAdmin } from '../middlewares/auth.middleware.js';

// Routes pour les employés des tenants
router.post('/register', verifyToken, checkTenantAdmin, authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

// Routes pour les opérations Super Admin
router.post('/super-admin/login', authController.superAdminLogin);
router.post('/super-admin/create', authController.createSuperAdmin);

// Routes pour la gestion des tenants (réservées aux super admins)
router.post('/tenant/register', verifyToken, checkSuperAdmin, authController.registerTenant);
router.post('/tenant/admin/register', verifyToken, checkSuperAdmin, authController.registerTenantAdmin);

export default router;