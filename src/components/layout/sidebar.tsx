"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/infrastructure/supabase/client";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/pos", key: "pos", icon: ShoppingCart },
  { href: "/inventory", key: "inventory", icon: Package },
  { href: "/register", key: "register", icon: Wallet },
] as const;

export function Sidebar({
  gymName,
  userEmail,
  role,
}: {
  gymName: string;
  userEmail: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-6">
        <Image
          src="/logo.png"
          alt="Open Gym"
          width={160}
          height={48}
          className="h-12 w-auto object-contain"
          style={{ width: "auto", height: "3rem" }}
          priority
        />
        <div className="mt-3 text-sm font-medium text-foreground">{gymName}</div>
        <div className="mt-0.5 truncate text-xs text-muted">{userEmail}</div>
        <div className="mt-2 inline-block rounded bg-brand-muted px-2 py-0.5 text-xs text-brand border border-brand/20">
          {tRoles(role as "admin" | "manager" | "cashier")}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, key, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
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
