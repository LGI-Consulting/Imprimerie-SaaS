import express from 'express';
import * as tenantController from '../controllers/tenant.controller.js';
import { verifyToken, checksadmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tenant management routes
router.get('/',tenantController.getAllTenants);
router.get('/:id',checksadmin, verifyToken,tenantController.getTenantById);
router.put('/:id',checksadmin, verifyToken,tenantController.updateTenant);
router.patch('/:id/toggle-status',checksadmin, verifyToken,tenantController.toggleTenantStatus);
router.get('/:id/stats',checksadmin, verifyToken,tenantController.getTenantStats);

export default router;