import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import {
  getRapportDepenses,
  getRapportDepensesParEmploye,
  getRapportDepensesParCategorie
} from '../controllers/rapportsDepenses.controller.js';

const router = express.Router();

// Routes protégées par le rôle 'admin'
router.get('/', checkRole(['admin']), getRapportDepenses);
router.get('/employes', checkRole(['admin']), getRapportDepensesParEmploye);
router.get('/categories', checkRole(['admin']), getRapportDepensesParCategorie);

export default router; 