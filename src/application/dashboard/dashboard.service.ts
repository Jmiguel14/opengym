import { createClient } from "@/infrastructure/supabase/server";
import { AuthContext, formatMoney } from "@/domain/shared/types";

export interface DashboardStats {
  todaySalesCents: number;
  todaySaleCount: number;
  lowStockCount: number;
  productCount: number;
  hasOpenSession: boolean;
  openSessionId: string | null;
}

export async function getDashboardStats(
  ctx: AuthContext,
): Promise<DashboardStats> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [salesResult, productsResult, sessionResult] = await Promise.all([
    supabase
      .from("sales")
      .select("total_cents")
      .eq("gym_id", ctx.gymId)
      .gte("created_at", startOfDay.toISOString()),
    supabase
      .from("products")
      .select("active, stock_quantity, min_stock")
      .eq("gym_id", ctx.gymId),
    supabase
      .from("cash_register_sessions")
      .select("id")
      .eq("gym_id", ctx.gymId)
      .eq("status", "open")
      .maybeSingle(),
  ]);

  if (salesResult.error) throw new Error(salesResult.error.message);
  if (productsResult.error) throw new Error(productsResult.error.message);
  if (sessionResult.error) throw new Error(sessionResult.error.message);

  const todaySales = salesResult.data ?? [];
  const products = productsResult.data ?? [];

  return {
    todaySalesCents: todaySales.reduce((sum, s) => sum + s.total_cents, 0),
    todaySaleCount: todaySales.length,
    lowStockCount: products.filter(
      (p) => p.active && p.stock_quantity <= p.min_stock,
    ).length,
    productCount: products.filter((p) => p.active).length,
    hasOpenSession: Boolean(sessionResult.data?.id),
    openSessionId: sessionResult.data?.id ?? null,
  };
}

export { formatMoney };
