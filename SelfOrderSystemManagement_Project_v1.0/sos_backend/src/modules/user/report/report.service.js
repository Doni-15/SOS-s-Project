import { findTransactionsForReport } from "./report.repository.js";

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

const toDateKey = (date) => {
  return date.toISOString().slice(0, 10);
};

const getReportPeriod = (query) => {
  return {
    startDate: query.startDate ?? null,
    endDate: query.endDate ?? null,
    startDateTime: toStartDate(query.startDate),
    endDateTimeExclusive: toEndDateExclusive(query.endDate),
  };
};

const getTransactions = async (query) => {
  const period = getReportPeriod(query);

  const transactions = await findTransactionsForReport({
    startDate: period.startDateTime,
    endDate: period.endDateTimeExclusive,
  });

  return {
    period,
    transactions,
  };
};

export const getSalesSummary = async (query) => {
  const { period, transactions } = await getTransactions(query);

  const totalTransactions = transactions.length;
  const totalOrders = transactions.length;

  const grossSales = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.totalAmount),
    0
  );

  const totalCashReceived = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.paidAmount),
    0
  );

  const totalChange = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.changeAmount),
    0
  );

  const receiptStatusCounts = {
    GENERATED: 0,
    PRINTED: 0,
    FAILED: 0,
  };

  const cashierMap = new Map();

  for (const transaction of transactions) {
    if (transaction.receipt) {
      receiptStatusCounts[transaction.receipt.printStatus] =
        (receiptStatusCounts[transaction.receipt.printStatus] ?? 0) + 1;
    }

    const cashierId = transaction.cashierUserId;

    if (!cashierMap.has(cashierId)) {
      cashierMap.set(cashierId, {
        cashierUserId: cashierId,
        username: transaction.cashier?.username ?? null,
        fullName: transaction.cashier?.fullName ?? null,
        totalTransactions: 0,
        grossSales: 0,
      });
    }

    const cashierSummary = cashierMap.get(cashierId);
    cashierSummary.totalTransactions += 1;
    cashierSummary.grossSales += Number(transaction.totalAmount);
  }

  return {
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
    },
    totalTransactions,
    totalOrders,
    grossSales,
    totalCashReceived,
    totalChange,
    averageOrderValue:
      totalOrders === 0 ? 0 : Number((grossSales / totalOrders).toFixed(2)),
    receiptStatusCounts,
    cashierSummaries: Array.from(cashierMap.values()),
  };
};

export const getDailySales = async (query) => {
  const { period, transactions } = await getTransactions(query);
  const dailyMap = new Map();

  for (const transaction of transactions) {
    const dateKey = toDateKey(transaction.transactionTime);

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

    const dailySummary = dailyMap.get(dateKey);

    dailySummary.totalTransactions += 1;
    dailySummary.totalOrders += 1;
    dailySummary.grossSales += Number(transaction.totalAmount);
    dailySummary.totalCashReceived += Number(transaction.paidAmount);
    dailySummary.totalChange += Number(transaction.changeAmount);
  }

  return {
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
    },
    dailySales: Array.from(dailyMap.values()),
  };
};

export const getTopMenuItems = async (query) => {
  const { period, transactions } = await getTransactions(query);
  const itemMap = new Map();

  for (const transaction of transactions) {
    for (const item of transaction.order.orderItems) {
      const key = item.menuItemId ?? item.itemNameSnapshot;

      if (!itemMap.has(key)) {
        itemMap.set(key, {
          menuItemId: item.menuItemId,
          itemName: item.itemNameSnapshot,
          categoryName: item.categoryNameSnapshot,
          quantitySold: 0,
          grossSales: 0,
        });
      }

      const itemSummary = itemMap.get(key);
      itemSummary.quantitySold += item.quantity;
      itemSummary.grossSales += Number(item.subtotal);
    }
  }

  const topMenuItems = Array.from(itemMap.values())
    .sort((a, b) => {
      if (b.quantitySold !== a.quantitySold) {
        return b.quantitySold - a.quantitySold;
      }

      return b.grossSales - a.grossSales;
    })
    .slice(0, query.limit);

  return {
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
    },
    topMenuItems,
  };
};
