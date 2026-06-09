import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const reportPeriodQuerySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  period: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
});

export const reportQuerySchema = reportPeriodQuerySchema;

export const topMenuItemsQuerySchema = reportPeriodQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
