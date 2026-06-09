import crypto from "node:crypto";

import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { hashToken } from "../../common/utils/hashToken.js";
import {
  findQrTokenById,
  findQrTokensByTableId,
  findTableById,
  findTableByNumber,
  findTables,
} from "./table.repository.js";

const normalizeNullableString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmed = String(value).trim();
  return trimmed.length === 0 ? null : trimmed;
};

const normalizeTableNumber = (value) => {
  return String(value).trim().toUpperCase();
};

const toBooleanFilter = (value) => {
  if (value === undefined) return undefined;
  return value === "true";
};

const toDateOrNull = (value) => {
  if (value === undefined || value === null) return null;
  return new Date(value);
};

const toTableResponse = (table) => ({
  id: table.id,
  tableNumber: table.tableNumber,
  label: table.label,
  isActive: table.isActive,
  createdAt: table.createdAt,
  updatedAt: table.updatedAt,
  counts: table._count
    ? {
        orders: table._count.orders ?? 0,
        orderSessions: table._count.orderSessions ?? undefined,
        qrTokens: table._count.qrTokens ?? 0,
      }
    : undefined,
  activeQrToken: Array.isArray(table.qrTokens)
    ? table.qrTokens.find((qrToken) => qrToken.isRevoked === false) ?? null
    : undefined,
  recentQrTokens: Array.isArray(table.qrTokens) ? table.qrTokens : undefined,
});

const toQrTokenResponse = (qrToken) => ({
  id: qrToken.id,
  tableId: qrToken.tableId,
  table: qrToken.table
    ? {
        id: qrToken.table.id,
        tableNumber: qrToken.table.tableNumber,
        label: qrToken.table.label,
        isActive: qrToken.table.isActive,
      }
    : undefined,
  isRevoked: qrToken.isRevoked,
  revokedAt: qrToken.revokedAt,
  expiresAt: qrToken.expiresAt,
  createdAt: qrToken.createdAt,
  updatedAt: qrToken.updatedAt,
  token: qrToken.tokenValue ?? undefined,
});

const ensureTableExists = async (id) => {
  const table = await findTableById(id);

  if (!table) {
    throw new AppError({
      statusCode: 404,
      code: "TABLE_NOT_FOUND",
      message: "Table not found",
    });
  }

  return table;
};

const ensureTableNumberAvailable = async ({ tableNumber, excludeTableId = null }) => {
  const existingTable = await findTableByNumber(tableNumber);

  if (existingTable && existingTable.id !== excludeTableId) {
    throw new AppError({
      statusCode: 409,
      code: "TABLE_NUMBER_EXISTS",
      message: "Table number already exists",
      fields: {
        tableNumber,
      },
    });
  }
};

export const getTables = async (query) => {
  const tables = await findTables({
    search: query.search,
    isActive: toBooleanFilter(query.isActive),
    limit: query.limit,
  });

  return tables.map(toTableResponse);
};

export const getTableById = async (id) => {
  const table = await ensureTableExists(id);
  return toTableResponse(table);
};

export const createTable = async ({ payload, actor }) => {
  const tableNumber = normalizeTableNumber(payload.tableNumber);

  await ensureTableNumberAvailable({ tableNumber });

  const table = await prisma.$transaction(async (tx) => {
    const createdTable = await tx.diningTable.create({
      data: {
        tableNumber,
        label: normalizeNullableString(payload.label),
        isActive: payload.isActive,
      },
      select: {
        id: true,
        tableNumber: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "TABLE_CREATED",
        entityType: "dining_table",
        entityId: createdTable.id,
        metadata: {
          tableNumber: createdTable.tableNumber,
          label: createdTable.label,
          isActive: createdTable.isActive,
          createdBy: actor.username,
        },
      },
    });

    return createdTable;
  });

  return table;
};

