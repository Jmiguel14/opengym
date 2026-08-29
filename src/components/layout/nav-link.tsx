"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

function PendingHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-current opacity-0",
        pending && "animate-pulse opacity-70",
      )}
    />
  );
}

export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("relative", className)}>
      {children}
      <PendingHint />
    </Link>
  );
}
