"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";
import {
  createProduct,
  updateProduct,
  adjustStock,
} from "@/application/products/product.service";
import {
  openSession,
  closeSession,
  createSale,
  addCashMovement,
} from "@/application/register/register.service";
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  openSessionSchema,
  closeSessionSchema,
  createSaleSchema,
  cashMovementSchema,
} from "@/lib/validation/schemas";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

import esMessages from "../../messages/es.json";

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error) return { success: false, error: error.message };
  return { success: false, error: esMessages.common.somethingWrong };
}

export async function createProductAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  let productId: string;
  try {
    const ctx = await getAuthContext();
    const parsed = createProductSchema.parse({
      name: formData.get("name"),
      sku: formData.get("sku") || undefined,
      description: formData.get("description") || undefined,
      price: formData.get("price"),
      cost: formData.get("cost") || undefined,
      stockQuantity: formData.get("stockQuantity") || 0,
      minStock: formData.get("minStock") || 0,
      active: formData.get("active") === "on",
    });

    const product = await createProduct(ctx, parsed);
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    productId = product.id;
  } catch (error) {
    return toActionError(error);
  }

  redirect(`/inventory/${productId}`);
}

export async function updateProductAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthContext();
    const parsed = updateProductSchema.parse({
      id: formData.get("id"),
      name: formData.get("name") || undefined,
      sku: formData.get("sku") || undefined,
      description: formData.get("description") || undefined,
      price: formData.get("price") || undefined,
      cost: formData.get("cost") || undefined,
      stockQuantity: formData.get("stockQuantity") || undefined,
      minStock: formData.get("minStock") || undefined,
      active: formData.has("active")
        ? formData.get("active") === "on"
        : undefined,
    });

    await updateProduct(ctx, parsed);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${parsed.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}

export async function adjustStockAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthContext();
    const parsed = adjustStockSchema.parse({
      productId: formData.get("productId"),
      quantity: formData.get("quantity"),
      reason: formData.get("reason"),
    });

    await adjustStock(ctx, parsed.productId, parsed.quantity, parsed.reason);
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}

export async function openSessionAction(
  formData: FormData,
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const ctx = await getAuthContext();
    const parsed = openSessionSchema.parse({
      openingCash: formData.get("openingCash") || 0,
    });

    const session = await openSession(ctx, parsed);
    revalidatePath("/register");
    revalidatePath("/dashboard");
    revalidatePath("/pos");
    return { success: true, data: { sessionId: session.id } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function closeSessionAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthContext();
    const parsed = closeSessionSchema.parse({
      sessionId: formData.get("sessionId"),
      countedCash: formData.get("countedCash"),
      notes: formData.get("notes") || undefined,
    });

    await closeSession(ctx, parsed);
    revalidatePath("/register");
    revalidatePath("/dashboard");
    revalidatePath("/pos");
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createSaleAction(input: {
  sessionId: string;
  paymentMethod: "cash" | "card" | "transfer";
  items: { productId: string; quantity: number }[];
}): Promise<ActionResult<{ saleId: string; totalCents: number }>> {
  try {
    const ctx = await getAuthContext();
    const parsed = createSaleSchema.parse(input);
    const result = await createSale(ctx, parsed);
    revalidatePath("/pos");
    revalidatePath("/register");
    revalidatePath("/dashboard");
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cashMovementAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const ctx = await getAuthContext();
    const parsed = cashMovementSchema.parse({
      sessionId: formData.get("sessionId"),
      amount: formData.get("amount"),
      movementType: formData.get("movementType"),
      reason: formData.get("reason"),
    });

    await addCashMovement(ctx, parsed);
    revalidatePath("/register");
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}