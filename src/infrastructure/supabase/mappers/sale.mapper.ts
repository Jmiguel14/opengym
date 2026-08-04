import { PaymentMethod } from "@/domain/shared/types";

export interface SessionSaleItemView {
  name: string;
  quantity: number;
  subtotalCents: number;
}

export interface SessionSaleView {
  id: string;
  createdAt: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
  items: SessionSaleItemView[];
  itemSummary: string;
}

type RawSaleItem = {
  quantity: number;
  subtotal_cents: number;
  products: { name: string } | { name: string }[] | null;
};

export type RawSale = {
  id: string;
  created_at: string;
  total_cents: number;
  payment_method: PaymentMethod;
  sale_items: RawSaleItem[] | null;
};

function productName(products: RawSaleItem["products"]): string {
  if (!products) return "Product";
  if (Array.isArray(products)) return products[0]?.name ?? "Product";
  return products.name;
}

export function mapSessionSale(raw: RawSale): SessionSaleView {
  const items = (raw.sale_items ?? []).map((item) => ({
    name: productName(item.products),
    quantity: item.quantity,
    subtotalCents: item.subtotal_cents,
  }));

  const itemSummary = items
    .map((item) => (item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name))
    .join(", ");

  return {
    id: raw.id,
    createdAt: raw.created_at,
    totalCents: raw.total_cents,
    paymentMethod: raw.payment_method,
    items,
    itemSummary: itemSummary || "—",
  };
}

export function mapSessionSales(raw: RawSale[]): SessionSaleView[] {
  return raw.map(mapSessionSale);
}
