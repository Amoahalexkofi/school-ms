import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  TEACHER:     "Teacher",
  ACCOUNTANT:  "Accountant",
  LIBRARIAN:   "Librarian",
  STUDENT:     "Student",
  PARENT:      "Parent",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN:       "bg-orange-100 text-orange-700",
  TEACHER:     "bg-blue-100 text-blue-700",
  ACCOUNTANT:  "bg-green-100 text-green-700",
  LIBRARIAN:   "bg-purple-100 text-purple-700",
  STUDENT:     "bg-teal-100 text-teal-700",
  PARENT:      "bg-gray-100 text-gray-700",
};

// Derived from ROUTE_PERMISSIONS in middleware-utils.ts
const MODULES: { label: string; path: string; roles: string[] }[] = [
  { label: "Dashboard",        path: "/dashboard",       roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN","STUDENT","PARENT"] },
  { label: "Students",         path: "/students",        roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
  { label: "Staff",            path: "/staff",           roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Departments",      path: "/departments",     roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Designations",     path: "/designations",    roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Attendance",       path: "/attendance",      roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
  { label: "Exams",            path: "/exams",           roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
  { label: "Exam Groups",      path: "/exam-groups",     roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
  { label: "Online Exams",     path: "/online-exams",    roles: ["SUPER_ADMIN","ADMIN","TEACHER","STUDENT"] },
  { label: "Fees",             path: "/fees",            roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"] },
  { label: "Finance",          path: "/finance",         roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"] },
  { label: "Payroll",          path: "/payroll",         roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"] },
  { label: "Leave",            path: "/leave",           roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
  { label: "Library",          path: "/library",         roles: ["SUPER_ADMIN","ADMIN","TEACHER","LIBRARIAN","STUDENT"] },
  { label: "Transport",        path: "/transport",       roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Hostel",           path: "/hostel",          roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Inventory",        path: "/inventory",       roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Front Office",     path: "/front-office",    roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Reports",          path: "/reports",         roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT"] },
  { label: "Notice Board",     path: "/notice-board",    roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN","STUDENT","PARENT"] },
  { label: "Messaging",        path: "/messaging",       roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Chat",             path: "/chat",            roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN","STUDENT","PARENT"] },
  { label: "Notifications",    path: "/notifications",   roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN","STUDENT","PARENT"] },
  { label: "Settings",         path: "/settings",        roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Audit Log",        path: "/audit-log",       roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Admissions",       path: "/admissions",      roles: ["SUPER_ADMIN","ADMIN"] },
  { label: "Lesson Plans",     path: "/lesson-plans",    roles: ["SUPER_ADMIN","ADMIN","TEACHER"] },
];

export default function RolesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Roles & Permissions" />
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </Link>

        {/* Role cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {ROLES.map((role) => {
            const accessible = MODULES.filter((m) => m.roles.includes(role)).length;
            return (
              <div key={role} className={`rounded-lg p-3 text-center ${ROLE_COLORS[role]}`}>
                <p className="font-bold text-lg">{accessible}</p>
                <p className="text-xs font-medium">{ROLE_LABELS[role]}</p>
                <p className="text-xs opacity-70">modules</p>
              </div>
            );
          })}
        </div>

        {/* Permissions matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Access Matrix
            </CardTitle>
            <p className="text-xs text-gray-400">
              Read-only — permissions are enforced by the server middleware. Contact a developer to change them.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 min-w-[140px]">Module</th>
                    {ROLES.map((role) => (
                      <th key={role} className="px-3 py-2.5 text-center font-medium whitespace-nowrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                          {ROLE_LABELS[role]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {MODULES.map((mod) => (
                    <tr key={mod.path} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800">{mod.label}</p>
                        <p className="text-xs text-gray-400 font-mono">{mod.path}</p>
                      </td>
                      {ROLES.map((role) => {
                        const allowed = mod.roles.includes(role);
                        return (
                          <td key={role} className="px-3 py-2.5 text-center">
                            {allowed ? (
                              <div className="flex justify-center">
                                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                                  <X className="h-3.5 w-3.5 text-gray-300" />
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
