import express from 'express';
import { 
  getAllEmployes, 
  getEmployeById, 
  createEmploye, 
  updateEmploye, 
  deleteEmploye,
  getEmployeBySearch,
  changeEmployeStatus,
  getEmployeActivities
} from '../controllers/employe.controller.js';
import { 
  verifyToken, 
  checkRole, 
  checkTenantAccess 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);
router.use(checkTenantAccess);

// Routes employés avec vérification des rôles appropriés
// Seuls les admins peuvent voir et gérer les employés
router.get('/', checkRole(['admin']), getAllEmployes);
router.get('/search', checkRole(['admin']), getEmployeBySearch);
router.get('/:id', checkRole(['admin']), getEmployeById);
router.get('/:id/activities', checkRole(['admin']), getEmployeActivities);

// Opérations de création/modification réservées aux admins
router.post('/', checkRole(['admin']), createEmploye);
router.put('/:id', checkRole(['admin']), updateEmploye);
router.put('/:id/status', checkRole(['admin']), changeEmployeStatus);

// Suppression réservée aux admins uniquement
router.delete('/:id', checkRole(['admin']), deleteEmploye);

export default router;