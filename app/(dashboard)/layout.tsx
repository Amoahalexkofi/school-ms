import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { DemoBanner } from "@/components/DemoBanner";
import { PermissionsProvider } from "@/components/PermissionsProvider";
import { getUserPermissions } from "@/lib/services/permissions";
import { getEnabledAddons } from "@/lib/addons";

const DEMO_EMAILS = new Set([
  "demo@getskula.com",
  "admin.demo@getskula.com",
  "teacher.demo@getskula.com",
  "accountant.demo@getskula.com",
  "librarian.demo@getskula.com",
  "student.demo@getskula.com",
  "parent.demo@getskula.com",
  "receptionist.demo@getskula.com",
]);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const role   = (session.user as any)?.role ?? "ADMIN";
  const userId = (session.user as any)?.id ?? "";
  const isDemo = DEMO_EMAILS.has(session.user?.email ?? "");

  // First-run setup: send a fresh school's admin to the onboarding wizard until
  // it's completed. Only admins set the school up; skip the demo and the wizard
  // route itself (avoid a redirect loop).
  const pathname = (await headers()).get("x-pathname") ?? "";

  // First-login gate: auto-created accounts (students/parents) must set a new
  // password before doing anything else. Skip the change-password page itself.
  if (userId && !pathname.startsWith("/account/security")) {
    const me = await ((await getDb()) as any).user
      .findUnique({ where: { id: userId }, select: { mustChangePassword: true } })
      .catch(() => null);
    if (me?.mustChangePassword) redirect("/account/security");
  }

  if (!isDemo && (role === "ADMIN" || role === "SUPER_ADMIN") && !pathname.startsWith("/onboarding")) {
    const db = (await getDb()) as any;
    const profile = await db.schoolProfile.findFirst({ select: { onboardingCompleted: true } }).catch(() => null);
    if (!profile?.onboardingCompleted) {
      // Only force the wizard for a genuinely empty school. A school that already
      // has an academic session is set up (even if the flag was never set on an
      // older account), so we never trap existing schools.
      const sessionCount = await db.academicSession.count().catch(() => 1);
      if (sessionCount === 0) redirect("/onboarding");
    }
  }

  // Load custom app-role permissions for this user (null = no custom role, full access)
  const permissions = await getUserPermissions(userId).catch(() => null);
  const addons = await getEnabledAddons().catch(() => []);

  return (
    <PermissionsProvider permissions={permissions}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f5fb]">
        <Sidebar role={role} addons={addons} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isDemo && <DemoBanner />}
          {children}
        </div>
      </div>
    </PermissionsProvider>
  );
}
