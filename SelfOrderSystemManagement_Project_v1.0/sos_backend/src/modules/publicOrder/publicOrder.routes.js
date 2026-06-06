import express from "express";

import {
  getPublicMenuController,
  submitCustomerOrderController,
  validateQrTokenController,
} from "./publicOrder.controller.js";

const router = express.Router();

router.post("/qr/validate", validateQrTokenController);
router.get("/menu", getPublicMenuController);
router.post("/orders", submitCustomerOrderController);

export default router;
