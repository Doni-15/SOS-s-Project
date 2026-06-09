import { toOrderResponse } from "../src/common/serializers/order.serializer.js";
import {
  toReceiptResponse,
  toTransactionResponse,
} from "../src/common/serializers/payment.serializer.js";

const now = new Date("2026-06-09T12:00:00.000Z");

const order = {
  id: "order-id",
  orderNumber: "ORD-001",
  tableId: "table-id",
  table: {
    id: "table-id",
    tableNumber: "A1",
    label: "Meja A1",
    isActive: true,
  },
  orderSessionId: null,
  acceptedByUserId: "user-id",
  acceptedBy: {
    id: "user-id",
    username: "cashier",
    fullName: "Cashier",
    role: "CASHIER",
  },
  status: "SERVED",
  totalAmount: "25000.00",
  customerName: "Budi",
  customerNote: "Tidak pedas",
  version: 1,
  createdAt: now,
  submittedAt: now,
  acceptedAt: now,
  servedAt: now,
  cancelledAt: null,
  expiredAt: null,
  paidAt: null,
  orderItems: [
    {
      id: "item-id",
      menuItemId: "menu-id",
      itemNameSnapshot: "Nasi Goreng",
      categoryNameSnapshot: "Makanan",
      unitPriceSnapshot: "25000.00",
      quantity: 1,
      subtotal: "25000.00",
      note: null,
      createdAt: now,
    },
  ],
  transaction: null,
  statusHistories: [],
};

const transaction = {
  id: "trx-id",
  transactionNumber: "TRX-001",
  orderId: order.id,
  order,
  cashierUserId: "user-id",
  cashier: order.acceptedBy,
  paymentMethod: "CASH",
  totalAmount: "25000.00",
  paidAmount: "30000.00",
  changeAmount: "5000.00",
  transactionTime: now,
  createdAt: now,
  receipt: {
    id: "receipt-id",
    receiptNumber: "RCP-001",
    printStatus: "GENERATED",
    printedAt: null,
    createdAt: now,
  },
};

const receipt = {
  id: "receipt-id",
  receiptNumber: "RCP-001",
  transactionId: transaction.id,
  transaction,
  printStatus: "GENERATED",
  receiptPayload: {
    orderNumber: order.orderNumber,
  },
  printedAt: null,
  createdAt: now,
  updatedAt: now,
  printAttempts: [],
};

const serializedOrder = toOrderResponse(order);
const serializedTransaction = toTransactionResponse(transaction);
const serializedReceipt = toReceiptResponse(receipt);

if (serializedOrder.totalAmount !== 25000) {
  throw new Error("Order totalAmount must be number");
}

if (serializedOrder.orderItems[0].unitPriceSnapshot !== 25000) {
  throw new Error("Order item unitPriceSnapshot must be number");
}

if (serializedTransaction.changeAmount !== 5000) {
  throw new Error("Transaction changeAmount must be number");
}

if (serializedReceipt.transaction.totalAmount !== 25000) {
  throw new Error("Receipt transaction totalAmount must be number");
}

console.log("Serializer check passed.");
