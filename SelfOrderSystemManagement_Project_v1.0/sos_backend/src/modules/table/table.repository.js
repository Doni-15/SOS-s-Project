import { prisma } from "../../config/prisma.js";

const tableSelect = {
  id: true,
  tableNumber: true,
  label: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const qrTokenSelect = {
  id: true,
  tableId: true,
  tokenValue: true,
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
};

export const findTables = async ({ search, isActive, limit }) => {
  return prisma.diningTable.findMany({
    where: {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              {
                tableNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                label: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    select: {
      ...tableSelect,
      _count: {
        select: {
          orders: true,
          qrTokens: true,
        },
      },
      qrTokens: {
        where: {
          isRevoked: false,
        },
        select: {
          id: true,
          tokenValue: true,
          isRevoked: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      tableNumber: "asc",
    },
    take: limit,
  });
};

export const findTableById = async (id) => {
  return prisma.diningTable.findUnique({
    where: { id },
    select: {
      ...tableSelect,
      _count: {
        select: {
          orders: true,
          orderSessions: true,
          qrTokens: true,
        },
      },
      qrTokens: {
        select: {
          id: true,
          tokenValue: true,
          isRevoked: true,
          revokedAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
};

export const findTableByNumber = async (tableNumber) => {
  return prisma.diningTable.findUnique({
    where: { tableNumber },
  });
};

export const findQrTokensByTableId = async ({ tableId, isRevoked, limit }) => {
  return prisma.qrToken.findMany({
    where: {
      tableId,
      ...(isRevoked !== undefined ? { isRevoked } : {}),
    },
    select: qrTokenSelect,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const findQrTokenById = async (id) => {
  return prisma.qrToken.findUnique({
    where: { id },
    select: qrTokenSelect,
  });
};
