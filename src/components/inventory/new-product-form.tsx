"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card } from "@/components/ui";
import { createProductAction } from "@/app/actions";

export function NewProductForm() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);

    if (result && !result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/inventory" className="text-sm text-brand hover:underline">
          {t("backToInventory")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{t("addTitle")}</h1>
      </div>

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{tCommon("name")} *</Label>
            <Input id="name" name="name" required placeholder={t("namePlaceholder")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sku">{tCommon("sku")}</Label>
              <Input id="sku" name="sku" placeholder={t("skuPlaceholder")} />
            </div>
            <div>
              <Label htmlFor="price">{tCommon("price")} *</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="5.00" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cost">{tCommon("cost")}</Label>
              <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="2.50" />
            </div>
            <div>
              <Label htmlFor="stockQuantity">{t("initialStock")}</Label>
              <Input id="stockQuantity" name="stockQuantity" type="number" min="0" defaultValue="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="minStock">{t("minStockAlert")}</Label>
            <Input id="minStock" name="minStock" type="number" min="0" defaultValue="5" />
          </div>
          <div>
            <Label htmlFor="description">{tCommon("description")}</Label>
            <Input id="description" name="description" placeholder={t("descriptionPlaceholder")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked className="rounded accent-brand" />
            {t("activeForSale")}
          </label>

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? tCommon("saving") : t("createProduct")}
            </Button>
            <Link href="/inventory">
              <Button type="button" variant="secondary">
                {tCommon("cancel")}
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
