import express from "express";

import {
  activateTableController,
  createTableController,
  deactivateTableController,
  generateTableQrTokenController,
  getTableDetailController,
  getTableQrTokensController,
  getTablesController,
  revokeQrTokenController,
  updateTableController,
} from "./table.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/tables", authorizeRoles("OWNER", "CASHIER"), getTablesController);
router.get(
  "/tables/:id",
  authorizeRoles("OWNER", "CASHIER"),
  getTableDetailController
);

router.post("/tables", authorizeRoles("OWNER"), createTableController);
router.patch("/tables/:id", authorizeRoles("OWNER"), updateTableController);
router.patch(
  "/tables/:id/activate",
  authorizeRoles("OWNER"),
  activateTableController
);
router.patch(
  "/tables/:id/deactivate",
  authorizeRoles("OWNER"),
  deactivateTableController
);

router.get(
  "/tables/:id/qr-tokens",
  authorizeRoles("OWNER"),
  getTableQrTokensController
);
router.post(
  "/tables/:id/qr-tokens",
  authorizeRoles("OWNER"),
  generateTableQrTokenController
);
router.patch(
  "/qr-tokens/:id/revoke",
  authorizeRoles("OWNER"),
  revokeQrTokenController
);

export default router;
