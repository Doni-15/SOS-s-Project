import { prisma } from "../../config/prisma.js";

export const findValidQrTokenByHash = async (tokenHash) => {
  return prisma.qrToken.findFirst({
    where: {
      tokenHash,
      isRevoked: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      table: {
        isActive: true,
      },
    },
    include: {
      table: true,
    },
  });
};

export const createOrderSession = async ({
  tableId,
  qrTokenId,
  sessionTokenHash,
  ipAddress,
  userAgent,
  expiresAt,
}) => {
  return prisma.orderSession.create({
    data: {
      tableId,
      qrTokenId,
      sessionTokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
    include: {
      table: true,
    },
  });
};

export const findActiveOrderSession = async ({
  orderSessionId,
  sessionTokenHash,
}) => {
  return prisma.orderSession.findFirst({
    where: {
      id: orderSessionId,
      sessionTokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
      table: {
        isActive: true,
      },
    },
    include: {
      table: true,
    },
  });
};

export const findPublicMenuItems = async () => {
  return prisma.menuItem.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
    },
    orderBy: [
      { category: { displayOrder: "asc" } },
      { displayOrder: "asc" },
      { name: "asc" },
    ],
  });
};

export const findMenuItemsByIds = async (menuItemIds) => {
  return prisma.menuItem.findMany({
    where: {
      id: {
        in: menuItemIds,
      },
    },
    include: {
      category: true,
    },
  });
};
