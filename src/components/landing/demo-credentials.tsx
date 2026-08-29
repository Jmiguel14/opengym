"use client";

import { useTranslations } from "next-intl";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-account";

export function DemoCredentials({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("landing");

  return (
    <div
      className={
        compact
          ? "rounded-lg border border-border bg-surface px-4 py-3 text-sm"
          : "rounded-xl border border-border bg-surface-elevated p-6"
      }
    >
      <p className="font-medium text-foreground">{t("demoTitle")}</p>
      <p className="mt-1 text-sm text-muted">{t("demoHint")}</p>
      <dl className="mt-4 space-y-2 font-mono text-sm">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="text-muted">{t("demoEmail")}</dt>
          <dd className="text-foreground">{DEMO_EMAIL}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="text-muted">{t("demoPassword")}</dt>
          <dd className="text-foreground">{DEMO_PASSWORD}</dd>
        </div>
      </dl>
    </div>
  );
}
