import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  createMenuCategory,
  createMenuItem,
  findCategoryById,
  findCategoryByName,
  findMenuCategories,
  findMenuItemById,
  findMenuItemByNameAndCategory,
  findMenuItems,
  softDeleteMenuItem,
  updateMenuItem,
} from "./menu.repository.js";

const toCategoryResponse = (category) => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

const toMenuItemResponse = (item) => {
  return {
    id: item.id,
    categoryId: item.categoryId,
    category: item.category
      ? {
          id: item.category.id,
          name: item.category.name,
        }
      : null,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.imageUrl,
    availabilityStatus: item.availabilityStatus,
    isActive: item.isActive,
    displayOrder: item.displayOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const getMenuCategories = async () => {
  const categories = await findMenuCategories();
  return categories.map(toCategoryResponse);
};

export const addMenuCategory = async ({ payload, user }) => {
  const duplicate = await findCategoryByName(payload.name);

  if (duplicate) {
    throw new AppError({
      statusCode: 409,
      code: "MENU_CATEGORY_ALREADY_EXISTS",
      message: "Menu category with the same name already exists",
    });
  }

  const createdCategory = await createMenuCategory({
    name: payload.name,
    description: payload.description ?? null,
    displayOrder: payload.displayOrder,
    isActive: payload.isActive,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "MENU_CATEGORY_CREATED",
      entityType: "menu_category",
      entityId: createdCategory.id,
      metadata: {
        name: createdCategory.name,
        displayOrder: createdCategory.displayOrder,
        isActive: createdCategory.isActive,
      },
    },
  });

  return toCategoryResponse(createdCategory);
};

export const getMenuItems = async (query) => {
  const items = await findMenuItems(query);
  return items.map(toMenuItemResponse);
};

export const getMenuItemById = async (id) => {
  const item = await findMenuItemById(id);

  if (!item) {
    throw new AppError({
      statusCode: 404,
      code: "MENU_ITEM_NOT_FOUND",
      message: "Menu item not found",
    });
  }

  return toMenuItemResponse(item);
};

export const addMenuItem = async ({ payload, user }) => {
  const category = await findCategoryById(payload.categoryId);

  if (!category) {
    throw new AppError({
      statusCode: 404,
      code: "CATEGORY_NOT_FOUND",
      message: "Menu category not found",
    });
  }

  const duplicate = await findMenuItemByNameAndCategory({
    name: payload.name,
    categoryId: payload.categoryId,
  });

  if (duplicate) {
    throw new AppError({
      statusCode: 409,
      code: "MENU_ITEM_ALREADY_EXISTS",
      message: "Menu item with the same name already exists in this category",
    });
  }

  const createdItem = await createMenuItem({
    categoryId: payload.categoryId,
    name: payload.name,
    description: payload.description ?? null,
    price: payload.price,
    imageUrl: payload.imageUrl ?? null,
    availabilityStatus: payload.availabilityStatus,
    displayOrder: payload.displayOrder,
    isActive: true,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "MENU_ITEM_CREATED",
      entityType: "menu_item",
      entityId: createdItem.id,
      metadata: {
        name: createdItem.name,
        categoryId: createdItem.categoryId,
        price: Number(createdItem.price),
      },
    },
  });

  return toMenuItemResponse(createdItem);
};

export const editMenuItem = async ({ id, payload, user }) => {
  const existingItem = await findMenuItemById(id);

  if (!existingItem) {
    throw new AppError({
      statusCode: 404,
      code: "MENU_ITEM_NOT_FOUND",
      message: "Menu item not found",
    });
  }

  if (payload.categoryId) {
    const category = await findCategoryById(payload.categoryId);

    if (!category) {
      throw new AppError({
        statusCode: 404,
        code: "CATEGORY_NOT_FOUND",
        message: "Menu category not found",
      });
    }
  }

  const nextCategoryId = payload.categoryId ?? existingItem.categoryId;
  const nextName = payload.name ?? existingItem.name;

  if (payload.name || payload.categoryId) {
    const duplicate = await findMenuItemByNameAndCategory({
      name: nextName,
      categoryId: nextCategoryId,
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError({
        statusCode: 409,
        code: "MENU_ITEM_ALREADY_EXISTS",
        message: "Menu item with the same name already exists in this category",
      });
    }
  }

  const updatedItem = await updateMenuItem({
    id,
    data: {
      ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.availabilityStatus !== undefined
        ? { availabilityStatus: payload.availabilityStatus }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      ...(payload.displayOrder !== undefined
        ? { displayOrder: payload.displayOrder }
        : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "MENU_ITEM_UPDATED",
      entityType: "menu_item",
      entityId: updatedItem.id,
      metadata: {
        name: updatedItem.name,
        categoryId: updatedItem.categoryId,
        price: Number(updatedItem.price),
        availabilityStatus: updatedItem.availabilityStatus,
        isActive: updatedItem.isActive,
      },
    },
  });

  return toMenuItemResponse(updatedItem);
};

export const removeMenuItem = async ({ id, user }) => {
  const existingItem = await findMenuItemById(id);

  if (!existingItem) {
    throw new AppError({
      statusCode: 404,
      code: "MENU_ITEM_NOT_FOUND",
      message: "Menu item not found",
    });
  }

  const deletedItem = await softDeleteMenuItem(id);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "MENU_ITEM_DEACTIVATED",
      entityType: "menu_item",
      entityId: deletedItem.id,
      metadata: {
        name: deletedItem.name,
        categoryId: deletedItem.categoryId,
      },
    },
  });

  return toMenuItemResponse(deletedItem);
};
