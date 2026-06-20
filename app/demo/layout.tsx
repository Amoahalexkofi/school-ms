import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — Try Skula free",
  description: "Explore Skula as any role — admin, teacher, accountant, student or parent. Real data, no sign-up, instant access.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
