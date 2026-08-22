"use client";

import { signIn } from "next-auth/react";
import { SignInForm } from "@/components/SignInForm";

export function SignInPage({
  tenant,
  accentColor,
  supportContact,
}: {
  tenant: string;
  accentColor?: string;
  supportContact?: string;
}) {
  async function handleSignIn({
    email,
    password,
    remember,
  }: {
    email: string;
    password: string;
    remember: boolean;
  }) {
    const result = await signIn("credentials", {
      email,
      password,
      tenant,
      remember: remember ? "true" : "false",
      redirect: false,
    });

    if (!result || result.error) {
      throw new Error("Invalid email or password");
    }

    // A hard navigation, not router.push()+refresh(). The destination can
    // itself server-redirect (e.g. mustChangePassword → /account/security);
    // racing a client-side push against that redirect left the App Router
    // stuck reconciling two navigations, producing a rapid-fire request loop
    // and a blank screen instead of ever landing.
    window.location.href = "/dashboard";
  }

  return <SignInForm onSubmit={handleSignIn} accentColor={accentColor} supportContact={supportContact} />;
}
