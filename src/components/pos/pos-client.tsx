"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createSaleAction } from "@/app/actions";
import { formatMoney, PaymentMethod } from "@/domain/shared/types";
import { SessionSaleView } from "@/infrastructure/supabase/mappers/sale.mapper";
import { SessionSalesList } from "@/components/sales/session-sales-list";
import { cn } from "@/lib/utils";

export interface PosProduct {
  id: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
  active: boolean;
}

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

function CartPanel({
  cart,
  totalCents,
  paymentMethod,
  loading,
  error,
  lastSale,
  onUpdateQty,
  onPaymentChange,
  onCheckout,
  t,
  tCommon,
  tPayment,
  compact = false,
}: {
  cart: CartItem[];
  totalCents: number;
  paymentMethod: PaymentMethod;
  loading: boolean;
  error: string | null;
  lastSale: string | null;
  onUpdateQty: (productId: string, delta: number) => void;
  onPaymentChange: (method: PaymentMethod) => void;
  onCheckout: () => void;
  t: ReturnType<typeof useTranslations<"pos">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  tPayment: ReturnType<typeof useTranslations<"payment">>;
  compact?: boolean;
}) {
  return (
    <>
      <h2 className={cn("font-semibold", compact ? "mb-2 text-base" : "mb-4 text-lg")}>
        {t("cart")}
      </h2>

      {cart.length === 0 ? (
        <p className="text-sm text-muted">{t("tapToAdd")}</p>
      ) : (
        <ul className={cn("space-y-3", compact && "max-h-36 overflow-y-auto")}>
          {cart.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{item.name}</div>
                <div className="text-xs text-muted">
                  {formatMoney(item.priceCents)} {t("each")}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.productId, -1)}
                  className="rounded p-2 hover:bg-surface"
                  aria-label={tCommon("quantity")}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.productId, 1)}
                  className="rounded p-2 hover:bg-surface"
                  aria-label={tCommon("quantity")}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.productId, -item.quantity)}
                  className="rounded p-2 text-brand hover:bg-brand-muted"
                  aria-label={tCommon("cancel")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={cn("border-t border-border pt-4", compact ? "mt-3" : "mt-6")}>
        <div className="flex justify-between text-lg font-bold">
          <span>{tCommon("total")}</span>
          <span>{formatMoney(totalCents)}</span>
        </div>
      </div>

      <div className={compact ? "mt-3" : "mt-4"}>
        <p className="mb-2 text-sm font-medium">{t("paymentMethod")}</p>
        <div className="flex gap-2">
          {(["cash", "card", "transfer"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentChange(method)}
              className={cn(
                "min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm",
                paymentMethod === method
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {tPayment(method)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-brand/20 bg-brand-muted px-3 py-2 text-sm text-brand">
          {error}
        </div>
      )}
      {lastSale && (
        <div className="mt-3 rounded-lg border border-brand/20 bg-brand-muted px-3 py-2 text-sm text-brand">
          {t("saleCompleted", { amount: lastSale })}
        </div>
      )}

      <Button
        className={cn("w-full", compact ? "mt-3" : "mt-4")}
        size="lg"
        disabled={loading || cart.length === 0}
        onClick={onCheckout}
      >
        {loading ? tCommon("processing") : t("completeSale")}
      </Button>
    </>
  );
}

export function PosClient({
  products,
  sessionId,
  recentSales,
}: {
  products: PosProduct[];
  sessionId: string | null;
  recentSales: SessionSaleView[];
}) {
  const router = useRouter();
  const t = useTranslations("pos");
  const tCommon = useTranslations("common");
  const tPayment = useTranslations("payment");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<string | null>(null);

  const activeProducts = products.filter((p) => p.active && p.stockQuantity > 0);

  const totalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  function addToCart(product: PosProduct) {
    setLastSale(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number) {
    setLastSale(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const product = products.find((p) => p.id === productId);
          const maxQty = product?.stockQuantity ?? item.quantity;
          const newQty = Math.min(maxQty, Math.max(0, item.quantity + delta));
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  async function checkout() {
    if (!sessionId || cart.length === 0) return;
    setLoading(true);
    setError(null);

    const result = await createSaleAction({
      sessionId,
      paymentMethod,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLastSale(formatMoney(result.data.totalCents));
    setCart([]);
    router.refresh();
    setLoading(false);
  }

  const cartProps = {
    cart,
    totalCents,
    paymentMethod,
    loading,
    error,
    lastSale,
    onUpdateQty: updateQty,
    onPaymentChange: setPaymentMethod,
    onCheckout: checkout,
    t,
    tCommon,
    tPayment,
  };

  if (!sessionId) {
    return (
      <Card className="text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted" />
        <h2 className="mt-4 text-lg font-semibold">{t("registerClosedTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t("registerClosedHint")}</p>
        <Link href="/register" className="mt-4 inline-block">
          <Button>{t("openRegister")}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={cn("lg:col-span-2", cart.length > 0 && "pb-72 lg:pb-0")}>
          <Card className="overflow-hidden p-0">
            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-2 xl:grid-cols-3">
              {activeProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="min-h-[5rem] rounded-lg border border-border p-4 text-left transition active:scale-[0.98] hover:border-brand hover:bg-brand-muted sm:min-h-[5.5rem]"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 text-brand">{formatMoney(product.priceCents)}</div>
                  <div className="mt-1 text-xs text-muted">
                    {t("inStock", { count: product.stockQuantity })}
                  </div>
                </button>
              ))}
            </div>
            {activeProducts.length === 0 && (
              <p className="p-8 text-center text-muted">{t("noProducts")}</p>
            )}
          </Card>
        </div>

        <div className="hidden lg:block">
          <Card className="sticky top-6">
            <CartPanel {...cartProps} />
          </Card>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-surface-elevated p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] lg:hidden">
          <CartPanel {...cartProps} compact />
        </div>
      )}

      <SessionSalesList
        sales={recentSales}
        title={t("recentSales")}
        emptyMessage={t("recentSalesEmpty")}
        compact
      />
    </div>
  );
}
