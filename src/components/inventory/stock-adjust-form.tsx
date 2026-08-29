"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card } from "@/components/ui";
import { adjustStockAction } from "@/app/actions";

export function StockAdjustForm({ productId }: { productId: string }) {
  const router = useRouter();
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);
    const result = await adjustStockAction(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    e.currentTarget.reset();
    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{t("adjustStock")}</h2>
      <p className="mb-4 text-sm text-muted">{t("adjustStockHint")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="quantity">{t("quantityChange")}</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            required
            placeholder={t("quantityPlaceholder")}
          />
        </div>
        <div>
          <Label htmlFor="reason">{tCommon("reason")}</Label>
          <Input id="reason" name="reason" required placeholder={t("reasonPlaceholder")} />
        </div>
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {t("stockUpdated")}
          </div>
        )}
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? tCommon("updating") : t("updateStock")}
        </Button>
      </form>
    </Card>
  );
}
