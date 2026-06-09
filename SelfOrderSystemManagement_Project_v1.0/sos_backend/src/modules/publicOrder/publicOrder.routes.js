import express from "express";

import {
  getCustomerOrderTrackingController,
  getPublicMenuController,
  submitCustomerOrderController,
  validateQrTokenController,
} from "./publicOrder.controller.js";

const router = express.Router();

router.post("/qr/validate", validateQrTokenController);
router.get("/menu", getPublicMenuController);
router.post("/orders", submitCustomerOrderController);
router.get("/orders/:id", getCustomerOrderTrackingController);

export default router;
