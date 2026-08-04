import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { listProducts } from "@/application/products/product.service";
import { getAuthContext } from "@/lib/auth/context";
import { formatMoney } from "@/domain/shared/types";

export default async function InventoryPage() {
  const ctx = await getAuthContext();
  const products = await listProducts(ctx);
  const canManage = ctx.role === "admin" || ctx.role === "manager";
  const t = await getTranslations("inventory");
  const tCommon = await getTranslations("common");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted">{t("productCount", { count: products.length })}</p>
        </div>
        {canManage && (
          <Link href="/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addProduct")}
            </Button>
          </Link>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  {t("product")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  {tCommon("sku")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  {tCommon("price")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  {t("stock")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  {tCommon("status")}
                </th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(product.priceCents)}
                  </td>
                  <td className="px-4 py-3 text-right">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    {!product.active ? (
                      <Badge variant="default">{tCommon("inactive")}</Badge>
                    ) : product.isLowStock ? (
                      <Badge variant="warning">{t("lowStock")}</Badge>
                    ) : (
                      <Badge variant="success">{t("inStock")}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/inventory/${product.id}`} className="text-brand hover:underline">
                      {tCommon("view")}
                    </Link>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
