import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { findOrderById, findOrders } from "./internalOrder.repository.js";

const toOrderItemResponse = (item) => ({
  id: item.id,
  menuItemId: item.menuItemId,
  itemNameSnapshot: item.itemNameSnapshot,
  categoryNameSnapshot: item.categoryNameSnapshot,
  unitPriceSnapshot: Number(item.unitPriceSnapshot),
  quantity: item.quantity,
  subtotal: Number(item.subtotal),
  note: item.note,
});

const toOrderResponse = (order) => ({
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
  acceptedByUserId: order.acceptedByUserId,
  acceptedBy: order.acceptedBy ?? null,
  status: order.status,
  totalAmount: Number(order.totalAmount),
  customerNote: order.customerNote,
  version: order.version,
  createdAt: order.createdAt,
  submittedAt: order.submittedAt,
  acceptedAt: order.acceptedAt,
  cancelledAt: order.cancelledAt,
  expiredAt: order.expiredAt,
  paidAt: order.paidAt,
  orderItems: order.orderItems?.map(toOrderItemResponse) ?? [],
  transaction: order.transaction
    ? {
        id: order.transaction.id,
        transactionNumber: order.transaction.transactionNumber,
        totalAmount: Number(order.transaction.totalAmount),
        paidAmount: Number(order.transaction.paidAmount),
        changeAmount: Number(order.transaction.changeAmount),
        transactionTime: order.transaction.transactionTime,
      }
    : null,
  statusHistories:
    order.statusHistories?.map((history) => ({
      id: history.id,
      fromStatus: history.fromStatus,
      toStatus: history.toStatus,
      note: history.note,
      changedByUser: history.changedByUser ?? null,
      createdAt: history.createdAt,
    })) ?? [],
});

export const getInternalOrders = async (query) => {
  const orders = await findOrders(query);
  return orders.map(toOrderResponse);
};

export const getInternalOrderById = async (id) => {
  const order = await findOrderById(id);

  if (!order) {
    throw new AppError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    });
  }

  return toOrderResponse(order);
};

export const acceptOrder = async ({ id, user }) => {
  const existingOrder = await findOrderById(id);

  if (!existingOrder) {
    throw new AppError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    });
  }

  if (existingOrder.status !== "SUBMITTED") {
    throw new AppError({
      statusCode: 409,
      code: "ORDER_CANNOT_BE_ACCEPTED",
      message: "Only submitted orders can be accepted",
      fields: {
        currentStatus: existingOrder.status,
      },
    });
  }

  const now = new Date();

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id,
        status: "SUBMITTED",
      },
      data: {
        status: "ACCEPTED",
        acceptedByUserId: user.id,
        acceptedAt: now,
        version: {
          increment: 1,
        },
      },
    });

    if (result.count !== 1) {
      throw new AppError({
        statusCode: 409,
        code: "ORDER_ALREADY_PROCESSED",
        message: "Order has already been processed",
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        changedByUserId: user.id,
        fromStatus: "SUBMITTED",
        toStatus: "ACCEPTED",
        note: "Order accepted by cashier",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "ORDER_ACCEPTED",
        entityType: "order",
        entityId: id,
        metadata: {
          username: user.username,
          role: user.role,
        },
      },
    });

    return tx.order.findUnique({
      where: { id },
      include: {
        table: true,
        orderItems: true,
        acceptedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        transaction: true,
        statusHistories: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            changedByUser: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  });

  return toOrderResponse(updatedOrder);
};

export const cancelOrder = async ({ id, payload, user }) => {
  const existingOrder = await findOrderById(id);

  if (!existingOrder) {
    throw new AppError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    });
  }

  if (["PAID", "CANCELLED", "EXPIRED"].includes(existingOrder.status)) {
    throw new AppError({
      statusCode: 409,
      code: "ORDER_ALREADY_PROCESSED",
      message: "Paid, cancelled, or expired orders cannot be changed",
      fields: {
        currentStatus: existingOrder.status,
      },
    });
  }

  const now = new Date();
  const fromStatus = existingOrder.status;

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id,
        status: {
          in: ["SUBMITTED", "ACCEPTED"],
        },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        version: {
          increment: 1,
        },
      },
    });

    if (result.count !== 1) {
      throw new AppError({
        statusCode: 409,
        code: "ORDER_ALREADY_PROCESSED",
        message: "Order has already been processed",
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        changedByUserId: user.id,
        fromStatus,
        toStatus: "CANCELLED",
        note: payload.note ?? "Order cancelled by internal user",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "ORDER_CANCELLED",
        entityType: "order",
        entityId: id,
        metadata: {
          username: user.username,
          role: user.role,
          fromStatus,
          note: payload.note ?? null,
        },
      },
    });

    return tx.order.findUnique({
      where: { id },
      include: {
        table: true,
        orderItems: true,
        acceptedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        transaction: true,
        statusHistories: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            changedByUser: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  });

  return toOrderResponse(updatedOrder);
};
