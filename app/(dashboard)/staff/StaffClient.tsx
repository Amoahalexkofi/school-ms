"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCog, Plus, Search, Eye, CreditCard } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

type Props = { staff: any[]; departments: any[]; designations: any[] };

const ROLE_STYLE: Record<string, string> = {
  TEACHER:     "bg-green-100 text-green-700",
  ADMIN:       "bg-blue-100 text-blue-700",
  ACCOUNTANT:  "bg-yellow-100 text-yellow-700",
  LIBRARIAN:   "bg-pink-100 text-pink-700",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
};

export function StaffClient({ staff, departments, designations }: Props) {
  const [search, setSearch]       = useState("");
  const [filterDept, setFilterDept] = useState("");
  const perm = usePermission("human_resource");

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 w-64"
              placeholder="Search staff…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/staff/id-card">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-1.5" /> ID Card Setup
            </Button>
          </Link>
          {perm.canAdd && (
            <Link href="/staff/new">
              <Button>
                <Plus className="h-4 w-4 mr-1.5" /> Add Staff
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Employee ID", "Name", "Role", "Department", "Designation", "Contact", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.employeeId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-400">{s.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[s.user?.role] ?? "bg-gray-100 text-gray-600"}`}>
                          {s.user?.role?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.contactNo ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
