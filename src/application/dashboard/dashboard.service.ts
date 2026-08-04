import { createClient } from "@/infrastructure/supabase/server";
import { AuthContext, formatMoney } from "@/domain/shared/types";
import { listProducts } from "@/application/products/product.service";
import { getOpenSession } from "@/application/register/register.service";

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

  const { data: todaySales, error: salesError } = await supabase
    .from("sales")
    .select("total_cents")
    .eq("gym_id", ctx.gymId)
    .gte("created_at", startOfDay.toISOString());

  if (salesError) throw new Error(salesError.message);

  const products = await listProducts(ctx);
  const openSession = await getOpenSession(ctx);

  const todaySalesCents = (todaySales ?? []).reduce(
    (sum, s) => sum + s.total_cents,
    0,
  );

  return {
    todaySalesCents,
    todaySaleCount: todaySales?.length ?? 0,
    lowStockCount: products.filter((p) => p.isLowStock && p.active).length,
    productCount: products.filter((p) => p.active).length,
    hasOpenSession: openSession?.isOpen() ?? false,
    openSessionId: openSession?.id ?? null,
  };
}

export { formatMoney };
