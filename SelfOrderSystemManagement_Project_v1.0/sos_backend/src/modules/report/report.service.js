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

const toDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
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

const getPeriod = (query = {}) => ({
  startDate: query.startDate ?? null,
  endDate: query.endDate ?? null,
  period: query.period ?? "daily",
});

const findReportTransactions = async (query = {}) => {
  return prisma.transaction.findMany({
    where: buildTransactionWhere(query),
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

const getTransactionItems = (transaction) => {
  if (!transaction?.order?.orderItems) return [];
  return Array.isArray(transaction.order.orderItems)
    ? transaction.order.orderItems
    : [];
};

const getTransactionItemCount = (transaction) => {
  return getTransactionItems(transaction).reduce(
    (total, item) => total + toNumber(item.quantity),
    0,
  );
};

const createEmptySummary = (period) => ({
  period,
  totalRevenue: 0,
  revenue: 0,
  totalSales: 0,
  totalIncome: 0,
  grossSales: 0,

  totalTransactions: 0,
  transactionCount: 0,
  transactions: 0,
  totalOrders: 0,

  averageTransaction: 0,
  averageTransactionValue: 0,
  averageOrderValue: 0,

  totalItems: 0,
  quantitySold: 0,

  totalCashReceived: 0,
  totalChange: 0,
  receiptStatusCounts: {},
  cashierSummaries: [],
});

export const getSalesSummary = async (query = {}) => {
  const period = getPeriod(query);
  const transactions = await findReportTransactions(query);

  const summary = createEmptySummary(period);
  const cashierMap = new Map();

  for (const transaction of transactions) {
    const totalAmount = toNumber(transaction.totalAmount);
    const paidAmount = toNumber(transaction.paidAmount);
    const changeAmount = toNumber(transaction.changeAmount);
    const itemCount = getTransactionItemCount(transaction);

    summary.totalRevenue += totalAmount;
    summary.revenue += totalAmount;
    summary.totalSales += totalAmount;
    summary.totalIncome += totalAmount;
    summary.grossSales += totalAmount;

    summary.totalTransactions += 1;
    summary.transactionCount += 1;
    summary.transactions += 1;
    summary.totalOrders += 1;

    summary.totalItems += itemCount;
    summary.quantitySold += itemCount;

    summary.totalCashReceived += paidAmount;
    summary.totalChange += changeAmount;

    const printStatus = transaction.receipt?.printStatus ?? "NO_RECEIPT";
    summary.receiptStatusCounts[printStatus] =
      (summary.receiptStatusCounts[printStatus] ?? 0) + 1;

    const cashierId = transaction.cashierUserId ?? "unknown";

    if (!cashierMap.has(cashierId)) {
      cashierMap.set(cashierId, {
        cashierUserId: cashierId,
        username: transaction.cashier?.username ?? null,
        fullName: transaction.cashier?.fullName ?? null,
        totalTransactions: 0,
        transactionCount: 0,
        grossSales: 0,
        totalRevenue: 0,
      });
    }

    const cashierSummary = cashierMap.get(cashierId);
    cashierSummary.totalTransactions += 1;
    cashierSummary.transactionCount += 1;
    cashierSummary.grossSales += totalAmount;
    cashierSummary.totalRevenue += totalAmount;
  }

  const average =
    summary.totalTransactions === 0
      ? 0
      : Number((summary.totalRevenue / summary.totalTransactions).toFixed(2));

  summary.averageTransaction = average;
  summary.averageTransactionValue = average;
  summary.averageOrderValue = average;
  summary.cashierSummaries = Array.from(cashierMap.values());

  return summary;
};

export const getDailySales = async (query = {}) => {
  const period = getPeriod(query);
  const transactions = await findReportTransactions(query);
  const dailyMap = new Map();

  for (const transaction of transactions) {
    const date = toDateKey(transaction.transactionTime);

    if (!date) {
      continue;
    }

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        day: date,
        transactionDate: date,

        totalRevenue: 0,
        revenue: 0,
        totalAmount: 0,
        sales: 0,
        grossSales: 0,

        totalTransactions: 0,
        transactionCount: 0,
        transactions: 0,
        count: 0,

        totalOrders: 0,
        totalCashReceived: 0,
        totalChange: 0,
        totalItems: 0,
      });
    }

    const row = dailyMap.get(date);
    const totalAmount = toNumber(transaction.totalAmount);
    const paidAmount = toNumber(transaction.paidAmount);
    const changeAmount = toNumber(transaction.changeAmount);
    const itemCount = getTransactionItemCount(transaction);

    row.totalRevenue += totalAmount;
    row.revenue += totalAmount;
    row.totalAmount += totalAmount;
    row.sales += totalAmount;
    row.grossSales += totalAmount;

    row.totalTransactions += 1;
    row.transactionCount += 1;
    row.transactions += 1;
    row.count += 1;

    row.totalOrders += 1;
    row.totalCashReceived += paidAmount;
    row.totalChange += changeAmount;
    row.totalItems += itemCount;
  }

  return {
    period,
    dailySales: Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
};

export const getTopMenuItems = async (query = {}) => {
  const period = getPeriod(query);
  const limit = Number(query.limit ?? 10);
  const transactions = await findReportTransactions(query);
  const itemMap = new Map();

  for (const transaction of transactions) {
    for (const item of getTransactionItems(transaction)) {
      const key = item.menuItemId ?? item.itemNameSnapshot ?? item.id;

      if (!key) {
        continue;
      }

      if (!itemMap.has(key)) {
        const name = item.itemNameSnapshot ?? item.menuItem?.name ?? "Menu";

        itemMap.set(key, {
          menuItemId: item.menuItemId ?? null,

          name,
          menuName: name,
          itemName: name,

          categoryName: item.categoryNameSnapshot ?? null,

          quantitySold: 0,
          totalQuantity: 0,
          quantity: 0,
          soldQty: 0,

          revenue: 0,
          totalRevenue: 0,
          totalAmount: 0,
          grossSales: 0,
        });
      }

      const row = itemMap.get(key);
      const quantity = toNumber(item.quantity);
      const subtotal = toNumber(item.subtotal);

      row.quantitySold += quantity;
      row.totalQuantity += quantity;
      row.quantity += quantity;
      row.soldQty += quantity;

      row.revenue += subtotal;
      row.totalRevenue += subtotal;
      row.totalAmount += subtotal;
      row.grossSales += subtotal;
    }
  }

  const topMenuItems = Array.from(itemMap.values())
    .sort((a, b) => {
      if (b.quantitySold !== a.quantitySold) {
        return b.quantitySold - a.quantitySold;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, limit);

  return {
    period,
    topMenuItems,
  };
};
