import crypto from "crypto";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { hashToken } from "../../common/utils/hashToken.js";
import {
  createOrderSession,
  findActiveOrderSession,
  findMenuItemsByIds,
  findPublicMenuItems,
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

const toOrderResponse = (order) => {
  return {
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
    orderSessionId: order.orderSessionId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    customerNote: order.customerNote,
    submittedAt: order.submittedAt,
    createdAt: order.createdAt,
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      itemNameSnapshot: item.itemNameSnapshot,
      categoryNameSnapshot: item.categoryNameSnapshot,
      unitPriceSnapshot: Number(item.unitPriceSnapshot),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      note: item.note,
    })),
  };
};

const createCustomerOrderSession = async ({ token, ipAddress, userAgent }) => {
  const tokenHash = hashToken(token);

  const qrToken = await findValidQrTokenByHash(tokenHash);

  if (!qrToken) {
    throw new AppError({
      statusCode: 404,
      code: "QR_TOKEN_NOT_FOUND",
      message: "QR token is invalid, expired, or revoked",
    });
  }

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
    table: {
      id: qrToken.table.id,
      tableNumber: qrToken.table.tableNumber,
      label: qrToken.table.label,
    },
  };
};

export const validateQrToken = async ({ token, ipAddress, userAgent }) => {
  return createCustomerOrderSession({
    token,
    ipAddress,
    userAgent,
  });
};

export const getPublicMenu = async ({ token, ipAddress, userAgent }) => {
  const sessionResult = await createCustomerOrderSession({
    token,
    ipAddress,
    userAgent,
  });

  const menuItems = await findPublicMenuItems();

  return {
    ...sessionResult,
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
          totalAmount,
          itemCount: orderItemsData.length,
        },
      },
    });

    return createdOrder;
  });

  return toOrderResponse(order);
};
