"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card } from "@/components/ui";
import { updateProductAction } from "@/app/actions";
import type { ProductProps } from "@/domain/product/product";

export function ProductEditForm({ product }: { product: ProductProps }) {
  const router = useRouter();
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("id", product.id);
    const result = await updateProductAction(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{t("editProduct")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <div>
          <Label htmlFor="name">{tCommon("name")}</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sku">{tCommon("sku")}</Label>
            <Input id="sku" name="sku" defaultValue={product.sku ?? ""} />
          </div>
          <div>
            <Label htmlFor="price">{tCommon("price")}</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(product.priceCents / 100).toFixed(2)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minStock">{t("minStock")}</Label>
            <Input
              id="minStock"
              name="minStock"
              type="number"
              min="0"
              defaultValue={product.minStock}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product.active}
                className="rounded accent-brand"
              />
              {tCommon("active")}
            </label>
          </div>
        </div>
        {error && (
          <div className="rounded-lg bg-brand-muted px-3 py-2 text-sm text-brand border border-brand/20">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? tCommon("saving") : t("saveChanges")}
        </Button>
      </form>
    </Card>
  );
}
