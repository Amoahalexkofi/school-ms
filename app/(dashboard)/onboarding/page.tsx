import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { OnboardingClient } from "./OnboardingClient";

// First-run setup wizard. Only admins set the school up; everyone else (and the
// case where setup is already done) goes to the dashboard.
export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const role = (session.user as any)?.role ?? "";
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const db = await getDb();
  const profile = await (db as any).schoolProfile.findFirst().catch(() => null);
  // Already set up (flag set, or a session already exists) → don't re-run the
  // wizard (avoids creating duplicate sessions/classes).
  const sessionCount = await (db as any).academicSession.count().catch(() => 1);
  if (profile?.onboardingCompleted || sessionCount > 0) redirect("/dashboard");

  return <OnboardingClient profile={profile} />;
}
