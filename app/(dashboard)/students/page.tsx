import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, GraduationCap } from "lucide-react";

async function getStudents() {
  return (prisma as any).student.findMany({
    include: {
      user: { select: { email: true } },
      enrollments: {
        include: {
          section: { include: { class: true } },
        },
        take: 1,
        orderBy: { enrolledAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Students" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
          <Link href="/students/new">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Student
            </Button>
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No students yet. Add your first student.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s: any) => {
                  const enroll = s.enrollments[0];
                  const className = enroll
                    ? `${enroll.section.class.name} – ${enroll.section.name}`
                    : "—";
                  return (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs text-gray-600">{s.admissionNumber}</TableCell>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell>{className}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{s.user?.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{s.gender}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/students/${s.id}`} className="text-blue-600 text-sm hover:underline">
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
