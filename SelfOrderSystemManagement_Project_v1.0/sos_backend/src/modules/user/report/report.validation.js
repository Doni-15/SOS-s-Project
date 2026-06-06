import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const reportQuerySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

export const topMenuItemsQuerySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
