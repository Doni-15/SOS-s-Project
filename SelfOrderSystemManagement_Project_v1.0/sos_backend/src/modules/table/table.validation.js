import { z } from "zod";

const tableNumberSchema = z
  .string()
  .trim()
  .min(1, "Table number is required")
  .max(20, "Table number must not exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Table number can only contain letters, numbers, dot, underscore, or dash"
  );

export const tableQuerySchema = z.object({
  search: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const tableParamSchema = z.object({
  id: z.string().uuid("Table ID must be a valid UUID"),
});

export const qrTokenParamSchema = z.object({
  id: z.string().uuid("QR token ID must be a valid UUID"),
});

export const createTableSchema = z.object({
  tableNumber: tableNumberSchema,
  label: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateTableSchema = z
  .object({
    tableNumber: tableNumberSchema.optional(),
    label: z.string().trim().max(100).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });

export const qrTokenQuerySchema = z.object({
  isRevoked: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const generateQrTokenSchema = z.object({
  revokeExistingActiveTokens: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});
