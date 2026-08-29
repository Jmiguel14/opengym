"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/components/ui";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-account";

export function DemoLoginButton({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
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
    <div className={className}>
      <Button type="button" size={size} onClick={handleClick} disabled={loading}>
        {loading ? tCommon("signingIn") : t("tryDemo")}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
