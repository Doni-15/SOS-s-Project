import { prisma } from "../../config/prisma.js";

const orderInclude = {
  table: true,
  orderItems: true,
  acceptedBy: {
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
    },
  },
  transaction: true,
  statusHistories: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      changedByUser: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
    },
  },
};

export const findOrders = async ({ status, tableNumber, limit }) => {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(tableNumber
        ? {
            table: {
              tableNumber: {
                equals: tableNumber,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
    include: {
      table: true,
      orderItems: true,
      acceptedBy: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
      transaction: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const findOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
};
