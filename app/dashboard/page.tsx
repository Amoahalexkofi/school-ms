import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { DashboardStats } from "@/components/DashboardStats";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const sessionId = process.env.ACTIVE_SESSION_ID ?? "session-2026";
  const stats = await getDashboardStats(sessionId).catch(() => null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">School MS</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{session.user?.email}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {(session.user as any)?.role}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>
        {stats ? (
          <DashboardStats stats={stats} />
        ) : (
          <p className="text-gray-500">No session data available.</p>
        )}
      </main>
    </div>
  );
}
