import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import  authMid from '../middlewares/auth.middleware.js';

// Route d'enregistrement (accessible uniquement aux administrateurs)
router.post('/register', authMid.verifyToken, authMid.checkRole(['admin']), authController.register);

// Route de connexion (accessible à tous)
router.post('/login', authController.login);

// Route de déconnexion (accessible aux utilisateurs connectés)
router.post('/logout', authMid.verifyToken, authController.logout);

// Route pour obtenir le profil (accessible aux utilisateurs connectés)
router.get('/profile', authMid.verifyToken, authController.getProfile);

export default router