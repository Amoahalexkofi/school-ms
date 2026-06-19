import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Skula — School Management System",
  description: "The modern school management platform. Students, fees, attendance, exams, payroll and more — all in one place. Trusted by schools worldwide.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Skula",
  },
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
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${montserrat.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Skula" />
      </head>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased font-[family-name:var(--font-plus-jakarta-sans)]">
        <SessionProvider>{children}</SessionProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
