import { AppError } from "../../common/errors/AppError.js";
import { findAuditLogById, findAuditLogs } from "./auditLog.repository.js";

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const toStartDate = (dateString) => {
  if (!dateString) return undefined;
  return new Date(`${dateString}T00:00:00.000Z`);
};

const toEndDateExclusive = (dateString) => {
  if (!dateString) return undefined;
  return addDays(new Date(`${dateString}T00:00:00.000Z`), 1);
};

const toAuditLogResponse = (auditLog) => ({
  id: auditLog.id,
  userId: auditLog.userId,
  user: auditLog.user
    ? {
        id: auditLog.user.id,
        username: auditLog.user.username,
        fullName: auditLog.user.fullName,
        role: auditLog.user.role,
        isActive: auditLog.user.isActive,
      }
    : null,
  action: auditLog.action,
  entityType: auditLog.entityType,
  entityId: auditLog.entityId,
  metadata: auditLog.metadata,
  ipAddress: auditLog.ipAddress,
  userAgent: auditLog.userAgent,
  createdAt: auditLog.createdAt,
});

export const getAuditLogs = async (query) => {
  const auditLogs = await findAuditLogs({
    userId: query.userId,
    action: query.action,
    entityType: query.entityType,
    entityId: query.entityId,
    startDate: toStartDate(query.startDate),
    endDate: toEndDateExclusive(query.endDate),
    limit: query.limit,
  });

  return auditLogs.map(toAuditLogResponse);
};

export const getAuditLogById = async (id) => {
  const auditLog = await findAuditLogById(id);

  if (!auditLog) {
    throw new AppError({
      statusCode: 404,
      code: "AUDIT_LOG_NOT_FOUND",
      message: "Audit log not found",
    });
  }

  return toAuditLogResponse(auditLog);
};
