import crypto from "crypto";

import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import {
  toReceiptResponse as serializeReceiptResponse,
  toTransactionResponse as serializeTransactionResponse,
} from "../../common/serializers/payment.serializer.js";
import {
  ORDER_STATUS,
  assertOrderTransitionAllowed,
} from "../../common/constants/orderStatus.js";
import {
  findOrderForPayment,
  findReceiptById,
  findTransactionById,
  findTransactions,
} from "./payment.repository.js";

const pad = (value) => String(value).padStart(2, "0");

const getDateTimeParts = () => {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("");

  const timePart = [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return { datePart, timePart };
};

const generateTransactionNumber = () => {
  const { datePart, timePart } = getDateTimeParts();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `TRX-${datePart}-${timePart}-${randomPart}`;
};

const generateReceiptNumber = () => {
  const { datePart, timePart } = getDateTimeParts();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `RCP-${datePart}-${timePart}-${randomPart}`;
};

const buildReceiptPayload = ({
  receiptNumber,
  transactionNumber,
  order,
  cashier,
  paidAmount,
  changeAmount,
  transactionTime,
}) => {
  return {
    receiptNumber,
    transactionNumber,
    orderNumber: order.orderNumber,
    customerName: order.customerName ?? null,
    table: {
      tableNumber: order.table?.tableNumber ?? null,
      label: order.table?.label ?? null,
    },
    cashier: {
      username: cashier.username,
      fullName: cashier.fullName,
    },
    items: order.orderItems.map((item) => ({
      name: item.itemNameSnapshot,
      category: item.categoryNameSnapshot,
      unitPrice: Number(item.unitPriceSnapshot),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      note: item.note,
    })),
    totalAmount: Number(order.totalAmount),
    paidAmount,
    changeAmount,
    paymentMethod: "CASH",
    transactionTime,
  };
};

export const processCashPayment = async ({ orderId, payload, user }) => {
  const order = await findOrderForPayment(orderId);

  if (!order) {
    throw new AppError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    });
  }

  if (order.transaction) {
    throw new AppError({
      statusCode: 409,
      code: "ORDER_ALREADY_PAID",
      message: "Order already has a transaction",
    });
  }

  assertOrderTransitionAllowed({
    from: order.status,
    to: ORDER_STATUS.PAID,
    action: "pay this order",
  });

  const totalAmount = Number(order.totalAmount);
  const paidAmount = Number(payload.paidAmount);

  if (paidAmount < totalAmount) {
    throw new AppError({
      statusCode: 422,
      code: "PAYMENT_INSUFFICIENT",
      message: "Paid amount must be greater than or equal to total amount",
      fields: {
        paidAmount,
        totalAmount,
      },
    });
  }

  const changeAmount = paidAmount - totalAmount;
  const now = new Date();
  const transactionNumber = generateTransactionNumber();
  const receiptNumber = generateReceiptNumber();

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrderResult = await tx.order.updateMany({
      where: {
        id: order.id,
        status: "SERVED",
        transaction: null,
      },
      data: {
        status: "PAID",
        paidAt: now,
        version: {
          increment: 1,
        },
      },
    });

    if (updatedOrderResult.count !== 1) {
      throw new AppError({
        statusCode: 409,
        code: "ORDER_ALREADY_PROCESSED",
        message: "Order has already been processed",
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        orderId: order.id,
        cashierUserId: user.id,
        paymentMethod: "CASH",
        totalAmount,
        paidAmount,
        changeAmount,
        transactionTime: now,
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
        order: {
          include: {
            table: true,
            orderItems: true,
          },
        },
      },
    });

    const receiptPayload = buildReceiptPayload({
      receiptNumber,
      transactionNumber,
      order,
      cashier: user,
      paidAmount,
      changeAmount,
      transactionTime: now,
    });

    const receipt = await tx.receipt.create({
      data: {
        receiptNumber,
        transactionId: transaction.id,
        printStatus: "GENERATED",
        receiptPayload,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        changedByUserId: user.id,
        fromStatus: order.status,
        toStatus: "PAID",
        note: "Order paid by cashier",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "PAYMENT_COMPLETED",
        entityType: "transaction",
        entityId: transaction.id,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          transactionNumber,
          receiptNumber,
          totalAmount,
          paidAmount,
          changeAmount,
        },
      },
    });

    return {
      transaction: {
        ...transaction,
        receipt,
      },
      receipt,
    };
  });

  return {
    transaction: serializeTransactionResponse(result.transaction),
    receipt: serializeReceiptResponse({
      ...result.receipt,
      transaction: result.transaction,
      printAttempts: [],
    }),
  };
};

