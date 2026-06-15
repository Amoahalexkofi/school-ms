import { redirect } from "next/navigation";

// Setup wizard now lives inline on the dashboard page.
// This route is kept only for backwards compatibility with any old bookmarks.
export default function OnboardingPage() {
  redirect("/dashboard");
}
