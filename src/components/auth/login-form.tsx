"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/infrastructure/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card } from "@/components/ui";

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
    <Card className="w-full max-w-md border-border bg-surface-elevated">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt="Open Gym"
          width={200}
          height={60}
          className="mx-auto h-16 w-auto object-contain"
          style={{ width: "auto", height: "4rem" }}
          priority
        />
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
          <div className="rounded-lg bg-brand-muted px-3 py-2 text-sm text-brand border border-brand/20">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? tCommon("signingIn") : tCommon("signIn")}
        </Button>
      </form>
    </Card>
  );
}
