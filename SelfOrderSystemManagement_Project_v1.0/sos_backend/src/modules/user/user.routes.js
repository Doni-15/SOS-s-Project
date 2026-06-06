import express from "express";

import {
  activateUserController,
  createUserController,
  deactivateUserController,
  getUserDetailController,
  getUsersController,
  resetUserPasswordController,
  updateUserController,
} from "./user.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/users", authorizeRoles("OWNER"), getUsersController);
router.post("/users", authorizeRoles("OWNER"), createUserController);
router.get("/users/:id", authorizeRoles("OWNER"), getUserDetailController);
router.patch("/users/:id", authorizeRoles("OWNER"), updateUserController);
router.patch(
  "/users/:id/password",
  authorizeRoles("OWNER"),
  resetUserPasswordController
);
router.patch(
  "/users/:id/activate",
  authorizeRoles("OWNER"),
  activateUserController
);
router.patch(
  "/users/:id/deactivate",
  authorizeRoles("OWNER"),
  deactivateUserController
);

export default router;
