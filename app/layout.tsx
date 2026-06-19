import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Skula — School Management System",
  description: "The modern school management platform. Students, fees, attendance, exams, payroll and more — all in one place. Trusted by schools worldwide.",
  openGraph: {
    title: "Skula — School Management System",
    description: "The modern school management platform. Students, fees, attendance, exams, payroll and more — all in one place.",
    url: "https://getskula.com",
    siteName: "Skula",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Skula — School Management System",
    description: "The modern school management platform. Students, fees, attendance, exams and more — all in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${montserrat.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased font-[family-name:var(--font-plus-jakarta-sans)]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
