"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCog, Network, Tag } from "lucide-react";

const TABS = [
  { href: "/staff",        label: "Staff",        Icon: UserCog },
  { href: "/departments",  label: "Departments",  Icon: Network },
  { href: "/designations", label: "Designations", Icon: Tag     },
];

export function StaffSectionTabs() {
  const pathname = usePathname();

  return (
    <div className="px-4 md:px-6 pt-4">
      <div className="bg-slate-100/80 p-1 rounded-2xl inline-flex gap-1">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                active ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
