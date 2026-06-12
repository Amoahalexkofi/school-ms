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
      });
      if (profile && profile.onboardingCompleted === false) {
        redirect("/onboarding");
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
