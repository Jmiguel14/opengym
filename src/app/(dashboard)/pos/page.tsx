import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/auth/context";
import { listProducts } from "@/application/products/product.service";
import { getOpenSessionId, listSessionSalesView } from "@/application/register/register.service";
import { PosClient } from "@/components/pos/pos-client";
import { Badge } from "@/components/ui";

export default async function PosPage() {
  const [ctx, t] = await Promise.all([
    getAuthContext(),
    getTranslations("pos"),
  ]);
  const [products, sessionId] = await Promise.all([
    listProducts(ctx),
    getOpenSessionId(ctx),
  ]);

  const recentSales = sessionId
    ? (await listSessionSalesView(ctx, sessionId)).slice(0, 8)
    : [];

  const posProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceCents: p.priceCents,
    stockQuantity: p.stockQuantity,
    active: p.active,
  }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </div>
        {sessionId ? (
          <Badge variant="success">{t("registerOpen")}</Badge>
        ) : (
          <Badge variant="warning">{t("registerClosed")}</Badge>
        )}
      </div>

      <PosClient
        products={posProducts}
        sessionId={sessionId}
        recentSales={recentSales}
      />
    </>
  );
}
