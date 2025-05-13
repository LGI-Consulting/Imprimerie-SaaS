import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import {
  ouvrirCaisse,
  fermerCaisse,
  enregistrerMouvement,
  getHistoriqueMouvements,
  getSoldeCaisse
} from '../controllers/caisse.controller.js';

const router = express.Router();

// Routes protégées par le rôle 'caisse' ou 'admin'
router.post('/ouvrir', checkRole(['admin', 'caisse']), ouvrirCaisse);
router.post('/fermer', checkRole(['admin', 'caisse']), fermerCaisse);
router.post('/mouvement', checkRole(['admin', 'caisse']), enregistrerMouvement);
router.get('/:caisse_id/historique', checkRole(['admin', 'caisse']), getHistoriqueMouvements);
router.get('/:caisse_id/solde', checkRole(['admin', 'caisse']), getSoldeCaisse);

export default router; 