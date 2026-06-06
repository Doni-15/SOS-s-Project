import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must not exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Username can only contain letters, numbers, dot, underscore, or dash"
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters");

export const userQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["OWNER", "CASHIER"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const userParamSchema = z.object({
  id: z.string().uuid("User ID must be a valid UUID"),
});

export const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  fullName: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  role: z.enum(["OWNER", "CASHIER"]),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z
  .object({
    username: usernameSchema.optional(),
    fullName: z.string().trim().max(100).optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    role: z.enum(["OWNER", "CASHIER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });

export const resetUserPasswordSchema = z.object({
  newPassword: passwordSchema,
});
