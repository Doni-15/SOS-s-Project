import { z } from "zod";

import { ORDER_STATUS_VALUES } from "../../common/constants/orderStatus.js";

export const orderQuerySchema = z.object({
  status: z
    .enum(["SUBMITTED", "ACCEPTED", "SERVED", "PAID", "CANCELLED", "EXPIRED"])
    .optional(),
  tableNumber: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
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
