import { prisma } from "../../config/prisma.js";

export const findTransactionsForReport = async ({ startDate, endDate }) => {
  return prisma.transaction.findMany({
    where: {
      ...(startDate || endDate
        ? {
            transactionTime: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lt: endDate } : {}),
            },
          }
        : {}),
    },
    include: {
      cashier: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
      receipt: true,
      order: {
        include: {
          table: true,
          orderItems: true,
        },
      },
    },
    orderBy: {
      transactionTime: "asc",
    },
  });
};
