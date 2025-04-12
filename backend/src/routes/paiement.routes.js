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
  checkTenantAccess
} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.use(verifyToken);
router.use(checkTenantAccess);

router.post('/pay',checkRole(["caisse", "admin"]), createPayment);
router.get('/pay',checkRole(["caisse", "admin"]), getAllPayments);
router.get('/pay/:id',checkRole(["caisse", "admin"]), getPaymentById);
router.put('/pay/:id',checkRole(["caisse", "admin"]), updatePayment);
router.delete('/getPay/:id',checkRole(["admin"]), deletePayment);

router.get('/invoice',checkRole(["caisse", "admin"]), getAllFactures);
router.get('/invoice/:id',checkRole(["caisse", "admin"]), getFactureById);
router.put('/invoice/:id',checkRole(["caisse", "admin"]), updateFacture);
router.delete('/invoice/:id',checkRole(["admin"]), deleteFacture);

export default router;
