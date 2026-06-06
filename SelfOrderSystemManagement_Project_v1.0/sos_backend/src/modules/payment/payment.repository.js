import { prisma } from "../../config/prisma.js";

export const findOrderForPayment = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      table: true,
      orderItems: true,
      transaction: true,
    },
  });
};

export const findTransactions = async ({ limit }) => {
  return prisma.transaction.findMany({
    include: {
      order: {
        include: {
          table: true,
          orderItems: true,
        },
      },
      cashier: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
      receipt: true,
    },
    orderBy: {
      transactionTime: "desc",
    },
    take: limit,
  });
};

export const findTransactionById = async (id) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          table: true,
          orderItems: true,
        },
      },
      cashier: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
      receipt: true,
    },
  });
};

export const findReceiptById = async (id) => {
  return prisma.receipt.findUnique({
    where: { id },
    include: {
      transaction: {
        include: {
          cashier: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          order: {
            include: {
              table: true,
              orderItems: true,
            },
          },
        },
      },
      printAttempts: {
        orderBy: {
          attemptedAt: "desc",
        },
      },
    },
  });
};
