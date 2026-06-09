import crypto from "crypto";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { toOrderResponse as serializeOrderResponse } from "../../common/serializers/order.serializer.js";
import { hashToken } from "../../common/utils/hashToken.js";
import {
  createOrderSession,
  findActiveOrderSession,
  findMenuItemsByIds,
  findPublicMenuItems,
  findPublicOrderBySession,
  findValidQrTokenByHash,
} from "./publicOrder.repository.js";

const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const generateOrderNumber = () => {
  const now = new Date();

  const pad = (value) => String(value).padStart(2, "0");

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

  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `ORD-${datePart}-${timePart}-${randomPart}`;
};

const toMenuItemResponse = (item) => {
  return {
    id: item.id,
    categoryId: item.categoryId,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.imageUrl,
    availabilityStatus: item.availabilityStatus,
    isActive: item.isActive,
    displayOrder: item.displayOrder,
  };
};

const groupMenuItemsByCategory = (items) => {
  const categoryMap = new Map();

  for (const item of items) {
    const categoryId = item.category.id;

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: item.category.id,
        name: item.category.name,
        description: item.category.description,
        displayOrder: item.category.displayOrder,
        menuItems: [],
      });
    }

    categoryMap.get(categoryId).menuItems.push(toMenuItemResponse(item));
  }

  return Array.from(categoryMap.values());
};

const getValidQrToken = async (token) => {
  const tokenHash = hashToken(token);
  const qrToken = await findValidQrTokenByHash(tokenHash);

  if (!qrToken) {
    throw new AppError({
      statusCode: 404,
      code: "QR_TOKEN_NOT_FOUND",
      message: "QR token is invalid, expired, or revoked",
    });
  }

  return qrToken;
};

const toPublicTableResponse = (table) => ({
  id: table.id,
  tableNumber: table.tableNumber,
  label: table.label,
});

const createCustomerOrderSession = async ({ token, ipAddress, userAgent }) => {
  const qrToken = await getValidQrToken(token);

  const rawOrderSessionToken = crypto.randomUUID();
  const sessionTokenHash = hashToken(rawOrderSessionToken);
  const expiresAt = addMinutes(
    new Date(),
    env.orderSessionExpiresMinutes
  );

  const orderSession = await createOrderSession({
    tableId: qrToken.tableId,
    qrTokenId: qrToken.id,
    sessionTokenHash,
    ipAddress,
    userAgent,
    expiresAt,
  });

  return {
    orderSession: {
      id: orderSession.id,
      token: rawOrderSessionToken,
      expiresAt: orderSession.expiresAt,
    },
    table: toPublicTableResponse(qrToken.table),
  };
};

export const validateQrToken = async ({ token, ipAddress, userAgent }) => {
  return createCustomerOrderSession({
    token,
    ipAddress,
    userAgent,
  });
};

export const getPublicMenu = async ({ token }) => {
  const qrToken = await getValidQrToken(token);
  const menuItems = await findPublicMenuItems();

  return {
    table: toPublicTableResponse(qrToken.table),
    categories: groupMenuItemsByCategory(menuItems),
  };
};

export const submitCustomerOrder = async ({ payload, ipAddress, userAgent }) => {
  const sessionTokenHash = hashToken(payload.orderSessionToken);

  const session = await findActiveOrderSession({
    orderSessionId: payload.orderSessionId,
    sessionTokenHash,
  });

  if (!session) {
    throw new AppError({
      statusCode: 410,
      code: "SESSION_EXPIRED",
      message: "Order session is invalid, expired, or already used",
    });
  }

  const menuItemIds = payload.items.map((item) => item.menuItemId);
  const menuItems = await findMenuItemsByIds(menuItemIds);
  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  const orderItemsData = [];
  let totalAmount = 0;

  for (const requestedItem of payload.items) {
    const menuItem = menuItemMap.get(requestedItem.menuItemId);

    if (!menuItem) {
      throw new AppError({
        statusCode: 404,
        code: "MENU_ITEM_NOT_FOUND",
        message: "Menu item not found",
        fields: {
          menuItemId: requestedItem.menuItemId,
        },
      });
    }

    if (
      !menuItem.isActive ||
      !menuItem.category?.isActive ||
      menuItem.availabilityStatus === "OUT_OF_STOCK"
    ) {
      throw new AppError({
        statusCode: 422,
        code: "MENU_UNAVAILABLE",
        message: "Menu item is currently unavailable",
        fields: {
          menuItemId: requestedItem.menuItemId,
          name: menuItem.name,
        },
      });
    }

    const unitPrice = Number(menuItem.price);
    const subtotal = unitPrice * requestedItem.quantity;

    totalAmount += subtotal;

    orderItemsData.push({
      menuItemId: menuItem.id,
      itemNameSnapshot: menuItem.name,
      categoryNameSnapshot: menuItem.category?.name ?? null,
      unitPriceSnapshot: unitPrice,
      quantity: requestedItem.quantity,
      subtotal,
      note: requestedItem.note ?? null,
    });
  }

  const now = new Date();

  const order = await prisma.$transaction(async (tx) => {
    const updatedSession = await tx.orderSession.updateMany({
      where: {
        id: session.id,
        sessionTokenHash,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        usedAt: now,
      },
    });

    if (updatedSession.count !== 1) {
      throw new AppError({
        statusCode: 409,
        code: "ORDER_SESSION_ALREADY_USED",
        message: "Order session has already been used",
      });
    }

    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        tableId: session.tableId,
        orderSessionId: session.id,
        status: "SUBMITTED",
        totalAmount,
        customerName: payload.customerName,
        customerNote: payload.customerNote ?? null,
        submittedAt: now,
        orderItems: {
          create: orderItemsData,
        },
        statusHistories: {
          create: {
            fromStatus: null,
            toStatus: "SUBMITTED",
            note: "Order submitted by customer",
          },
        },
      },
      include: {
        table: true,
        orderItems: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: null,
        action: "ORDER_SUBMITTED",
        entityType: "order",
        entityId: createdOrder.id,
        ipAddress,
        userAgent,
        metadata: {
          orderNumber: createdOrder.orderNumber,
          tableId: createdOrder.tableId,
          tableNumber: session.table.tableNumber,
          customerName: payload.customerName,
          totalAmount,
          itemCount: orderItemsData.length,
        },
      },
    });

    return createdOrder;
  });

  return serializeOrderResponse(order);
};

