import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { toOrderResponse as serializeOrderResponse } from "../../common/serializers/order.serializer.js";
import {
  ORDER_STATUS,
  assertOrderTransitionAllowed,
} from "../../common/constants/orderStatus.js";
import { findOrderById, findOrders } from "./internalOrder.repository.js";

export const getInternalOrders = async (query = {}) => {
  const result = await findOrders(query);

  const orders = Array.isArray(result)
    ? result
    : Array.isArray(result?.items)
      ? result.items
      : [];

  return orders.map(serializeOrderResponse);
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

  return serializeOrderResponse(order);
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

  assertOrderTransitionAllowed({
    from: existingOrder.status,
    to: ORDER_STATUS.ACCEPTED,
    action: "accept this order",
  });

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

  return serializeOrderResponse(updatedOrder);
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

  assertOrderTransitionAllowed({
    from: existingOrder.status,
    to: ORDER_STATUS.CANCELLED,
    action: "cancel this order",
  });

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

  return serializeOrderResponse(updatedOrder);
};

export const markOrderServed = async ({ id, user }) => {
  const order = await findOrderById(id);

  if (!order) {
    throw new AppError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    });
  }

  assertOrderTransitionAllowed({
    from: order.status,
    to: ORDER_STATUS.SERVED,
    action: "mark this order as served",
  });

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id,
        status: "ACCEPTED",
        version: order.version,
      },
      data: {
        status: "SERVED",
        servedAt: now,
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
        fromStatus: "ACCEPTED",
        toStatus: "SERVED",
        note: "Order served by cashier",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "ORDER_SERVED",
        entityType: "order",
        entityId: id,
        metadata: {
          username: user.username,
          role: user.role,
          orderNumber: order.orderNumber,
        },
      },
    });
  });

  const updatedOrder = await findOrderById(id);
  return serializeOrderResponse(updatedOrder);
};
