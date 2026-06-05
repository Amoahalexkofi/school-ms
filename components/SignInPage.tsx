"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";

export function SignInPage({ tenant }: { tenant: string }) {
  const router = useRouter();

  async function handleSignIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const result = await signIn("credentials", {
      email,
      password,
      tenant,
      redirect: false,
    });

    if (!result || result.error) {
      throw new Error("Invalid email or password");
    }

    router.push("/dashboard");
    router.refresh();
  }

  return <SignInForm onSubmit={handleSignIn} />;
}
