"use client";

import { useTranslations } from "next-intl";
import { Card, Badge } from "@/components/ui";
import { formatMoney, PaymentMethod } from "@/domain/shared/types";
import { formatTime } from "@/lib/format-date";
import { SessionSaleView } from "@/infrastructure/supabase/mappers/sale.mapper";

export function SessionSalesList({
  sales,
  title,
  emptyMessage,
  compact = false,
}: {
  sales: SessionSaleView[];
  title: string;
  emptyMessage: string;
  compact?: boolean;
}) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const tPayment = useTranslations("payment");

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {sales.length > 0 && (
          <span className="text-sm text-muted">
            {sales.length}{" "}
            {sales.length !== 1 ? tCommon("sales") : tCommon("sale")}
          </span>
        )}
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted">{t("time")}</th>
                <th className="pb-2 pr-4 font-medium text-muted">{t("items")}</th>
                {!compact && (
                  <th className="pb-2 pr-4 font-medium text-muted">{t("payment")}</th>
                )}
                <th className="pb-2 text-right font-medium text-muted">
                  {tCommon("total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2.5 pr-4 whitespace-nowrap text-muted">
                    {formatTime(sale.createdAt)}
                  </td>
                  <td className="py-2.5 pr-4 max-w-xs truncate" title={sale.itemSummary}>
                    {sale.itemSummary}
                  </td>
                  {!compact && (
                    <td className="py-2.5 pr-4">
                      <Badge variant="default">
                        {tPayment(sale.paymentMethod as PaymentMethod)}
                      </Badge>
                    </td>
                  )}
                  <td className="py-2.5 text-right font-medium">
                    {formatMoney(sale.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td
                  colSpan={compact ? 2 : 3}
                  className="pt-3 text-right text-sm text-muted"
                >
                  {tCommon("sessionTotal")}
                </td>
                <td className="pt-3 text-right font-bold">
                  {formatMoney(sales.reduce((sum, s) => sum + s.totalCents, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
