"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, Badge } from "@/components/ui";
import {
  openSessionAction,
  closeSessionAction,
  cashMovementAction,
} from "@/app/actions";
import { formatMoney } from "@/domain/shared/types";
import { formatDateTime } from "@/lib/format-date";
import { SessionSaleView } from "@/infrastructure/supabase/mappers/sale.mapper";
import { SessionSalesList } from "@/components/sales/session-sales-list";

export interface RegisterSessionView {
  id: string;
  status: "open" | "closed";
  openingCashCents: number;
  openedAt: string;
  closedAt: string | null;
  expectedCashCents: number | null;
  countedCashCents: number | null;
  varianceCents: number | null;
  notes: string | null;
  totals: {
    cashSalesCents: number;
    cardSalesCents: number;
    transferSalesCents: number;
    cashInCents: number;
    cashOutCents: number;
    totalSalesCents: number;
    saleCount: number;
  };
}

export function RegisterClient({
  openSession,
  recentSessions,
  sessionSales,
  canClose,
}: {
  openSession: RegisterSessionView | null;
  recentSessions: RegisterSessionView[];
  sessionSales: SessionSaleView[];
  canClose: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("register");
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await openSessionAction(new FormData(e.currentTarget));
    if (!result.success) setError(result.error);
    else router.refresh();
    setLoading(false);
  }

  async function handleClose(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await closeSessionAction(new FormData(e.currentTarget));
    if (!result.success) setError(result.error);
    else router.refresh();
    setLoading(false);
  }

  async function handleCashMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await cashMovementAction(new FormData(e.currentTarget));
    if (!result.success) setError(result.error);
    else {
      e.currentTarget.reset();
      router.refresh();
    }
    setLoading(false);
  }

  const expectedCash = openSession
    ? openSession.openingCashCents +
      openSession.totals.cashSalesCents +
      openSession.totals.cashInCents -
      openSession.totals.cashOutCents
    : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-brand-muted px-4 py-3 text-sm text-brand border border-brand/20">
          {error}
        </div>
      )}

      {!openSession ? (
        <Card className="max-w-md">
          <h2 className="mb-4 text-lg font-semibold">{t("openTitle")}</h2>
          <p className="mb-4 text-sm text-muted">{t("openHint")}</p>
          <form onSubmit={handleOpen} className="space-y-4">
            <div>
              <Label htmlFor="openingCash">{t("openingCash")}</Label>
              <Input
                id="openingCash"
                name="openingCash"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? tCommon("opening") : t("openRegister")}
            </Button>
          </form>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label={t("openingCashLabel")}
              value={formatMoney(openSession.openingCashCents)}
            />
            <SummaryCard
              label={t("cashSales")}
              value={formatMoney(openSession.totals.cashSalesCents)}
            />
            <SummaryCard
              label={t("cardSales")}
              value={formatMoney(openSession.totals.cardSalesCents)}
            />
            <SummaryCard
              label={t("expectedCash")}
              value={formatMoney(expectedCash)}
              highlight
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t("sessionSummary")}</h2>
              <dl className="space-y-2 text-sm">
                <Row
                  label={tCommon("status")}
                  value={<Badge variant="success">{tCommon("open")}</Badge>}
                />
                <Row label={t("openedAt")} value={formatDateTime(openSession.openedAt)} />
                <Row
                  label={t("totalSales")}
                  value={formatMoney(openSession.totals.totalSalesCents)}
                />
                <Row
                  label={tCommon("transactions")}
                  value={String(openSession.totals.saleCount)}
                />
                <Row
                  label={t("transferSales")}
                  value={formatMoney(openSession.totals.transferSalesCents)}
                />
                <Row label={t("cashIn")} value={formatMoney(openSession.totals.cashInCents)} />
                <Row label={t("cashOut")} value={formatMoney(openSession.totals.cashOutCents)} />
              </dl>
            </Card>

            {canClose && (
              <Card>
                <h2 className="mb-4 text-lg font-semibold">{t("closeTitle")}</h2>
                <form onSubmit={handleClose} className="space-y-4">
                  <input type="hidden" name="sessionId" value={openSession.id} />
                  <div>
                    <Label htmlFor="countedCash">{t("countedCash")}</Label>
                    <Input
                      id="countedCash"
                      name="countedCash"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                    <p className="mt-1 text-xs text-muted">
                      {t("expected", { amount: formatMoney(expectedCash) })}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="notes">
                      {tCommon("notes")} ({tCommon("optional")})
                    </Label>
                    <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
                  </div>
                  <Button type="submit" variant="danger" disabled={loading}>
                    {loading ? tCommon("closing") : t("closeRegister")}
                  </Button>
                </form>
              </Card>
            )}

            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t("cashMovement")}</h2>
              <form onSubmit={handleCashMovement} className="space-y-4">
                <input type="hidden" name="sessionId" value={openSession.id} />
                <div>
                  <Label htmlFor="movementType">{tCommon("type")}</Label>
                  <select
                    id="movementType"
                    name="movementType"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                    required
                  >
                    <option value="in">{t("cashInOption")}</option>
                    <option value="out">{t("cashOutOption")}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">{tCommon("amount")}</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                </div>
                <div>
                  <Label htmlFor="reason">{tCommon("reason")}</Label>
                  <Input
                    id="reason"
                    name="reason"
                    required
                    placeholder={t("reasonPlaceholder")}
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={loading}>
                  {t("recordMovement")}
                </Button>
              </form>
            </Card>
          </div>

          <SessionSalesList
            sales={sessionSales}
            title={t("sessionSales")}
            emptyMessage={t("sessionSalesEmpty")}
          />
        </>
      )}

      {recentSessions.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t("recentSessions")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted">{t("opened")}</th>
                  <th className="pb-2 font-medium text-muted">{t("closedCol")}</th>
                  <th className="pb-2 font-medium text-muted">{tCommon("status")}</th>
                  <th className="pb-2 text-right font-medium text-muted">{t("totalSales")}</th>
                  <th className="pb-2 text-right font-medium text-muted">{t("variance")}</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-2">{formatDateTime(s.openedAt)}</td>
                    <td className="py-2">
                      {s.closedAt ? formatDateTime(s.closedAt) : "—"}
                    </td>
                    <td className="py-2">
                      <Badge variant={s.status === "open" ? "success" : "default"}>
                        {s.status === "open" ? tCommon("open") : tCommon("closed")}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      {formatMoney(s.totals.totalSalesCents)}
                    </td>
                    <td className="py-2 text-right">
                      {s.varianceCents != null ? (
                        <span
                          className={
                            s.varianceCents === 0
                              ? "text-brand"
                              : s.varianceCents > 0
                                ? "text-amber-400"
                                : "text-brand"
                          }
                        >
                          {formatMoney(s.varianceCents)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-brand/40 bg-brand-muted" : ""}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
