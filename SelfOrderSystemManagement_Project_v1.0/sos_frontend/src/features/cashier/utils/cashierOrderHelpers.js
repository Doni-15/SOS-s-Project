export const CASHIER_ORDER_STATUSES = [
  "SUBMITTED",
  "ACCEPTED",
  "SERVED",
  "PAID",
  "CANCELLED",
  "EXPIRED",
];

export const CASHIER_ORDER_STATUS_LABELS = {
  SUBMITTED: "Baru",
  ACCEPTED: "Diproses",
  SERVED: "Dihidangkan",
  PAID: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export const CASHIER_ORDER_STATUS_STYLES = {
  SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-100",
  ACCEPTED: "bg-amber-50 text-amber-700 ring-amber-100",
  SERVED: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
  EXPIRED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function getOrderNumber(order) {
  return order?.orderNumber ?? order?.order_number ?? "-";
}

export function getOrderStatus(order) {
  return order?.status ?? "SUBMITTED";
}

export function getOrderTotal(order) {
  return Number(order?.totalAmount ?? order?.total_amount ?? 0);
}

export function getOrderItems(order) {
  return Array.isArray(order?.orderItems) ? order.orderItems : [];
}

export function getOrderItemName(item) {
  return item?.itemNameSnapshot ?? item?.name ?? item?.menuItem?.name ?? "-";
}

export function getOrderItemQuantity(item) {
  return Number(item?.quantity ?? 0);
}

export function getOrderItemSubtotal(item) {
  return Number(item?.subtotal ?? 0);
}

export function getOrderCreatedAt(order) {
  return order?.submittedAt ?? order?.createdAt ?? order?.created_at ?? null;
}

export function getTableLabel(order) {
  const table = order?.table;

  if (!table) {
    return "-";
  }

  return table.label || table.tableNumber || table.table_number || "-";
}

export function getCustomerName(order) {
  return order?.customerName ?? order?.customer_name ?? "";
}

export function getCustomerNote(order) {
  return order?.customerNote ?? order?.customer_note ?? "";
}

export function getAcceptedByName(order) {
  const acceptedBy = order?.acceptedBy;

  if (!acceptedBy) {
    return "-";
  }

  return acceptedBy.fullName || acceptedBy.username || "-";
}

export function sortOrdersByTime(orders = []) {
  return [...orders].sort((a, b) => {
    const dateA = new Date(getOrderCreatedAt(a) || 0).getTime();
    const dateB = new Date(getOrderCreatedAt(b) || 0).getTime();

    return dateB - dateA;
  });
}

export function filterOrdersByKeyword(orders = [], keyword = "") {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return orders;
  }

  return orders.filter((order) => {
    const searchableText = [
      getOrderNumber(order),
      getTableLabel(order),
      getOrderStatus(order),
      getCustomerNote(order),
      ...getOrderItems(order).map(getOrderItemName),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedKeyword);
  });
}

export function getOrderItemUnitPrice(item) {
  return Number(
    item?.unitPriceSnapshot ??
      item?.unitPrice ??
      item?.price ??
      item?.menuItem?.price ??
      0,
  );
}

export function getOrderItemNote(item) {
  return item?.note ?? item?.customerNote ?? "";
}

export function getOrderTransaction(order) {
  return order?.transaction ?? null;
}

export function getTransactionId(transaction) {
  return transaction?.id ?? transaction?.transactionId ?? "";
}

export function getTransactionNumber(transaction) {
  return transaction?.transactionNumber ?? transaction?.transaction_number ?? "-";
}

export function getTransactionPaidAmount(transaction) {
  return Number(transaction?.paidAmount ?? transaction?.paid_amount ?? 0);
}

export function getTransactionChangeAmount(transaction) {
  return Number(transaction?.changeAmount ?? transaction?.change_amount ?? 0);
}

export function getTransactionTime(transaction) {
  return transaction?.transactionTime ?? transaction?.createdAt ?? null;
}

export function getReceiptId(transaction) {
  return transaction?.receipt?.id ?? transaction?.receiptId ?? "";
}

export function getReceiptNumber(receipt) {
  return receipt?.receiptNumber ?? receipt?.receipt_number ?? "-";
}

export function getReceiptCreatedAt(receipt) {
  return receipt?.createdAt ?? receipt?.printedAt ?? receipt?.printed_at ?? null;
}

export function getReceiptPrintCount(receipt) {
  return Number(receipt?.printCount ?? receipt?.print_count ?? 0);
}

export function getReceiptStatus(receipt) {
  return receipt?.printStatus ?? receipt?.print_status ?? "PENDING";
}
