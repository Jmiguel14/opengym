import { getAuthContext } from "@/lib/auth/context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        gymName={ctx.gymName}
        userEmail={ctx.email}
        role={ctx.role}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader
          gymName={ctx.gymName}
          userEmail={ctx.email}
          role={ctx.role}
        />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-7xl p-4 pb-24 lg:p-6 lg:pb-6">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
