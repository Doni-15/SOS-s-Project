import express from "express";

import {
  getDailySalesController,
  getSalesSummaryController,
  getTopMenuItemsController,
} from "./report.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/reports/sales-summary",
  authorizeRoles("OWNER"),
  getSalesSummaryController
);
router.get(
  "/reports/daily-sales",
  authorizeRoles("OWNER"),
  getDailySalesController
);
router.get(
  "/reports/top-menu-items",
  authorizeRoles("OWNER"),
  getTopMenuItemsController
);

export default router;
