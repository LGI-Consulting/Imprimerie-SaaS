import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import {
  createCategorie,
  getAllCategories,
  updateCategorie,
  deleteCategorie,
  getStatistiquesCategories
} from '../controllers/categoriesDepenses.controller.js';

const router = express.Router();

// Routes protégées par le rôle 'admin'
router.post('/', checkRole(['admin']), createCategorie);
router.get('/', checkRole(['admin', 'caisse']), getAllCategories);
router.put('/:id', checkRole(['admin']), updateCategorie);
router.delete('/:id', checkRole(['admin']), deleteCategorie);
router.get('/statistiques', checkRole(['admin']), getStatistiquesCategories);

export default router; 