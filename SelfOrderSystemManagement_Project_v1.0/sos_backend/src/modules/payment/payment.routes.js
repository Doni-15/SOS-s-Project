import express from "express";

import {
  createPaymentController,
  getReceiptDetailController,
  getTransactionDetailController,
  getTransactionsController,
  markReceiptPrintFailedController,
  markReceiptPrintSuccessController,
} from "./payment.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("OWNER", "CASHIER"));

router.post("/orders/:id/payments", createPaymentController);

router.get("/transactions", getTransactionsController);
router.get("/transactions/:id", getTransactionDetailController);

router.patch("/receipts/:id/print-success", markReceiptPrintSuccessController);
router.patch("/receipts/:id/print-failed", markReceiptPrintFailedController);
router.get("/receipts/:id", getReceiptDetailController);

export default router;
