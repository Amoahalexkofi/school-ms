"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Check } from "lucide-react";
import { BRANCH_COOKIE } from "@/lib/branch-cookie";

type Branch = { id: string; name: string; isMain: boolean };

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export function BranchSwitcher() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [active, setActive] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(readCookie(BRANCH_COOKIE) ?? "all");
    fetch("/api/branches")
      .then(r => (r.ok ? r.json() : []))
      .then((d: Branch[]) => setBranches(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Only meaningful once at least one branch exists
  if (branches.length === 0) return null;

  const current = active === "all" ? "All Branches" : branches.find(b => b.id === active)?.name ?? "All Branches";

  async function choose(branchId: string) {
    setBusy(true);
    await fetch("/api/branches/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    setActive(branchId);
    setOpen(false);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="relative px-2 pt-2" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors text-left"
      >
        <Building2 className="h-4 w-4 text-indigo-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Branch</p>
          <p className="text-[12.5px] font-semibold text-white truncate mt-0.5 leading-none">{current}</p>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-2 right-2 mt-1.5 z-50 rounded-xl border border-white/[0.1] bg-slate-800 shadow-2xl overflow-hidden py-1">
          <button
            onClick={() => choose("all")}
            className="w-full flex items-center justify-between px-3 py-2 text-[12.5px] text-slate-200 hover:bg-white/[0.07] transition-colors"
          >
            All Branches
            {active === "all" && <Check className="h-3.5 w-3.5 text-indigo-400" />}
          </button>
          <div className="h-px bg-white/[0.06] my-1" />
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => choose(b.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-[12.5px] text-slate-200 hover:bg-white/[0.07] transition-colors"
            >
              <span className="truncate">{b.name}</span>
              {active === b.id && <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
