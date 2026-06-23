import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/Topbar";
import { ImportBooksClient } from "./ImportBooksClient";

const ALLOWED = ["SUPER_ADMIN", "ADMIN", "TEACHER", "LIBRARIAN"];

export default async function ImportBooksPage() {
  const session = await auth();
  const role = (session?.user as any)?.role ?? "";
  if (!ALLOWED.includes(role)) redirect("/library");

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Import Books" />
      <ImportBooksClient />
    </div>
  );
}
