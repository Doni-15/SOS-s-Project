import { prisma } from "../../config/prisma.js";
import {
  ORDER_FOR_PAYMENT_INCLUDE,
  RECEIPT_RESPONSE_INCLUDE,
  TRANSACTION_RESPONSE_INCLUDE,
} from "../../common/repositories/order.includes.js";

export const findOrderForPayment = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: ORDER_FOR_PAYMENT_INCLUDE,
  });
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const toStartDate = (dateString) => {
  if (!dateString) return undefined;
  return new Date(`${dateString}T00:00:00.000Z`);
};

const toEndDateExclusive = (dateString) => {
  if (!dateString) return undefined;
  return addDays(new Date(`${dateString}T00:00:00.000Z`), 1);
};

const buildTransactionWhere = ({ startDate, endDate } = {}) => {
  const gte = toStartDate(startDate);
  const lt = toEndDateExclusive(endDate);

  if (!gte && !lt) {
    return {};
  }

  return {
    transactionTime: {
      ...(gte ? { gte } : {}),
      ...(lt ? { lt } : {}),
    },
  };
};

export const findTransactions = async ({
  startDate,
  endDate,
  page = 1,
  limit = 50,
} = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const where = buildTransactionWhere({ startDate, endDate });

  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        order: {
          include: {
            table: true,
            orderItems: {
              orderBy: {
                createdAt: "asc",
              },
            },
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
      skip,
      take: safeLimit,
    }),
    prisma.transaction.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
};


export const findTransactionById = async (id) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: TRANSACTION_RESPONSE_INCLUDE,
  });
};

export const findReceiptById = async (id) => {
  return prisma.receipt.findUnique({
    where: { id },
    include: RECEIPT_RESPONSE_INCLUDE,
  });
};
