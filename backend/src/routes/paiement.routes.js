import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getAllFactures,
  getFactureById,
  updateFacture,
  deleteFacture,
  getCommandePaymentDetails
} from "../controllers/paiement.controller.js"
import {
  verifyToken, 
  checkRole,
} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.use(verifyToken);

// Route pour obtenir les détails de paiement d'une commande
router.get('/commande/:commandeId/details', checkRole(["caisse", "admin"]), getCommandePaymentDetails);

router.post('/',checkRole(["caisse", "admin"]), createPayment);
router.get('/',checkRole(["caisse", "admin"]), getAllPayments);
router.get('/:id',checkRole(["caisse", "admin"]), getPaymentById);
router.put('/:id',checkRole(["caisse", "admin"]), updatePayment);
router.delete('/:id',checkRole(["admin"]), deletePayment);

router.get('/facture',checkRole(["caisse", "admin"]), getAllFactures);
router.get('/facture/:id',checkRole(["caisse", "admin"]), getFactureById);
router.put('/facture/:id',checkRole(["caisse", "admin"]), updateFacture);
router.delete('/facture/:id',checkRole(["admin"]), deleteFacture);

export default router;
