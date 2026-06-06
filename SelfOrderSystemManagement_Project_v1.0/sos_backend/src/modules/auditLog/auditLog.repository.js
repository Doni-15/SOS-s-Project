import { prisma } from "../../config/prisma.js";

const auditLogInclude = {
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  },
};

export const findAuditLogs = async ({
  userId,
  action,
  entityType,
  entityId,
  startDate,
  endDate,
  limit,
}) => {
  return prisma.auditLog.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(action
        ? {
            action: {
              contains: action,
              mode: "insensitive",
            },
          }
        : {}),
      ...(entityType
        ? {
            entityType: {
              contains: entityType,
              mode: "insensitive",
            },
          }
        : {}),
      ...(entityId ? { entityId } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lt: endDate } : {}),
            },
          }
        : {}),
    },
    include: auditLogInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const findAuditLogById = async (id) => {
  return prisma.auditLog.findUnique({
    where: { id },
    include: auditLogInclude,
  });
};
