import { prisma } from "../../config/prisma.js";
import {
  ORDER_LIST_INCLUDE,
  ORDER_RESPONSE_INCLUDE,
} from "../../common/repositories/order.includes.js";

export const findOrders = async ({
  status,
  tableNumber,
  page = 1,
  limit = 50,
} = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const skip = (safePage - 1) * safeLimit;

  const where = {
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
  };

  return prisma.order.findMany({
    where,
    include: ORDER_LIST_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: safeLimit,
  });
};


export const findOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: ORDER_RESPONSE_INCLUDE,
  });
};
