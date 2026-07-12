"use client";

import { signOut } from "next-auth/react";
import { LogOut, FlaskConical } from "lucide-react";

// Muted ink banner — the sidebar's active pill owns the screen's indigo
// budget; demo chrome must not compete with it (DESIGN.md §Navigation).
export function DemoBanner() {
  return (
    <div className="bg-slate-900 text-slate-200 text-[12px] font-medium px-4 py-2 flex items-center justify-between gap-3 shrink-0 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>
          You're in the Skula demo — data resets daily.{" "}
          <a href="/contact" className="underline underline-offset-2 text-white hover:text-slate-300 font-semibold">
            Get your own school →
          </a>
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/demo" })}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md px-2.5 py-1 text-[11px] font-bold text-white transition-colors shrink-0"
      >
        <LogOut className="h-3 w-3" />
        Exit demo
      </button>
    </div>
  );
}
