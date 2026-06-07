import { z } from "zod";

export const menuItemQuerySchema = z.object({
  name: z.string().trim().optional(),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
  availabilityStatus: z.enum(["AVAILABLE", "OUT_OF_STOCK"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
});

export const createMenuCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must not exceed 50 characters"),
  description: z.string().trim().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  name: z
    .string()
    .trim()
    .min(1, "Menu item name is required")
    .max(100, "Menu item name must not exceed 100 characters"),
  description: z.string().trim().optional().nullable(),
  price: z.coerce
    .number()
    .min(0, "Price must be greater than or equal to 0"),
  imageUrl: z.string().trim().url("Image URL must be valid").optional().nullable(),
  availabilityStatus: z
    .enum(["AVAILABLE", "OUT_OF_STOCK"])
    .default("AVAILABLE"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const updateMenuItemSchema = z.object({
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
  name: z
    .string()
    .trim()
    .min(1, "Menu item name is required")
    .max(100, "Menu item name must not exceed 100 characters")
    .optional(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce
    .number()
    .min(0, "Price must be greater than or equal to 0")
    .optional(),
  imageUrl: z.string().trim().url("Image URL must be valid").optional().nullable(),
  availabilityStatus: z.enum(["AVAILABLE", "OUT_OF_STOCK"]).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});
