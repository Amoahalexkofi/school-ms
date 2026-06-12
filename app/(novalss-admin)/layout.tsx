import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novalss Admin — Skola Platform",
  description: "Novalss company operations dashboard",
};

export default function NovalssAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
