"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/infrastructure/supabase/client";
import { navItems } from "@/components/layout/nav-config";
import { NavLink } from "@/components/layout/nav-link";
import { Wordmark } from "@/components/layout/wordmark";

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
      <div className="border-b border-border p-6">
        <Wordmark />
        {children}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, key, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <NavLink
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-background"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-elevated hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {tCommon("signOut")}
        </button>
      </div>
    </aside>
  );
}
