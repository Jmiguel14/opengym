"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-config";
import { NavLink } from "@/components/layout/nav-link";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {navItems.map(({ href, shortKey, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <NavLink
              key={href}
              href={href}
              className={cn(
                "flex min-h-[4rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium leading-tight transition-colors",
                active ? "text-brand" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-brand")} />
              <span className="max-w-full truncate">{t(shortKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
