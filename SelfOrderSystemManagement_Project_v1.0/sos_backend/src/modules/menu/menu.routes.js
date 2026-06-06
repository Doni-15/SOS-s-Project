import express from "express";

import {
  createMenuItemController,
  deleteMenuItemController,
  getMenuCategoriesController,
  getMenuItemDetailController,
  getMenuItemsController,
  updateMenuItemController,
} from "./menu.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("OWNER", "CASHIER"));

router.get("/menu-categories", getMenuCategoriesController);
router.get("/menu-items", getMenuItemsController);
router.get("/menu-items/:id", getMenuItemDetailController);
router.post("/menu-items", createMenuItemController);
router.patch("/menu-items/:id", updateMenuItemController);
router.delete("/menu-items/:id", deleteMenuItemController);

export default router;
