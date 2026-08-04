import { createClient } from "@/infrastructure/supabase/server";
import { mapProductRow, mapProductRows } from "@/infrastructure/supabase/mappers/product.mapper";
import { Product } from "@/domain/product/product";
import { AuthContext } from "@/domain/shared/types";
import { CreateProductInput, UpdateProductInput } from "@/lib/validation/schemas";
import { parseMoneyToCents } from "@/domain/shared/types";
import { Product as ProductEntity } from "@/domain/product/product";
import { ProductRow } from "@/infrastructure/supabase/database.types";

export async function listProducts(ctx: AuthContext): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("gym_id", ctx.gymId)
    .order("name");

  if (error) throw new Error(error.message);
  return mapProductRows((data ?? []) as ProductRow[]);
}

export async function getProduct(ctx: AuthContext, id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("gym_id", ctx.gymId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProductRow(data as ProductRow) : null;
}

export async function createProduct(
  ctx: AuthContext,
  input: CreateProductInput,
): Promise<Product> {
  ProductEntity.validateCreate({
    name: input.name,
    priceCents: parseMoneyToCents(input.price),
    stockQuantity: input.stockQuantity,
    minStock: input.minStock,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      gym_id: ctx.gymId,
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      description: input.description?.trim() || null,
      price_cents: parseMoneyToCents(input.price),
      cost_cents: input.cost != null ? parseMoneyToCents(input.cost) : null,
      stock_quantity: input.stockQuantity,
      min_stock: input.minStock,
      active: input.active,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapProductRow(data as ProductRow);
}

export async function updateProduct(
  ctx: AuthContext,
  input: UpdateProductInput,
): Promise<Product> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.sku !== undefined) updates.sku = input.sku?.trim() || null;
  if (input.description !== undefined)
    updates.description = input.description?.trim() || null;
  if (input.price !== undefined) updates.price_cents = parseMoneyToCents(input.price);
  if (input.cost !== undefined)
    updates.cost_cents = input.cost != null ? parseMoneyToCents(input.cost) : null;
  if (input.stockQuantity !== undefined) updates.stock_quantity = input.stockQuantity;
  if (input.minStock !== undefined) updates.min_stock = input.minStock;
  if (input.active !== undefined) updates.active = input.active;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("gym_id", ctx.gymId)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapProductRow(data as ProductRow);
}

export async function adjustStock(
  ctx: AuthContext,
  productId: string,
  quantity: number,
  reason: string,
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("adjust_product_stock", {
    p_product_id: productId,
    p_quantity: quantity,
    p_movement_type: "adjustment",
    p_reason: reason,
  });

  if (error) throw new Error(error.message);
  return mapProductRow(data as ProductRow);
}
