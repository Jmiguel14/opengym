import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  DollarSign,
  Package,
  AlertTriangle,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { getDashboardStats, formatMoney } from "@/application/dashboard/dashboard.service";
import { getAuthContext } from "@/lib/auth/context";

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  const stats = await getDashboardStats(ctx);
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted">{t("welcome")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label={t("todaySales")}
          value={formatMoney(stats.todaySalesCents)}
          sub={t("transactionCount", { count: stats.todaySaleCount })}
        />
        <StatCard
          icon={Package}
          label={t("activeProducts")}
          value={String(stats.productCount)}
        />
        <StatCard
          icon={AlertTriangle}
          label={t("lowStock")}
          value={String(stats.lowStockCount)}
          alert={stats.lowStockCount > 0}
          alertLabel={tCommon("needsAttention")}
        />
        <StatCard
          icon={Wallet}
          label={t("cashRegister")}
          value={stats.hasOpenSession ? t("registerOpen") : t("registerClosed")}
          sub={
            stats.hasOpenSession ? t("readyForSales") : t("openToStartSelling")
          }
          alert={!stats.hasOpenSession}
          alertLabel={tCommon("needsAttention")}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t("quickActions")}</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/pos">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t("newSale")}
              </Button>
            </Link>
            <Link href="/inventory/new">
              <Button variant="secondary">{t("addProduct")}</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">
                {stats.hasOpenSession ? t("manageRegister") : t("openRegister")}
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">{t("gettingStarted")}</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-muted">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  alert,
  alertLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
  alertLabel?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        <div
          className={`rounded-lg p-2 ${
            alert
              ? "bg-amber-500/10 text-amber-400"
              : "bg-brand-muted text-brand"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {alert && alertLabel && (
        <Badge variant="warning" className="mt-3">
          {alertLabel}
        </Badge>
      )}
    </Card>
  );
}
