import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  async function handleSignIn(payload: { email: string; password: string }) {
    "use server";
    await signIn("credentials", { ...payload, redirectTo: "/dashboard" });
  }

  return (
    <main>
      <h1>School Management System</h1>
      <h2>Sign In</h2>
      <SignInForm onSubmit={handleSignIn} />
    </main>
  );
}
