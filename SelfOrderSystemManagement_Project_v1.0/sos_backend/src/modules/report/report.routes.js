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

router.get("/sales-summary", getSalesSummaryController);
router.get("/daily-sales", getDailySalesController);
router.get("/top-menu-items", getTopMenuItemsController);

export default router;
