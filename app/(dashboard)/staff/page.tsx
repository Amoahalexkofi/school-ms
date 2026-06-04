import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, UserCog } from "lucide-react";

async function getStaff() {
  return (prisma as any).staff.findMany({
    include: {
      user: { select: { email: true, role: true } },
      classSections: {
        include: { class: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { joinDate: "desc" },
  });
}

const ROLE_STYLE: Record<string, string> = {
  TEACHER: "bg-green-100 text-green-700",
  ADMIN: "bg-blue-100 text-blue-700",
  ACCOUNTANT: "bg-yellow-100 text-yellow-700",
  LIBRARIAN: "bg-pink-100 text-pink-700",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
};

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{staff.length} staff member{staff.length !== 1 ? "s" : ""}</p>
          <Link href="/staff/new">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          </Link>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <UserCog className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No staff added yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {s.employeeCode}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[s.user?.role] ?? "bg-gray-100 text-gray-700"}`}>
                        {s.user?.role?.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{s.department ?? "—"}</TableCell>
                    <TableCell className="text-gray-600">
                      {s.classSections[0]
                        ? `${s.classSections[0].class.name} – ${s.classSections[0].name}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{s.user?.email ?? "—"}</TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {new Date(s.joinDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
