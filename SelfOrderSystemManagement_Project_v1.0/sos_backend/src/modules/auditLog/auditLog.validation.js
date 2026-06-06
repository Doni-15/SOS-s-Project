import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const auditLogQuerySchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID").optional(),
  action: z.string().trim().min(1).max(100).optional(),
  entityType: z.string().trim().min(1).max(100).optional(),
  entityId: z.string().trim().min(1).max(100).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const auditLogParamSchema = z.object({
  id: z.string().uuid("Audit log ID must be a valid UUID"),
});
