import express from "express";

import {
  acceptOrderController,
  cancelOrderController,
  getInternalOrderDetailController,
  getInternalOrdersController,
  markOrderServedController,
} from "./internalOrder.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("OWNER", "CASHIER"));

router.get("/orders", getInternalOrdersController);
router.get("/orders/:id", getInternalOrderDetailController);
router.patch("/orders/:id/accept", acceptOrderController);
router.patch("/orders/:id/served", markOrderServedController);
router.patch("/orders/:id/cancel", cancelOrderController);

export default router;