export const getTransactions = async (query = {}) => {
  const result = await findTransactions(query);

  const items = Array.isArray(result)
    ? result
    : Array.isArray(result?.items)
      ? result.items
      : [];

  const pagination = result?.pagination ?? {
    page: Number(query.page ?? 1),
    limit: Number(query.limit ?? items.length ?? 50),
    total: items.length,
    totalPages: 1,
  };

  return {
    transactions: items.map(serializeTransactionResponse),
    pagination,
  };
};


export const getTransactionDetail = async (id) => {
  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw new AppError({
      statusCode: 404,
      code: "TRANSACTION_NOT_FOUND",
      message: "Transaction not found",
    });
  }

  return serializeTransactionResponse(transaction);
};

export const getReceiptDetail = async (id) => {
  const receipt = await findReceiptById(id);

  if (!receipt) {
    throw new AppError({
      statusCode: 404,
      code: "RECEIPT_NOT_FOUND",
      message: "Receipt not found",
    });
  }

  return serializeReceiptResponse(receipt);
};

export const markReceiptPrintSuccess = async ({ receiptId, user }) => {
  const receipt = await findReceiptById(receiptId);

  if (!receipt) {
    throw new AppError({
      statusCode: 404,
      code: "RECEIPT_NOT_FOUND",
      message: "Receipt not found",
    });
  }

  const now = new Date();
  const previousPrintStatus = receipt.printStatus;

  await prisma.$transaction(async (tx) => {
    await tx.receipt.update({
      where: {
        id: receipt.id,
      },
      data: {
        printStatus: "PRINTED",
        printedAt: receipt.printedAt ?? now,
      },
    });

    await tx.receiptPrintAttempt.create({
      data: {
        receiptId: receipt.id,
        cashierUserId: user.id,
        status: "SUCCESS",
        errorMessage: null,
        attemptedAt: now,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "RECEIPT_PRINTED",
        entityType: "receipt",
        entityId: receipt.id,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          previousPrintStatus,
          nextPrintStatus: "PRINTED",
          username: user.username,
          role: user.role,
        },
      },
    });
  });

  const updatedReceipt = await findReceiptById(receiptId);
  return serializeReceiptResponse(updatedReceipt);
};

export const markReceiptPrintFailed = async ({
  receiptId,
  errorMessage,
  user,
}) => {
  const receipt = await findReceiptById(receiptId);

  if (!receipt) {
    throw new AppError({
      statusCode: 404,
      code: "RECEIPT_NOT_FOUND",
      message: "Receipt not found",
    });
  }

  const now = new Date();
  const previousPrintStatus = receipt.printStatus;
  const nextPrintStatus =
    receipt.printStatus === "PRINTED" ? "PRINTED" : "FAILED";

  await prisma.$transaction(async (tx) => {
    await tx.receipt.update({
      where: {
        id: receipt.id,
      },
      data: {
        printStatus: nextPrintStatus,
      },
    });

    await tx.receiptPrintAttempt.create({
      data: {
        receiptId: receipt.id,
        cashierUserId: user.id,
        status: "FAILED",
        errorMessage,
        attemptedAt: now,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "RECEIPT_PRINT_FAILED",
        entityType: "receipt",
        entityId: receipt.id,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          previousPrintStatus,
          nextPrintStatus,
          errorMessage,
          username: user.username,
          role: user.role,
        },
      },
    });
  });

  const updatedReceipt = await findReceiptById(receiptId);
  return serializeReceiptResponse(updatedReceipt);
};
