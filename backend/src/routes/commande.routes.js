// routes/commande.routes.js
import express from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrdersByClient,
  getOrdersByStatus,
  getOrdersByMaterial,
} from '../controllers/commande.controller.js';
import { 
  verifyToken, 
  checkRole, 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes commandes avec vérification des rôles appropriés
// Liste des commandes accessible à tous les utilisateurs authentifiés
router.get('/', checkRole(['accueil', 'admin']), getAllOrders);
router.get('/client/:clientId', checkRole(['accueil', 'admin']), getOrdersByClient);
router.get('/status/:status', checkRole(['accueil', 'admin']), getOrdersByStatus);
router.get('/material/:materialType', checkRole(['accueil', 'admin']), getOrdersByMaterial);
router.get('/:id', checkRole(['accueil', 'admin']), getOrderById);

// Création et manipulation des commandes réservées aux utilisateurs avec rôles spécifiques
router.post('/', checkRole(['accueil', 'admin']), createOrder);
router.put('/:id', checkRole(['accueil', 'admin']), updateOrder);
router.delete('/:id', checkRole(['admin']), deleteOrder);

export default router;