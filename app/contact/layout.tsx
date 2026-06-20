import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Skula — Set up your school",
  description: "Talk to the Skula team to get your school set up. We'll help you go live with students, fees, attendance, exams and parent communication.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
