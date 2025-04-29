// routes/commande.routes.js
import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByClient,
  getOrdersByStatus,
  getOrderBySituationPaiement,
  getOrdersByMaterial,
} from "../controllers/commande.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import {
  uploadMiddleware,
  handleMulterErrors,
} from "../middlewares/upload.middleware.js";

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(verifyToken);

// Routes commandes avec vérification des rôles appropriés
// Liste des commandes accessible à tous les utilisateurs authentifiés
router.get("/", checkRole(["accueil", "admin"]), getAllOrders);
router.get(
  "/client/:clientId",
  checkRole(["accueil", "admin"]),
  getOrdersByClient
);
router.get(
  "/status/:status",
  checkRole(["accueil", "admin"]),
  getOrdersByStatus
);
router.get(
  "/situation_paiement/:situationPaiement",
  checkRole(["accueil", "admin"]),
  getOrderBySituationPaiement
);

router.get(
  "/material/:materialType",
  checkRole(["accueil", "admin"]),
  getOrdersByMaterial
);
router.get("/:id", checkRole(["accueil", "admin"]), getOrderById);

// Routes avec gestion des uploads de fichiers
router.post(
  "/",
  checkRole(["accueil", "admin"]),
  uploadMiddleware.array("files", 5),
  createOrder
);
router.put(
  "/:id",
  checkRole(["accueil", "admin"]),
  uploadMiddleware.array("files", 5),
  updateOrder
);

// Route de suppression (sans besoin de multer)
router.delete("/:id", checkRole(["admin"]), deleteOrder);

// Gestionnaire d'erreurs pour Multer
router.use(handleMulterErrors);

export default router;
