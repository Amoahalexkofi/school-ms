"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Eye, GraduationCap, CreditCard } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";
import { Pagination } from "@/components/Pagination";

type Props = {
  students: any[];
  sessions: any[];
  classSections: any[];
  schoolHouses: any[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
};

export function StudentsClient({ students, total, page, totalPages, limit, initialSearch }: Props) {
  const [search, setSearch]   = useState(initialSearch);
  const perm                  = usePermission("student_information");
  const router                = useRouter();
  const pathname              = usePathname();
  const searchParams          = useSearchParams();

  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  // Debounce search so we don't navigate on every keystroke
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => pushSearch(value), 400);
  }

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 w-64"
              placeholder="Search students…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500">{total} student{total !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-2">
          <Link href="/students/id-card">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-1" /> ID Card Setup
            </Button>
          </Link>
          <Link href="/students/promote">
            <Button variant="outline">
              <GraduationCap className="h-4 w-4 mr-1" /> Promote
            </Button>
          </Link>
          {perm.canAdd && (
            <Link href="/students/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Add Student
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No students found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Student Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Class / Section</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Roll No</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Mobile</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((s: any) => {
                      const enroll = s.sessions?.[0];
                      const cls    = enroll?.classSection;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                            </div>
                            {s.schoolHouse && (
                              <div className="text-xs text-gray-400">{s.schoolHouse.name}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {cls ? `${cls.class.name} – ${cls.section.name}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{enroll?.rollNo ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{s.mobileNo ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{s.gender ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {s.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/students/${s.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} total={total} limit={limit} />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
