"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/infrastructure/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card } from "@/components/ui";
import { Wordmark } from "@/components/layout/wordmark";
import { DemoLoginButton } from "@/components/auth/demo-login-button";
import { DemoCredentials } from "@/components/landing/demo-credentials";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-account";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          {t("backHome")}
        </Link>
      </div>
      <Card className="border-border bg-surface-elevated">
        <div className="mb-6 text-center">
          <Wordmark size="lg" />
          <p className="mt-3 text-sm text-muted">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? tCommon("signingIn") : tCommon("signIn")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
            }}
          >
            {t("fillDemo")}
          </Button>
        </form>
      </Card>

      <DemoCredentials compact />
      <DemoLoginButton />
    </div>
  );
}
