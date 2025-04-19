import express from 'express';
import * as tenantController from '../controllers/tenant.controller.js';
import { verifyToken, checksadmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply super admin check to all routes
router.use(verifyToken);

// Tenant management routes
router.get('/',tenantController.getAllTenants);
router.get('/:id',checksadmin, tenantController.getTenantById);
router.put('/:id',checksadmin, tenantController.updateTenant);
router.patch('/:id/toggle-status',checksadmin, tenantController.toggleTenantStatus);
router.get('/:id/stats',checksadmin, tenantController.getTenantStats);

export default router;