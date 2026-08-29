import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/auth/context";
import {
  getOpenSession,
  listRecentSessions,
  listSessionSalesView,
} from "@/application/register/register.service";
import { RegisterClient, RegisterSessionView } from "@/components/register/register-client";

function toView(
  session: Awaited<ReturnType<typeof getOpenSession>>,
): RegisterSessionView | null {
  if (!session) return null;
  const totals = session.sessionTotals;
  const props = session.toProps();
  return {
    id: props.id,
    status: props.status,
    openingCashCents: props.openingCashCents,
    openedAt: props.openedAt.toISOString(),
    closedAt: props.closedAt?.toISOString() ?? null,
    expectedCashCents: props.expectedCashCents,
    countedCashCents: props.countedCashCents,
    varianceCents: props.varianceCents,
    notes: props.notes,
    totals,
  };
}

export default async function RegisterPage() {
  const [ctx, t] = await Promise.all([
    getAuthContext(),
    getTranslations("register"),
  ]);
  const openSessionPromise = getOpenSession(ctx);
  const recentSessionsPromise = listRecentSessions(ctx, 10);
  const openSession = await openSessionPromise;
  const [recentSessions, sessionSales] = await Promise.all([
    recentSessionsPromise,
    openSession ? listSessionSalesView(ctx, openSession.id) : Promise.resolve([]),
  ]);
  const canClose = ctx.role === "admin" || ctx.role === "manager";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>

      <RegisterClient
        openSession={toView(openSession)}
        recentSessions={recentSessions.map((s) => toView(s)!)}
        sessionSales={sessionSales}
        canClose={canClose}
      />
    </>
  );
}
