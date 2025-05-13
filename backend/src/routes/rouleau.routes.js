import express from "express";
import {
  createRouleau,
  getAllRouleaux,
  getRouleauById,
  getRouleauxByMateriauAndLargeur,
  updateRouleauLongueur,
} from "../controllers/rouleau.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes pour les rouleaux
router.post(
  "/",
  checkRole(["admin", "accueil"]),
  createRouleau
);

router.get(
  "/",
  checkRole(["admin", "accueil", "graphiste"]),
  getAllRouleaux
);

router.get(
  "/:id",
  checkRole(["admin", "accueil", "graphiste"]),
  getRouleauById
);

router.get(
  "/materiau/:materiau_id/largeur/:largeur",
  checkRole(["admin", "accueil", "graphiste"]),
  getRouleauxByMateriauAndLargeur
);

router.patch(
  "/:id/longueur",
  checkRole(["admin", "accueil", "graphiste"]),
  updateRouleauLongueur
);

export default router; 