const toPublicOrderItemResponse = (item) => ({
  id: item.id,
  menuItemId: item.menuItemId,
  itemNameSnapshot: item.itemNameSnapshot,
  categoryNameSnapshot: item.categoryNameSnapshot,
  unitPriceSnapshot: Number(item.unitPriceSnapshot),
  quantity: item.quantity,
  subtotal: Number(item.subtotal),
  note: item.note,
});

const toPublicTransactionResponse = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.id,
    transactionNumber: transaction.transactionNumber,
    paymentMethod: transaction.paymentMethod,
    totalAmount: Number(transaction.totalAmount),
    paidAmount: Number(transaction.paidAmount),
    changeAmount: Number(transaction.changeAmount),
    transactionTime: transaction.transactionTime,
    cashier: transaction.cashier ?? null,
    receipt: transaction.receipt
      ? {
          id: transaction.receipt.id,
          receiptNumber: transaction.receipt.receiptNumber,
          printStatus: transaction.receipt.printStatus,
          printedAt: transaction.receipt.printedAt,
          receiptPayload: transaction.receipt.receiptPayload,
          createdAt: transaction.receipt.createdAt,
        }
      : null,
  };
};

const toPublicOrderTrackingResponse = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  tableId: order.tableId,
  table: order.table
    ? {
        id: order.table.id,
        tableNumber: order.table.tableNumber,
        label: order.table.label,
      }
    : null,
  status: order.status,
  totalAmount: Number(order.totalAmount),
  customerName: order.customerName,
  customerNote: order.customerNote,
  createdAt: order.createdAt,
  submittedAt: order.submittedAt,
  acceptedAt: order.acceptedAt,
  servedAt: order.servedAt ?? null,
  paidAt: order.paidAt,
  cancelledAt: order.cancelledAt,
  expiredAt: order.expiredAt,
  orderItems: order.orderItems?.map(toPublicOrderItemResponse) ?? [],
  statusHistories:
    order.statusHistories?.map((history) => ({
      id: history.id,
      fromStatus: history.fromStatus,
      toStatus: history.toStatus,
      note: history.note,
      createdAt: history.createdAt,
    })) ?? [],
  transaction: toPublicTransactionResponse(order.transaction),
  receipt: order.transaction?.receipt
    ? {
        id: order.transaction.receipt.id,
        receiptNumber: order.transaction.receipt.receiptNumber,
        printStatus: order.transaction.receipt.printStatus,
        printedAt: order.transaction.receipt.printedAt,
        receiptPayload: order.transaction.receipt.receiptPayload,
        createdAt: order.transaction.receipt.createdAt,
      }
    : null,
});

export const getCustomerOrderTracking = async ({
  orderId,
  orderSessionToken,
}) => {
  if (!orderSessionToken) {
    throw new AppError({
      statusCode: 401,
      code: "ORDER_SESSION_TOKEN_REQUIRED",
      message: "Order session token is required",
    });
  }

  const sessionTokenHash = hashToken(orderSessionToken);

  const order = await findPublicOrderBySession({
    orderId,
    sessionTokenHash,
  });

  if (!order) {
    throw new AppError({
      statusCode: 404,
      code: "PUBLIC_ORDER_NOT_FOUND",
      message: "Order not found or session token is invalid",
    });
  }

  return toPublicOrderTrackingResponse(order);
};
