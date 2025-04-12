import express from "express";
import {
  getAllMateriau,
  getMateriauByID,
  createMateriau,
  updateMateriau,
  deleteMateriau,
  getMateriauBySearch,
  getMateriauStock
} from "../controllers/materiau.controller.js";
import {
  verifyToken,
  checkRole,
  checkTenantAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);
router.use(checkTenantAccess);

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

export default router;