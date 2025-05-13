import express from "express";
import {
  createUtilisation,
  getUtilisationsByCommande,
  getUtilisationsStats,
} from "../controllers/utilisation.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes pour les utilisations
router.post(
  "/",
  checkRole(["admin", "graphiste"]),
  createUtilisation
);

router.get(
  "/commande/:commande_id",
  checkRole(["admin", "accueil", "graphiste"]),
  getUtilisationsByCommande
);

router.get(
  "/stocks/stats/:materiau_id",
  checkRole(["admin"]),
  getUtilisationsStats
);

export default router; 