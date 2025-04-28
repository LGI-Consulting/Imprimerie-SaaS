import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import {
  createRemise,
  getAllRemises,
  getRemiseById,
  getRemiseByCode,
  updateRemise,
  deleteRemise,
  verifyRemiseCode,
  getRemisesByClient
} from '../controllers/remise.controller.js';

const router = express.Router();

// Routes protégées par authentification et rôle
router.post('/', checkRole(['admin', 'caisse']), createRemise);
router.get('/', checkRole(['admin', 'caisse']), getAllRemises);
router.get('/code/:code', checkRole(['admin', 'caisse']), getRemiseByCode);
router.get('/:id', checkRole(['admin', 'caisse']), getRemiseById);
router.put('/:id', checkRole(['admin', 'caisse']), updateRemise);
router.delete('/:id', checkRole(['admin']), deleteRemise);

// Route publique pour vérifier un code de remise
router.get('/verifier/:code', verifyRemiseCode);

// Route pour obtenir les remises d'un client
router.get('/client/:clientId', checkRole(['admin', 'caisse']), getRemisesByClient);

export default router; 