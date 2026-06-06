import { z } from "zod";

export const orderQuerySchema = z.object({
  status: z
    .enum(["SUBMITTED", "ACCEPTED", "PAID", "CANCELLED", "EXPIRED"])
    .optional(),
  tableNumber: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const orderParamSchema = z.object({
  id: z.string().uuid("Order ID must be a valid UUID"),
});

export const cancelOrderSchema = z.object({
  note: z
    .string()
    .trim()
    .max(500, "Cancel note must not exceed 500 characters")
    .optional()
    .nullable(),
});
