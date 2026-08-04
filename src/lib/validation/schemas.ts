import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  cost: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
});

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().refine((v) => v !== 0, "Quantity cannot be zero"),
  reason: z.string().min(1, "Reason is required"),
});

export const openSessionSchema = z.object({
  openingCash: z.coerce.number().min(0).default(0),
});

export const closeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  countedCash: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  sessionId: z.string().uuid(),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "Add at least one item"),
});

export const cashMovementSchema = z.object({
  sessionId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  movementType: z.enum(["in", "out"]),
  reason: z.string().min(1, "Reason is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type OpenSessionInput = z.infer<typeof openSessionSchema>;
export type CloseSessionInput = z.infer<typeof closeSessionSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CashMovementInput = z.infer<typeof cashMovementSchema>;
