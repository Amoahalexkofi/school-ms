import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const role = (session.user as any)?.role ?? "ADMIN";

  // Redirect admin/super-admin to onboarding if not yet completed
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "";
    if (!pathname.startsWith("/onboarding")) {
      const db = await getDb();
      const profile = await (db as any).schoolProfile.findFirst({
        select: { onboardingCompleted: true },
      }).catch(() => null);
      if (profile && profile.onboardingCompleted === false) {
        redirect("/onboarding");
      }
    }
  }

  const isDemo = session.user?.email === "demo@getskula.com";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isDemo && (
          <div className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-center gap-3 shrink-0">
            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
            You're viewing the Skula demo — data may be shared with other visitors.
            <a href="/contact" className="underline underline-offset-2 hover:text-indigo-200 font-semibold">
              Set up your school →
            </a>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
