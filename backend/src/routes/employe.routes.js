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
  checkAdmin,  
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);
router.use(checkAdmin)

// Routes employés avec vérification des rôles appropriés
// Seuls les admins peuvent voir et gérer les employés
router.get('/', getAllEmployes);
router.get('/search', getEmployeBySearch);
router.get('/:id', getEmployeById);
router.get('/:id/activities', getEmployeActivities);

// Opérations de création/modification réservées aux admins
router.post('/', createEmploye);
router.put('/:id', updateEmploye);
router.put('/:id/status', changeEmployeStatus);

// Suppression réservée aux admins uniquement
router.delete('/:id', deleteEmploye);

export default router;