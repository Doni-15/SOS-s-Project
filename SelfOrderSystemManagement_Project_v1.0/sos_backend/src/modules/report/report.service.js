import { prisma } from "../../config/prisma.js";

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(value);
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

const buildTransactionDateFilter = ({ startDate, endDate }) => {
  const gte = toStartDate(startDate);
  const lt = toEndDateExclusive(endDate);

  if (!gte && !lt) return {};

  return {
    transactionTime: {
      ...(gte ? { gte } : {}),
      ...(lt ? { lt } : {}),
    },
  };
};

const formatDateKey = (date) => {
  return date.toISOString().slice(0, 10);
};

export const getSalesSummary = async (query) => {
  const where = buildTransactionDateFilter(query);

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      cashier: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      },
      receipt: {
        select: {
          id: true,
          receiptNumber: true,
          printStatus: true,
          printedAt: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          table: {
            select: {
              id: true,
              tableNumber: true,
              label: true,
            },
          },
        },
      },
    },
    orderBy: {
      transactionTime: "desc",
    },
  });

  const receiptStatusCounts = {
    GENERATED: 0,
    PRINTED: 0,
    FAILED: 0,
  };

  const cashierMap = new Map();

  let grossSales = 0;
  let totalCashReceived = 0;
  let totalChange = 0;

  for (const transaction of transactions) {
    const transactionTotal = toNumber(transaction.totalAmount);
    const paidAmount = toNumber(transaction.paidAmount);
    const changeAmount = toNumber(transaction.changeAmount);

    grossSales += transactionTotal;
    totalCashReceived += paidAmount;
    totalChange += changeAmount;

    const receiptStatus = transaction.receipt?.printStatus;

    if (receiptStatus && receiptStatusCounts[receiptStatus] !== undefined) {
      receiptStatusCounts[receiptStatus] += 1;
    }

    const cashierId = transaction.cashierUserId;

    if (!cashierMap.has(cashierId)) {
      cashierMap.set(cashierId, {
        cashier: transaction.cashier,
        totalTransactions: 0,
        grossSales: 0,
        totalCashReceived: 0,
        totalChange: 0,
      });
    }

    const cashierSummary = cashierMap.get(cashierId);
    cashierSummary.totalTransactions += 1;
    cashierSummary.grossSales += transactionTotal;
    cashierSummary.totalCashReceived += paidAmount;
    cashierSummary.totalChange += changeAmount;
  }

  return {
    period: {
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
    },
    totalTransactions: transactions.length,
    totalOrders: transactions.length,
    grossSales,
    totalCashReceived,
    totalChange,
    averageOrderValue:
      transactions.length > 0 ? Math.round(grossSales / transactions.length) : 0,
    receiptStatusCounts,
    cashierSummaries: Array.from(cashierMap.values()),
  };
};

export const getDailySales = async (query) => {
  const where = buildTransactionDateFilter(query);

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      id: true,
      totalAmount: true,
      paidAmount: true,
      changeAmount: true,
      transactionTime: true,
    },
    orderBy: {
      transactionTime: "asc",
    },
  });

  const dailyMap = new Map();

  for (const transaction of transactions) {
    const dateKey = formatDateKey(transaction.transactionTime);

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        totalTransactions: 0,
        totalOrders: 0,
        grossSales: 0,
        totalCashReceived: 0,
        totalChange: 0,
      });
    }

    const row = dailyMap.get(dateKey);
    row.totalTransactions += 1;
    row.totalOrders += 1;
    row.grossSales += toNumber(transaction.totalAmount);
    row.totalCashReceived += toNumber(transaction.paidAmount);
    row.totalChange += toNumber(transaction.changeAmount);
  }

  const dailySales = Array.from(dailyMap.values()).map((row) => ({
    ...row,
    averageOrderValue:
      row.totalTransactions > 0
        ? Math.round(row.grossSales / row.totalTransactions)
        : 0,
  }));

  return {
    period: {
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
    },
    dailySales,
  };
};

export const getTopMenuItems = async (query) => {
  const where = buildTransactionDateFilter(query);

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      order: {
        include: {
          orderItems: {
            select: {
              menuItemId: true,
              itemNameSnapshot: true,
              categoryNameSnapshot: true,
              unitPriceSnapshot: true,
              quantity: true,
              subtotal: true,
            },
          },
        },
      },
    },
  });

  const menuMap = new Map();

  for (const transaction of transactions) {
    for (const item of transaction.order.orderItems) {
      const key = item.menuItemId;

      if (!menuMap.has(key)) {
        menuMap.set(key, {
          menuItemId: item.menuItemId,
          itemName: item.itemNameSnapshot,
          categoryName: item.categoryNameSnapshot,
          unitPrice: toNumber(item.unitPriceSnapshot),
          quantitySold: 0,
          qtySold: 0,
          grossSales: 0,
          orderCount: 0,
        });
      }

      const row = menuMap.get(key);
      row.quantitySold += item.quantity;
      row.qtySold += item.quantity;
      row.grossSales += toNumber(item.subtotal);
      row.orderCount += 1;
    }
  }

  const topMenuItems = Array.from(menuMap.values())
    .sort((a, b) => {
      if (b.quantitySold !== a.quantitySold) {
        return b.quantitySold - a.quantitySold;
      }

      return b.grossSales - a.grossSales;
    })
    .slice(0, query.limit);

  return {
    period: {
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
    },
    topMenuItems,
  };
};
