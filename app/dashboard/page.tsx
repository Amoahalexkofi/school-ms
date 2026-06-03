import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { DashboardStats } from "@/components/DashboardStats";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  // Active session id would normally come from DB; hardcoded lookup omitted here
  const sessionId = process.env.ACTIVE_SESSION_ID ?? "";
  const stats = sessionId ? await getDashboardStats(sessionId) : null;

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name ?? session.user?.email}</p>
      {stats && <DashboardStats stats={stats} />}
    </main>
  );
}
