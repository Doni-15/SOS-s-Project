import { successResponse } from "../../common/responses/apiResponse.js";
import {
  auditLogParamSchema,
  auditLogQuerySchema,
} from "./auditLog.validation.js";
import { getAuditLogById, getAuditLogs } from "./auditLog.service.js";

export const getAuditLogsController = async (req, res, next) => {
  try {
    const query = auditLogQuerySchema.parse(req.query);
    const auditLogs = await getAuditLogs(query);

    return successResponse(res, {
      message: "Audit logs retrieved successfully",
      data: {
        auditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogDetailController = async (req, res, next) => {
  try {
    const params = auditLogParamSchema.parse(req.params);
    const auditLog = await getAuditLogById(params.id);

    return successResponse(res, {
      message: "Audit log retrieved successfully",
      data: {
        auditLog,
      },
    });
  } catch (error) {
    next(error);
  }
};
