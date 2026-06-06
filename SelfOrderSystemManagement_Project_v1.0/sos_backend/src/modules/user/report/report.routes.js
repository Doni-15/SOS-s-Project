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
router.use(authorizeRoles("OWNER"));

router.get("/reports/sales-summary", getSalesSummaryController);
router.get("/reports/daily-sales", getDailySalesController);
router.get("/reports/top-menu-items", getTopMenuItemsController);

export default router;
