export default function NovalssAdminLayout({ children }: { children: React.ReactNode }) {
  // No sidebar, no dashboard chrome — clean standalone layout
  return <div className="min-h-screen">{children}</div>;
}
