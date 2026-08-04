import {
  CashRegisterSession,
  SessionTotals,
} from "@/domain/register/cash-register-session";
import { SessionRow } from "@/infrastructure/supabase/database.types";
import { SaleRow } from "@/infrastructure/supabase/database.types";

export function mapSessionRow(
  row: SessionRow,
  totals?: SessionTotals,
): CashRegisterSession {
  return new CashRegisterSession(
    {
      id: row.id,
      gymId: row.gym_id,
      openedBy: row.opened_by,
      openedAt: new Date(row.opened_at),
      openingCashCents: row.opening_cash_cents,
      closedBy: row.closed_by,
      closedAt: row.closed_at ? new Date(row.closed_at) : null,
      expectedCashCents: row.expected_cash_cents,
      countedCashCents: row.counted_cash_cents,
      varianceCents: row.variance_cents,
      notes: row.notes,
      status: row.status,
    },
    totals,
  );
}

export function computeSessionTotals(sales: SaleRow[]): SessionTotals {
  return sales.reduce<SessionTotals>(
    (acc, sale) => {
      acc.totalSalesCents += sale.total_cents;
      acc.saleCount += 1;
      if (sale.payment_method === "cash") acc.cashSalesCents += sale.total_cents;
      if (sale.payment_method === "card") acc.cardSalesCents += sale.total_cents;
      if (sale.payment_method === "transfer")
        acc.transferSalesCents += sale.total_cents;
      return acc;
    },
    {
      cashSalesCents: 0,
      cardSalesCents: 0,
      transferSalesCents: 0,
      cashInCents: 0,
      cashOutCents: 0,
      totalSalesCents: 0,
      saleCount: 0,
    },
  );
}
