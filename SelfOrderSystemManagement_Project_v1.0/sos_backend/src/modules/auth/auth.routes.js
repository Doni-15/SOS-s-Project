import express from "express";

import {
  loginController,
  logoutController,
  meController,
} from "./auth.controller.js";
import { authenticate } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginController);
router.get("/me", authenticate, meController);
router.post("/logout", authenticate, logoutController);

export default router;
