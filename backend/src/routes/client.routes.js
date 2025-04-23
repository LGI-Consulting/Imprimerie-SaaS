import express from 'express';
import { 
  getAllClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient,
  getClientBySearch,
  getClientStats,
  getClientOrders
} from '../controllers/client.controller.js';
import { 
  verifyToken, 
  checkRole, 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes clients avec vérification des rôles appropriés
// Supposons que 'user', 'manager' et 'admin' peuvent voir les clients
router.get('/', checkRole(['accueil', 'admin']), getAllClients);
router.get('/search', checkRole(['accueil', 'admin']), getClientBySearch);
router.get('/:id', checkRole(['accueil', 'admin']), getClientById);
router.get('/:id/orders', checkRole(['acceuil', 'admin']), getClientOrders);
router.get('/:id/stats', checkRole(['accueil', 'admin']), getClientStats); // Statistiques réservées aux managers et admins

// Opérations de création/modification réservées aux managers et admins
router.post('/', checkRole(['accueil', 'admin']), createClient);
router.put('/:id', checkRole(['accueil', 'admin']), updateClient);

// Suppression réservée aux admins uniquement
router.delete('/:id', checkRole(['admin']), deleteClient);

export default router;