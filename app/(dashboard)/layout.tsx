import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { DemoBanner } from "@/components/DemoBanner";
import { PermissionsProvider } from "@/components/PermissionsProvider";
import { getUserPermissions } from "@/lib/services/permissions";

const DEMO_EMAILS = new Set([
  "demo@getskula.com",
  "admin.demo@getskula.com",
  "teacher.demo@getskula.com",
  "accountant.demo@getskula.com",
  "librarian.demo@getskula.com",
  "student.demo@getskula.com",
  "parent.demo@getskula.com",
]);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const role   = (session.user as any)?.role ?? "ADMIN";
  const userId = (session.user as any)?.id ?? "";
  const isDemo = DEMO_EMAILS.has(session.user?.email ?? "");

  // Load custom app-role permissions for this user (null = no custom role, full access)
  const permissions = await getUserPermissions(userId).catch(() => null);

  return (
    <PermissionsProvider permissions={permissions}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f5fb]">
        <Sidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isDemo && <DemoBanner />}
          {children}
        </div>
      </div>
    </PermissionsProvider>
  );
}
