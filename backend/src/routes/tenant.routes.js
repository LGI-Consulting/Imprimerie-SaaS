import express from 'express';
import * as tenantController from '../controllers/tenant.controller.js';
import { verifyToken, checksadmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply super admin check to all routes
router.use(verifyToken, checksadmin);

// Tenant management routes
router.get('/', tenantController.getAllTenants);
router.get('/:id', tenantController.getTenantById);
router.put('/:id', tenantController.updateTenant);
router.patch('/:id/toggle-status', tenantController.toggleTenantStatus);
router.get('/:id/stats', tenantController.getTenantStats);

export default router;