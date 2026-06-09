import {
  toOrderItemResponse,
  toTableSummary,
  toUserSummary,
} from "./order.serializer.js";

const toNumber = (value) => {
  if (value === null || value === undefined) return value;
  return Number(value);
};

export const toReceiptSummary = (receipt) => {
  if (!receipt) return null;

  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    printStatus: receipt.printStatus,
    printedAt: receipt.printedAt ?? null,
    createdAt: receipt.createdAt,
  };
};

export const toTransactionResponse = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.id,
    transactionNumber: transaction.transactionNumber,
    orderId: transaction.orderId,
    order: transaction.order
      ? {
          id: transaction.order.id,
          orderNumber: transaction.order.orderNumber,
          tableId: transaction.order.tableId,
          table: toTableSummary(transaction.order.table),
          status: transaction.order.status,
          totalAmount: toNumber(transaction.order.totalAmount),
          customerName: transaction.order.customerName ?? null,
          customerNote: transaction.order.customerNote ?? null,
          submittedAt: transaction.order.submittedAt,
          acceptedAt: transaction.order.acceptedAt ?? null,
          servedAt: transaction.order.servedAt ?? null,
          paidAt: transaction.order.paidAt ?? null,
          orderItems:
            transaction.order.orderItems?.map(toOrderItemResponse) ?? [],
        }
      : null,
    cashierUserId: transaction.cashierUserId,
    cashier: toUserSummary(transaction.cashier),
    paymentMethod: transaction.paymentMethod,
    totalAmount: toNumber(transaction.totalAmount),
    paidAmount: toNumber(transaction.paidAmount),
    changeAmount: toNumber(transaction.changeAmount),
    transactionTime: transaction.transactionTime,
    createdAt: transaction.createdAt,
    receipt: toReceiptSummary(transaction.receipt),
  };
};

export const toReceiptPrintAttemptResponse = (attempt) => {
  if (!attempt) return null;

  return {
    id: attempt.id,
    receiptId: attempt.receiptId,
    cashierUserId: attempt.cashierUserId ?? null,
    cashier: toUserSummary(attempt.cashier),
    status: attempt.status,
    errorMessage: attempt.errorMessage ?? null,
    attemptedAt: attempt.attemptedAt,
  };
};

export const toReceiptResponse = (receipt) => {
  if (!receipt) return null;

  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    transactionId: receipt.transactionId,
    transaction: toTransactionResponse(receipt.transaction),
    printStatus: receipt.printStatus,
    receiptPayload: receipt.receiptPayload ?? null,
    printedAt: receipt.printedAt ?? null,
    createdAt: receipt.createdAt,
    updatedAt: receipt.updatedAt,
    printAttempts:
      receipt.printAttempts?.map(toReceiptPrintAttemptResponse) ?? [],
  };
};
