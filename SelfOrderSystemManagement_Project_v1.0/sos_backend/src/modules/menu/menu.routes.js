import express from "express";

import {
  createMenuCategoryController,
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
router.post(
  "/menu-categories",
  authorizeRoles("OWNER"),
  createMenuCategoryController
);

router.get("/menu-items", getMenuItemsController);
router.get("/menu-items/:id", getMenuItemDetailController);

router.post("/menu-items", authorizeRoles("OWNER"), createMenuItemController);

router.patch("/menu-items/:id", authorizeRoles("OWNER", "CASHIER"), updateMenuItemController);

router.delete("/menu-items/:id", authorizeRoles("OWNER"), deleteMenuItemController);

export default router;
