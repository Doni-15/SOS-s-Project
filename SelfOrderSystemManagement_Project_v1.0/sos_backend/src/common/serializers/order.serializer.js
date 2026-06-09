const toNumber = (value) => {
  if (value === null || value === undefined) return value;
  return Number(value);
};

export const toUserSummary = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName ?? null,
    role: user.role,
  };
};

export const toTableSummary = (table) => {
  if (!table) return null;

  return {
    id: table.id,
    tableNumber: table.tableNumber,
    label: table.label ?? null,
    isActive: table.isActive,
  };
};

export const toOrderItemResponse = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    menuItemId: item.menuItemId,
    itemNameSnapshot: item.itemNameSnapshot,
    categoryNameSnapshot: item.categoryNameSnapshot ?? null,
    unitPriceSnapshot: toNumber(item.unitPriceSnapshot),
    quantity: item.quantity,
    subtotal: toNumber(item.subtotal),
    note: item.note ?? null,
    createdAt: item.createdAt,
  };
};

export const toTransactionSummary = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.id,
    transactionNumber: transaction.transactionNumber,
    paymentMethod: transaction.paymentMethod,
    totalAmount: toNumber(transaction.totalAmount),
    paidAmount: toNumber(transaction.paidAmount),
    changeAmount: toNumber(transaction.changeAmount),
    transactionTime: transaction.transactionTime,
    createdAt: transaction.createdAt,
  };
};

export const toOrderStatusHistoryResponse = (history) => {
  if (!history) return null;

  return {
    id: history.id,
    orderId: history.orderId,
    fromStatus: history.fromStatus ?? null,
    toStatus: history.toStatus,
    note: history.note ?? null,
    changedByUserId: history.changedByUserId ?? null,
    changedByUser: toUserSummary(history.changedByUser),
    createdAt: history.createdAt,
  };
};

export const toOrderResponse = (order) => {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    table: toTableSummary(order.table),
    orderSessionId: order.orderSessionId ?? null,
    acceptedByUserId: order.acceptedByUserId ?? null,
    acceptedBy: toUserSummary(order.acceptedBy),
    status: order.status,
    totalAmount: toNumber(order.totalAmount),
    customerName: order.customerName ?? null,
    customerNote: order.customerNote ?? null,
    version: order.version,
    createdAt: order.createdAt,
    submittedAt: order.submittedAt,
    acceptedAt: order.acceptedAt ?? null,
    servedAt: order.servedAt ?? null,
    cancelledAt: order.cancelledAt ?? null,
    expiredAt: order.expiredAt ?? null,
    paidAt: order.paidAt ?? null,
    orderItems: order.orderItems?.map(toOrderItemResponse) ?? [],
    transaction: toTransactionSummary(order.transaction),
    statusHistories:
      order.statusHistories?.map(toOrderStatusHistoryResponse) ?? [],
  };
};
