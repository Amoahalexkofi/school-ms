"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCog, Plus, Search, Eye, CreditCard } from "lucide-react";

type Props = { staff: any[]; departments: any[]; designations: any[] };

const ROLE_STYLE: Record<string, string> = {
  TEACHER:     "bg-emerald-500/10 text-emerald-400",
  ADMIN:       "bg-blue-500/10 text-blue-400",
  ACCOUNTANT:  "bg-amber-500/10 text-amber-400",
  LIBRARIAN:   "bg-pink-500/10 text-pink-400",
  SUPER_ADMIN: "bg-violet-500/10 text-violet-400",
};

export function StaffClient({ staff, departments, designations }: Props) {
  const [search, setSearch]       = useState("");
  const [filterDept, setFilterDept] = useState("");

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const ok = !search || [s.firstName, s.lastName, s.employeeId, s.contactNo]
      .some(v => v?.toLowerCase().includes(q));
    return ok && (!filterDept || s.departmentId === filterDept);
  });

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              className="pl-9 w-64"
              placeholder="Search staff…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border border-white/[0.06] bg-[#111318] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="text-sm text-white/40">
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/staff/id-card">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-1.5" /> ID Card Setup
            </Button>
          </Link>
          <Link href="/staff/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> Add Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-white/30">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015] border-b">
                  <tr>
                    {["Employee ID", "Name", "Role", "Department", "Designation", "Contact", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-[#0f1015]">
                      <td className="px-4 py-3 font-mono text-xs text-white/40">{s.employeeId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-white/30">{s.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[s.user?.role] ?? "bg-white/[0.04] text-white/50"}`}>
                          {s.user?.role?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/50">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/40">{s.contactNo ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/staff/${s.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
