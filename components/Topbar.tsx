"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  TEACHER: "bg-green-100 text-green-700",
  ACCOUNTANT: "bg-yellow-100 text-yellow-700",
  STUDENT: "bg-gray-100 text-gray-700",
  PARENT: "bg-orange-100 text-orange-700",
  LIBRARIAN: "bg-pink-100 text-pink-700",
};

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "";
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[role] ?? "bg-gray-100 text-gray-700"}`}>
          {role.replace("_", " ")}
        </span>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600 hidden sm:block">{email}</span>
        </div>
      </div>
    </header>
  );
}
