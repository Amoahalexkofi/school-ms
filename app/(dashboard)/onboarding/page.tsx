import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const role = (session.user as any)?.role ?? "ADMIN";
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const db = await getDb();
  const profile = await (db as any).schoolProfile.findFirst();

  if (profile?.onboardingCompleted) redirect("/dashboard");

  return <OnboardingClient profile={profile} />;
}
