import express from "express";

import {
  getAuditLogDetailController,
  getAuditLogsController,
} from "./auditLog.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/audit-logs",
  authorizeRoles("OWNER"),
  getAuditLogsController
);
router.get(
  "/audit-logs/:id",
  authorizeRoles("OWNER"),
  getAuditLogDetailController
);

export default router;
