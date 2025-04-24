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
  deleteFacture
} from "../controllers/paiement.controller.js"
import {
  verifyToken, 
  checkRole,
} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.use(verifyToken);

router.post('/paiement',checkRole(["caisse", "admin"]), createPayment);
router.get('/paiement',checkRole(["caisse", "admin"]), getAllPayments);
router.get('/paiement/:id',checkRole(["caisse", "admin"]), getPaymentById);
router.put('/paiement/:id',checkRole(["caisse", "admin"]), updatePayment);
router.delete('/paiement/:id',checkRole(["admin"]), deletePayment);

router.get('/facture',checkRole(["caisse", "admin"]), getAllFactures);
router.get('/facture/:id',checkRole(["caisse", "admin"]), getFactureById);
router.put('/facture/:id',checkRole(["caisse", "admin"]), updateFacture);
router.delete('/facture/:id',checkRole(["admin"]), deleteFacture);

export default router;
