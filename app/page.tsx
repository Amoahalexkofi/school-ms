import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HomepageClient } from "./HomepageClient";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <HomepageClient />;
}
