"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Settings, Users, Search, ArrowRight, BarChart3, ArrowRightLeft, Tag } from "lucide-react";

type Props = { totalStudents: number; totalMasters: number; totalCollected: number; students: any[] };

export function FeesHubClient({ totalStudents, totalMasters, totalCollected, students }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search.length > 1
    ? students.filter(s => {
        const q = search.toLowerCase();
        return (
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.admissionNo?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  return (
    <main className="flex-1 p-6 space-y-6 bg-[#0f1015]">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected",     value: `₵${totalCollected.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Fee Assignments",     value: totalMasters,                           icon: Users,      color: "text-blue-400 bg-blue-500/10" },
          { label: "Active Students",     value: totalStudents,                          icon: Users,      color: "text-violet-400 bg-violet-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-2xl font-bold text-white/80">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collect fees — student search */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Collect Fees
            </h2>
            <p className="text-xs text-white/30">Search for a student to view and collect their fees.</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input className="pl-9" placeholder="Name or admission number…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filtered.length > 0 && (
              <div className="border rounded-lg divide-y overflow-hidden">
                {filtered.map(s => (
                  <button key={s.id}
                    onClick={() => router.push(`/fees/collect/${s.id}`)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/[0.04] transition-colors text-left">
                    <div>
                      <span className="font-medium text-white/80">{s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}</span>
                      <span className="text-xs text-white/30 ml-2 font-mono">{s.admissionNo}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30" />
                  </button>
                ))}
              </div>
            )}
            {search.length > 1 && filtered.length === 0 && (
              <p className="text-xs text-white/30 text-center py-2">No students found.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Settings className="h-4 w-4 text-white/50" /> Fee Management
            </h2>
            <div className="space-y-2">
              {[
                { href: "/fees/setup",          label: "Fee Setup",        sub: "Categories, types, groups & discounts",  icon: Settings,       color: "bg-indigo-500/10 text-indigo-400" },
                { href: "/fees/assign",         label: "Assign Fees",      sub: "Assign fee groups to a class",           icon: Users,          color: "bg-blue-500/10 text-blue-400" },
                { href: "/fees/discounts",      label: "Assign Discounts", sub: "Assign discounts to students by class",  icon: Tag,            color: "bg-emerald-500/10 text-emerald-400" },
                { href: "/fees/carry-forward",  label: "Carry Forward",    sub: "Roll over outstanding balances",         icon: ArrowRightLeft, color: "bg-orange-500/10 text-orange-400" },
                { href: "/fees/report",         label: "Fee Reports",      sub: "Collection & due fee reports",           icon: BarChart3,      color: "bg-amber-500/10 text-amber-400" },
              ].map(({ href, label, sub, icon: Icon, color }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/70">{label}</p>
                      <p className="text-xs text-white/30">{sub}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
