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
import upload, { parseMultipartForm, handleMulterErrors } from "../middlewares/upload.middleware.js";

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

// Création de commande avec gestion des fichiers
router.post(
  "/",
  checkRole(["accueil", "admin"]),
  upload.array("files", 5),
  parseMultipartForm,
  handleMulterErrors,
  createOrder
);

// Mise à jour de commande avec gestion des fichiers
router.put(
  "/:id",
  checkRole(["accueil", "admin"]),
  upload.array("files", 5),
  parseMultipartForm,
  handleMulterErrors,
  updateOrder
);

router.delete("/:id", checkRole(["admin"]), deleteOrder);

export default router;
