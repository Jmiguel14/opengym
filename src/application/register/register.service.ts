import { createClient } from "@/infrastructure/supabase/server";
import { AuthContext, parseMoneyToCents } from "@/domain/shared/types";
import { CashRegisterSession } from "@/domain/register/cash-register-session";
import {
  computeSessionTotals,
  mapSessionRow,
} from "@/infrastructure/supabase/mappers/session.mapper";
import {
  CloseSessionInput,
  CreateSaleInput,
  OpenSessionInput,
  CashMovementInput,
} from "@/lib/validation/schemas";
import { CashRegisterSession as SessionEntity } from "@/domain/register/cash-register-session";
import {
  CashMovementRow,
  SaleRow,
  SessionRow,
} from "@/infrastructure/supabase/database.types";
import {
  mapSessionSales,
  SessionSaleView,
  RawSale,
} from "@/infrastructure/supabase/mappers/sale.mapper";

export type { SessionSaleView };

export async function getOpenSessionId(
  ctx: AuthContext,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("id")
    .eq("gym_id", ctx.gymId)
    .eq("status", "open")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function getOpenSession(
  ctx: AuthContext,
): Promise<CashRegisterSession | null> {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("gym_id", ctx.gymId)
    .eq("status", "open")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!session) return null;

  const [enriched] = await enrichSessions([session]);
  return enriched;
}

export async function getSessionById(
  ctx: AuthContext,
  sessionId: string,
): Promise<CashRegisterSession | null> {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("gym_id", ctx.gymId)
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!session) return null;

  const [enriched] = await enrichSessions([session]);
  return enriched;
}

export async function listRecentSessions(
  ctx: AuthContext,
  limit = 10,
): Promise<CashRegisterSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("gym_id", ctx.gymId)
    .order("opened_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return enrichSessions(data ?? []);
}

async function enrichSessions(
  sessions: SessionRow[],
): Promise<CashRegisterSession[]> {
  if (sessions.length === 0) return [];

  const supabase = await createClient();
  const ids = sessions.map((s) => s.id);

  const [salesResult, movementsResult] = await Promise.all([
    supabase.from("sales").select("*").in("session_id", ids),
    supabase.from("cash_movements").select("*").in("session_id", ids),
  ]);

  const salesBySession = new Map<string, SaleRow[]>();
  for (const sale of (salesResult.data ?? []) as SaleRow[]) {
    const list = salesBySession.get(sale.session_id) ?? [];
    list.push(sale);
    salesBySession.set(sale.session_id, list);
  }

  const movementsBySession = new Map<string, CashMovementRow[]>();
  for (const movement of (movementsResult.data ?? []) as CashMovementRow[]) {
    const list = movementsBySession.get(movement.session_id) ?? [];
    list.push(movement);
    movementsBySession.set(movement.session_id, list);
  }

  return sessions.map((session) => {
    const totals = computeSessionTotals(salesBySession.get(session.id) ?? []);
    for (const m of movementsBySession.get(session.id) ?? []) {
      if (m.movement_type === "in") totals.cashInCents += m.amount_cents;
      if (m.movement_type === "out") totals.cashOutCents += Math.abs(m.amount_cents);
    }
    return mapSessionRow(session, totals);
  });
}

export async function openSession(
  ctx: AuthContext,
  input: OpenSessionInput,
): Promise<CashRegisterSession> {
  const openingCashCents = parseMoneyToCents(input.openingCash);
  SessionEntity.validateOpen(openingCashCents);

  const existingId = await getOpenSessionId(ctx);
  if (existingId) {
    throw new Error("There is already an open cash register session");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .insert({
      gym_id: ctx.gymId,
      opened_by: ctx.userId,
      opening_cash_cents: openingCashCents,
      status: "open",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSessionRow(data);
}

export async function closeSession(
  ctx: AuthContext,
  input: CloseSessionInput,
): Promise<CashRegisterSession> {
  const countedCashCents = parseMoneyToCents(input.countedCash);
  SessionEntity.validateClose(countedCashCents);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("close_cash_register_session", {
    p_session_id: input.sessionId,
    p_counted_cash_cents: countedCashCents,
    p_notes: input.notes ?? undefined,
  });

  if (error) throw new Error(error.message);
  const [enriched] = await enrichSessions([data]);
  return enriched;
}

export async function createSale(
  ctx: AuthContext,
  input: CreateSaleInput,
): Promise<{ saleId: string; totalCents: number }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_sale", {
    p_session_id: input.sessionId,
    p_payment_method: input.paymentMethod,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  });

  if (error) throw new Error(error.message);
  return { saleId: data.id, totalCents: data.total_cents };
}

export async function addCashMovement(
  ctx: AuthContext,
  input: CashMovementInput,
): Promise<void> {
  const amountCents = parseMoneyToCents(input.amount);
  const signedAmount =
    input.movementType === "out" ? -amountCents : amountCents;

  const supabase = await createClient();
  const { error } = await supabase.from("cash_movements").insert({
    gym_id: ctx.gymId,
    session_id: input.sessionId,
    amount_cents: signedAmount,
    movement_type: input.movementType,
    reason: input.reason,
    created_by: ctx.userId,
  });

  if (error) throw new Error(error.message);
}

export async function listSessionSales(ctx: AuthContext, sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      sale_items (
        quantity,
        unit_price_cents,
        subtotal_cents,
        products (name)
      )
    `,
    )
    .eq("gym_id", ctx.gymId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSessionSalesView(
  ctx: AuthContext,
  sessionId: string,
): Promise<SessionSaleView[]> {
  const data = await listSessionSales(ctx, sessionId);
  return mapSessionSales(data as RawSale[]);
}
