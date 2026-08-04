import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/auth/context";
import { listProducts } from "@/application/products/product.service";
import { getOpenSession, listSessionSalesView } from "@/application/register/register.service";
import { PosClient } from "@/components/pos/pos-client";
import { Badge } from "@/components/ui";

export default async function PosPage() {
  const ctx = await getAuthContext();
  const t = await getTranslations("pos");
  const [products, session] = await Promise.all([
    listProducts(ctx),
    getOpenSession(ctx),
  ]);

  const recentSales = session
    ? (await listSessionSalesView(ctx, session.id)).slice(0, 8)
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </div>
        {session ? (
          <Badge variant="success">{t("registerOpen")}</Badge>
        ) : (
          <Badge variant="warning">{t("registerClosed")}</Badge>
        )}
      </div>

      <PosClient
        products={posProducts}
        sessionId={session?.id ?? null}
        recentSales={recentSales}
      />
    </>
  );
}
