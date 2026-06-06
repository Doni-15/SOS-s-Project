import { prisma } from "../../config/prisma.js";

export const findMenuCategories = async () => {
  return prisma.menuCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { name: "asc" },
    ],
  });
};

export const findCategoryById = async (categoryId) => {
  return prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      isActive: true,
    },
  });
};

export const findMenuItemById = async (id) => {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
};

export const findMenuItems = async ({
  name,
  categoryId,
  availabilityStatus,
  isActive,
}) => {
  return prisma.menuItem.findMany({
    where: {
      ...(name
        ? {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(availabilityStatus ? { availabilityStatus } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
    include: {
      category: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { name: "asc" },
    ],
  });
};

export const findMenuItemByNameAndCategory = async ({ name, categoryId }) => {
  return prisma.menuItem.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      categoryId,
    },
  });
};

export const createMenuItem = async (data) => {
  return prisma.menuItem.create({
    data,
    include: {
      category: true,
    },
  });
};

export const updateMenuItem = async ({ id, data }) => {
  return prisma.menuItem.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
};

export const softDeleteMenuItem = async (id) => {
  return prisma.menuItem.update({
    where: { id },
    data: {
      isActive: false,
      availabilityStatus: "OUT_OF_STOCK",
    },
    include: {
      category: true,
    },
  });
};
