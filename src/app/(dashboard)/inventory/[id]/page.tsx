import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/auth/context";
import { getProduct } from "@/application/products/product.service";
import { formatMoney } from "@/domain/shared/types";
import { Badge, Card } from "@/components/ui";
import { ProductEditForm } from "@/components/inventory/product-edit-form";
import { StockAdjustForm } from "@/components/inventory/stock-adjust-form";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  const product = await getProduct(ctx, id);
  const t = await getTranslations("inventory");
  const tCommon = await getTranslations("common");

  if (!product) notFound();

  const canManage = ctx.role === "admin" || ctx.role === "manager";
  const props = product.toProps();

  return (
    <>
      <div className="mb-6">
        <Link href="/inventory" className="text-sm text-brand hover:underline">
          {t("backToInventory")}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {!product.active ? (
            <Badge variant="default">{tCommon("inactive")}</Badge>
          ) : product.isLowStock ? (
            <Badge variant="warning">{t("lowStock")}</Badge>
          ) : (
            <Badge variant="success">{t("inStock")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t("details")}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{tCommon("sku")}</dt>
              <dd>{product.sku ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{tCommon("price")}</dt>
              <dd className="font-medium">{formatMoney(product.priceCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("stock")}</dt>
              <dd className="font-medium">{product.stockQuantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("minStock")}</dt>
              <dd>{product.minStock}</dd>
            </div>
          </dl>
        </Card>

        {canManage && (
          <>
            <ProductEditForm product={props} />
            <StockAdjustForm productId={product.id} />
          </>
        )}
      </div>
    </>
  );
}
