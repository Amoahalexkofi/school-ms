"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RotateCcw } from "lucide-react";

type Props = { books: any[]; issues: any[]; students: any[]; staff: any[] };
type Tab = "catalog" | "issues";

const STATUS_STYLE: Record<string, string> = {
  ISSUED: "bg-blue-100 text-blue-700", RETURNED: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700",
};

export function LibraryClient({ books, issues, students, staff }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalog");
  const [search, setSearch] = useState("");
  const [returning, setReturning] = useState<string | null>(null);

  async function returnBook(id: string) {
    setReturning(id);
    const res = await fetch(`/api/library/issues/${id}`, { method: "PATCH" });
    if (!res.ok) alert((await res.json()).error); else router.refresh();
    setReturning(null);
  }

  const filtered = books.filter(b => !search || [b.title, b.author, b.bookNo].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {[{ key: "catalog" as Tab, label: "Book Catalog" }, { key: "issues" as Tab, label: `Issue Log (${issues.filter(i => i.status === "ISSUED").length} active)` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Input className="w-64" placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex gap-2">
              <Link href="/library/issue/new">
                <Button variant="outline"><Plus className="h-4 w-4 mr-1.5" />Issue Book</Button>
              </Link>
              <Link href="/library/books/new">
                <Button><Plus className="h-4 w-4 mr-1.5" />Add Book</Button>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Title","Author","Book No.","Subject","Rack","Total","Available",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No books found.</td></tr>
                : filtered.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{b.title}</td>
                    <td className="px-4 py-3 text-gray-600">{b.author}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookNo ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{b.subject ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{b.rackNo ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{b.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.available > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{b.available}</span>
                    </td>
                    <td className="px-4 py-3">
                      {b.available > 0 ? (
                        <Link href="/library/issue/new">
                          <Button size="sm" variant="outline">Issue</Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" disabled>Issue</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "issues" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{["Book","Issued To","Issued","Due","Status","Fine",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {issues.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No issues yet.</td></tr>
              : issues.map((i: any) => {
                const overdue = i.status === "ISSUED" && new Date(i.dueDate) < new Date();
                return (
                  <tr key={i.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3"><div className="font-medium truncate max-w-[160px]">{i.book.title}</div><div className="text-xs text-gray-400">{i.book.bookNo}</div></td>
                    <td className="px-4 py-3 text-gray-700">{i.student ? `${i.student.firstName} ${i.student.lastName}` : i.staff ? `${i.staff.firstName} ${i.staff.lastName}` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(i.issuedAt).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>{new Date(i.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${overdue ? "bg-red-100 text-red-700" : STATUS_STYLE[i.status]}`}>{overdue ? "OVERDUE" : i.status}</span></td>
                    <td className="px-4 py-3 text-gray-600">{i.fine ? `₵${Number(i.fine).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3">{i.status === "ISSUED" && <Button size="sm" variant="outline" disabled={returning === i.id} onClick={() => returnBook(i.id)}><RotateCcw className="h-3.5 w-3.5 mr-1" />{returning === i.id ? "…" : "Return"}</Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
