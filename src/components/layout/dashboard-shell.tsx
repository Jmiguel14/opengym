import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/auth/context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Skeleton } from "@/components/ui";

function IdentitySkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <Skeleton className="h-4 w-28" />;
  }

  return (
    <div className="mt-3 space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

async function SidebarIdentity() {
  const [ctx, tRoles] = await Promise.all([
    getAuthContext(),
    getTranslations("roles"),
  ]);

  return (
    <div className="mt-3">
      <div className="text-sm font-medium text-foreground">{ctx.gymName}</div>
      <div className="mt-0.5 truncate text-xs text-muted">{ctx.email}</div>
      <div className="mt-2 inline-block rounded border border-brand/20 bg-brand-muted px-2 py-0.5 text-xs text-brand">
        {tRoles(ctx.role)}
      </div>
    </div>
  );
}

async function HeaderGymName() {
  const ctx = await getAuthContext();
  return <span className="truncate text-sm font-medium">{ctx.gymName}</span>;
}

async function HeaderAccount() {
  const [ctx, tRoles] = await Promise.all([
    getAuthContext(),
    getTranslations("roles"),
  ]);

  return (
    <>
      <div className="truncate text-sm text-muted">{ctx.email}</div>
      <div className="mt-2 inline-block rounded border border-brand/20 bg-brand-muted px-2 py-0.5 text-xs text-brand">
        {tRoles(ctx.role)}
      </div>
    </>
  );
}

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <Suspense fallback={<IdentitySkeleton />}>
          <SidebarIdentity />
        </Suspense>
      </Sidebar>
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader
          title={
            <Suspense fallback={<IdentitySkeleton compact />}>
              <HeaderGymName />
            </Suspense>
          }
          drawerTitle={
            <Suspense fallback={<IdentitySkeleton compact />}>
              <HeaderGymName />
            </Suspense>
          }
          account={
            <Suspense fallback={<AccountSkeleton />}>
              <HeaderAccount />
            </Suspense>
          }
        />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-7xl p-4 pb-24 lg:p-6 lg:pb-6">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
