import { z } from "zod";

export const orderPaymentParamSchema = z.object({
  id: z.string().uuid("Order ID must be a valid UUID"),
});

export const createPaymentSchema = z.object({
  paidAmount: z.coerce
    .number()
    .min(0, "Paid amount must be greater than or equal to 0"),
  paymentMethod: z.enum(["CASH"]).default("CASH"),
});

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const transactionQuerySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const transactionParamSchema = z.object({
  id: z.string().uuid("Transaction ID must be a valid UUID"),
});

export const receiptParamSchema = z.object({
  id: z.string().uuid("Receipt ID must be a valid UUID"),
});

export const printReceiptFailedSchema = z.object({
  errorMessage: z
    .string()
    .trim()
    .min(1, "Error message is required")
    .max(1000, "Error message must not exceed 1000 characters")
    .default("Printer error"),
});
