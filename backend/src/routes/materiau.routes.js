import express from "express";
import {
  getAllMateriau,
  getMateriauByID,
  createMateriau,
  updateMateriau,
  deleteMateriau,
  getMateriauBySearch,
  getMateriauStock,
  getStockById,
  createMouvementStock,
  getMouvementsStock
} from "../controllers/materiau.controller.js";
import {
  verifyToken,
  checkRole,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes de consultation des matériaux
router.get("/", checkRole(["accueil", "admin", "graphiste"]), getAllMateriau);
router.get("/search", checkRole(["accueil", "admin", "graphiste"]), getMateriauBySearch);
router.get("/stock/low", checkRole(["accueil", "admin", "graphiste"]), getMateriauStock);
router.get("/:id", checkRole(["accueil", "admin", "graphiste"]), getMateriauByID);

// Opérations de création/modification
router.post("/", checkRole(["accueil", "admin", "graphiste"]), createMateriau);
router.put("/:id", checkRole(["accueil", "admin", "graphiste"]), updateMateriau);

// Suppression réservée aux admins uniquement
router.delete("/:id", checkRole(["admin"]), deleteMateriau);

// Nouvelles routes pour les mouvements de stock
router.get("/stock/:stockId", checkRole(["accueil", "admin", "graphiste"]), getStockById);
router.post("/stock/mouvement", checkRole(["accueil", "admin", "graphiste"]), createMouvementStock);
router.get("/stock/:stockId/mouvements", checkRole(["accueil", "admin", "graphiste"]), getMouvementsStock);

export default router;