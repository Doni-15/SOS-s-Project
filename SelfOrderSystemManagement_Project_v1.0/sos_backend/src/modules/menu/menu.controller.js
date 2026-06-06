import { successResponse } from "../../common/responses/apiResponse.js";
import {
  createMenuItemSchema,
  menuItemQuerySchema,
  updateMenuItemSchema,
} from "./menu.validation.js";
import {
  addMenuItem,
  editMenuItem,
  getMenuCategories,
  getMenuItemById,
  getMenuItems,
  removeMenuItem,
} from "./menu.service.js";

export const getMenuCategoriesController = async (req, res, next) => {
  try {
    const categories = await getMenuCategories();

    return successResponse(res, {
      message: "Menu categories retrieved successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemsController = async (req, res, next) => {
  try {
    const query = menuItemQuerySchema.parse(req.query);
    const menuItems = await getMenuItems(query);

    return successResponse(res, {
      message: "Menu items retrieved successfully",
      data: {
        menuItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemDetailController = async (req, res, next) => {
  try {
    const menuItem = await getMenuItemById(req.params.id);

    return successResponse(res, {
      message: "Menu item retrieved successfully",
      data: {
        menuItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItemController = async (req, res, next) => {
  try {
    const payload = createMenuItemSchema.parse(req.body);

    const menuItem = await addMenuItem({
      payload,
      user: req.user,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Menu item created successfully",
      data: {
        menuItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItemController = async (req, res, next) => {
  try {
    const payload = updateMenuItemSchema.parse(req.body);

    const menuItem = await editMenuItem({
      id: req.params.id,
      payload,
      user: req.user,
    });

    return successResponse(res, {
      message: "Menu item updated successfully",
      data: {
        menuItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItemController = async (req, res, next) => {
  try {
    const menuItem = await removeMenuItem({
      id: req.params.id,
      user: req.user,
    });

    return successResponse(res, {
      message: "Menu item deactivated successfully",
      data: {
        menuItem,
      },
    });
  } catch (error) {
    next(error);
  }
};
