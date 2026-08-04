import { getAuthContext } from "@/lib/auth/context";
import { Sidebar } from "@/components/layout/sidebar";

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
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
