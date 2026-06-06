import express from "express";

import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";
import { uploadMenuImageController } from "./upload.controller.js";
import { menuImageUploadMiddleware } from "./upload.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/uploads/menu-image",
  authorizeRoles("OWNER", "CASHIER"),
  menuImageUploadMiddleware,
  uploadMenuImageController
);

export default router;
