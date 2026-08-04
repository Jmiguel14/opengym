import { Product } from "@/domain/product/product";
import { ProductRow } from "@/infrastructure/supabase/database.types";

export function mapProductRow(row: ProductRow): Product {
  return new Product({
    id: row.id,
    gymId: row.gym_id,
    name: row.name,
    sku: row.sku,
    description: row.description,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    stockQuantity: row.stock_quantity,
    minStock: row.min_stock,
    active: row.active,
  });
}

export function mapProductRows(rows: ProductRow[]): Product[] {
  return rows.map(mapProductRow);
}
