import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Package, ShoppingCart, Wallet } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Wordmark } from "@/components/layout/wordmark";
import { DemoLoginButton } from "@/components/auth/demo-login-button";
import { DemoCredentials } from "@/components/landing/demo-credentials";

export async function LandingPage() {
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  const features = [
    {
      icon: Package,
      title: t("featureInventoryTitle"),
      body: t("featureInventoryBody"),
    },
    {
      icon: ShoppingCart,
      title: t("featurePosTitle"),
      body: t("featurePosBody"),
    },
    {
      icon: Wallet,
      title: t("featureRegisterTitle"),
      body: t("featureRegisterBody"),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                {tCommon("signIn")}
              </Button>
            </Link>
            <DemoLoginButton size="sm" />
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm font-medium text-brand">{t("eyebrow")}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t("headline")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("subheadline")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DemoLoginButton size="lg" />
            <Link href="/login">
              <Button variant="secondary" size="lg">
                {tCommon("signIn")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto grid max-w-5xl gap-4 px-4 py-16 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <div className="mb-4 inline-flex rounded-lg bg-brand-muted p-2 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold">{t("flowTitle")}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-4">
            {[t("flow1"), t("flow2"), t("flow3"), t("flow4")].map((label, index) => (
              <li
                key={label}
                className="rounded-xl border border-border bg-surface-elevated p-4"
              >
                <span className="text-sm font-medium text-brand">{index + 1}</span>
                <p className="mt-2 text-sm text-foreground">{label}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-xl px-4 py-16">
            <DemoCredentials />
            <div className="mt-6">
              <DemoLoginButton size="lg" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
          <p>{t("footerCta")}</p>
        </div>
      </footer>
    </div>
  );
}