export const updateTable = async ({ id, payload, actor }) => {
  const existingTable = await ensureTableExists(id);

  const data = {};

  if (payload.tableNumber !== undefined) {
    const tableNumber = normalizeTableNumber(payload.tableNumber);

    await ensureTableNumberAvailable({
      tableNumber,
      excludeTableId: id,
    });

    data.tableNumber = tableNumber;
  }

  if (payload.label !== undefined) {
    data.label = normalizeNullableString(payload.label);
  }

  if (payload.isActive !== undefined) {
    data.isActive = payload.isActive;
  }

  const table = await prisma.$transaction(async (tx) => {
    const updatedTable = await tx.diningTable.update({
      where: { id },
      data,
      select: {
        id: true,
        tableNumber: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (payload.isActive === false) {
      await tx.qrToken.updateMany({
        where: {
          tableId: id,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "TABLE_UPDATED",
        entityType: "dining_table",
        entityId: id,
        metadata: {
          previous: {
            tableNumber: existingTable.tableNumber,
            label: existingTable.label,
            isActive: existingTable.isActive,
          },
          next: {
            tableNumber: updatedTable.tableNumber,
            label: updatedTable.label,
            isActive: updatedTable.isActive,
          },
          updatedBy: actor.username,
          revokedActiveQrTokens: payload.isActive === false,
        },
      },
    });

    return updatedTable;
  });

  return table;
};

export const activateTable = async ({ id, actor }) => {
  await ensureTableExists(id);

  const table = await prisma.$transaction(async (tx) => {
    const updatedTable = await tx.diningTable.update({
      where: { id },
      data: {
        isActive: true,
      },
      select: {
        id: true,
        tableNumber: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "TABLE_ACTIVATED",
        entityType: "dining_table",
        entityId: id,
        metadata: {
          tableNumber: updatedTable.tableNumber,
          activatedBy: actor.username,
        },
      },
    });

    return updatedTable;
  });

  return table;
};

export const deactivateTable = async ({ id, actor }) => {
  await ensureTableExists(id);

  const table = await prisma.$transaction(async (tx) => {
    const updatedTable = await tx.diningTable.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        tableNumber: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.qrToken.updateMany({
      where: {
        tableId: id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "TABLE_DEACTIVATED",
        entityType: "dining_table",
        entityId: id,
        metadata: {
          tableNumber: updatedTable.tableNumber,
          deactivatedBy: actor.username,
          revokedActiveQrTokens: true,
        },
      },
    });

    return updatedTable;
  });

  return table;
};

export const getTableQrTokens = async ({ tableId, query }) => {
  await ensureTableExists(tableId);

  const qrTokens = await findQrTokensByTableId({
    tableId,
    isRevoked: toBooleanFilter(query.isRevoked),
    limit: query.limit,
  });

  return qrTokens.map(toQrTokenResponse);
};

export const generateTableQrToken = async ({ tableId, payload, actor }) => {
  const existingTable = await ensureTableExists(tableId);

  if (!existingTable.isActive) {
    throw new AppError({
      statusCode: 409,
      code: "TABLE_INACTIVE",
      message: "Cannot generate QR token for inactive table",
    });
  }

  const rawToken = crypto.randomUUID();
  const tokenHash = hashToken(rawToken);
  const expiresAt = toDateOrNull(payload.expiresAt);

  const qrToken = await prisma.$transaction(async (tx) => {
    if (payload.revokeExistingActiveTokens) {
      await tx.qrToken.updateMany({
        where: {
          tableId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
    }

    const createdQrToken = await tx.qrToken.create({
      data: {
        tableId,
        tokenHash,
        tokenValue: rawToken,
        expiresAt,
        isRevoked: false,
      },
      select: {
        id: true,
        tableId: true,
        isRevoked: true,
        revokedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        table: {
          select: {
            id: true,
            tableNumber: true,
            label: true,
            isActive: true,
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "QR_TOKEN_GENERATED",
        entityType: "qr_token",
        entityId: createdQrToken.id,
        metadata: {
          tableId,
          tableNumber: createdQrToken.table.tableNumber,
          revokeExistingActiveTokens: payload.revokeExistingActiveTokens,
          expiresAt,
          generatedBy: actor.username,
          note: "QR token is stored so owner can re-display, copy, print, or download the active QR.",
        },
      },
    });

    return createdQrToken;
  });

  return {
    ...toQrTokenResponse(qrToken),
    token: rawToken,
    note: "QR token is stored so owner can re-display, copy, print, or download the active QR.",
  };
};

export const revokeQrToken = async ({ id, actor }) => {
  const existingQrToken = await findQrTokenById(id);

  if (!existingQrToken) {
    throw new AppError({
      statusCode: 404,
      code: "QR_TOKEN_NOT_FOUND",
      message: "QR token not found",
    });
  }

  if (existingQrToken.isRevoked) {
    throw new AppError({
      statusCode: 409,
      code: "QR_TOKEN_ALREADY_REVOKED",
      message: "QR token is already revoked",
    });
  }

  const qrToken = await prisma.$transaction(async (tx) => {
    const revokedQrToken = await tx.qrToken.update({
      where: { id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
      select: {
        id: true,
        tableId: true,
        isRevoked: true,
        revokedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        table: {
          select: {
            id: true,
            tableNumber: true,
            label: true,
            isActive: true,
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: "QR_TOKEN_REVOKED",
        entityType: "qr_token",
        entityId: id,
        metadata: {
          tableId: revokedQrToken.tableId,
          tableNumber: revokedQrToken.table.tableNumber,
          revokedBy: actor.username,
        },
      },
    });

    return revokedQrToken;
  });

  return toQrTokenResponse(qrToken);
};
