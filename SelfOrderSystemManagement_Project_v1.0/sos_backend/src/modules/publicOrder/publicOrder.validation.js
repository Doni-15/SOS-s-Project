import { z } from "zod";

export const qrTokenQuerySchema = z.object({
  token: z.string().trim().min(1, "QR token is required"),
});

export const validateQrTokenSchema = z.object({
  token: z.string().trim().min(1, "QR token is required"),
});

const submitOrderItemSchema = z.object({
  menuItemId: z.string().uuid("Menu item ID must be a valid UUID"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity must not exceed 99"),
  note: z.string().trim().max(255, "Item note is too long").optional().nullable(),
});

export const submitOrderSchema = z
  .object({
    orderSessionId: z.string().uuid("Order session ID must be a valid UUID"),
    orderSessionToken: z
      .string()
      .trim()
      .min(1, "Order session token is required"),
    customerNote: z
      .string()
      .trim()
      .max(500, "Customer note is too long")
      .optional()
      .nullable(),
    items: z
      .array(submitOrderItemSchema)
      .min(1, "At least one order item is required")
      .max(30, "Order items must not exceed 30"),
  })
  .superRefine((payload, ctx) => {
    const menuItemIds = payload.items.map((item) => item.menuItemId);
    const uniqueMenuItemIds = new Set(menuItemIds);

    if (uniqueMenuItemIds.size !== menuItemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "Duplicate menu items are not allowed",
      });
    }
  });
