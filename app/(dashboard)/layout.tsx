import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { DemoBanner } from "@/components/DemoBanner";

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
  const role = (session.user as any)?.role ?? "ADMIN";
  const isDemo = DEMO_EMAILS.has(session.user?.email ?? "");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isDemo && <DemoBanner />}
        {children}
      </div>
    </div>
  );
}
