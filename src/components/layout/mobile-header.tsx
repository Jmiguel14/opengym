"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/layout/wordmark";

export function MobileHeader({
  title,
  drawerTitle,
  account,
}: {
  title: React.ReactNode;
  drawerTitle: React.ReactNode;
  account: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const tCommon = useTranslations("common");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Wordmark size="sm" className="shrink-0" />
          <div className="min-w-0">{title}</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-muted hover:bg-surface-elevated hover:text-foreground"
          aria-label={open ? tCommon("closeMenu") : tCommon("openMenu")}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label={tCommon("closeMenu")}
          />
          <div
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-border bg-background shadow-xl lg:hidden",
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="min-w-0 font-medium">{drawerTitle}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface-elevated"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-border p-4">{account}</div>
            <div className="mt-auto border-t border-border p-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-elevated hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                {tCommon("signOut")}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
