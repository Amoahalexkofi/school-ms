"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [bookOpen, setBookOpen] = useState(false);
  const [bookForm, setBookForm] = useState({ title: "", author: "", bookNo: "", isbn: "", subject: "", rackNo: "", publisher: "", quantity: "1", perUnitCost: "" });
  const [bookErr, setBookErr] = useState(""); const [bookLoad, setBookLoad] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", staffId: "", issueTo: "student", dueDate: "" });
  const [issueErr, setIssueErr] = useState(""); const [issueLoad, setIssueLoad] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }

  async function saveBook() {
    if (!bookForm.title.trim() || !bookForm.author.trim()) { setBookErr("Title and author required"); return; }
    setBookLoad(true); setBookErr("");
    try { await post("/api/library/books", bookForm); setBookOpen(false); router.refresh(); }
    catch (e: any) { setBookErr(e.message); } finally { setBookLoad(false); }
  }

  async function issueBook() {
    const studentId = issueForm.issueTo === "student" ? issueForm.studentId : undefined;
    const staffId   = issueForm.issueTo === "staff"   ? issueForm.staffId   : undefined;
    if (!issueForm.bookId || !issueForm.dueDate || (!studentId && !staffId)) { setIssueErr("All fields required"); return; }
    setIssueLoad(true); setIssueErr("");
    try { await post("/api/library/issues", { bookId: issueForm.bookId, studentId, staffId, dueDate: issueForm.dueDate }); setIssueOpen(false); router.refresh(); }
    catch (e: any) { setIssueErr(e.message); } finally { setIssueLoad(false); }
  }

  async function returnBook(id: string) {
    setReturning(id);
    const res = await fetch(`/api/library/issues/${id}`, { method: "PATCH" });
    if (!res.ok) alert((await res.json()).error); else router.refresh();
    setReturning(null);
  }

  const filtered = books.filter(b => !search || [b.title, b.author, b.bookNo].some(v => v?.toLowerCase().includes(search.toLowerCase())));
  const today = new Date().toISOString().slice(0, 10);

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
            <Button onClick={() => { setBookForm({ title: "", author: "", bookNo: "", isbn: "", subject: "", rackNo: "", publisher: "", quantity: "1", perUnitCost: "" }); setBookErr(""); setBookOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Add Book
            </Button>
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
                      <Button size="sm" variant="outline" disabled={b.available === 0}
                        onClick={() => { setIssueForm({ bookId: b.id, studentId: "", staffId: "", issueTo: "student", dueDate: "" }); setIssueErr(""); setIssueOpen(true); }}>
                        Issue
                      </Button>
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

      {/* Add Book Dialog */}
      <Dialog open={bookOpen} onOpenChange={o => !o && setBookOpen(false)}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[["Title *","title"],["Author *","author"],["Book No.","bookNo"],["ISBN","isbn"],["Subject","subject"],["Rack No.","rackNo"],["Publisher","publisher"],["Quantity","quantity"],["Cost per Unit (₵)","perUnitCost"]].map(([l, k]) => (
            <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <Input type={k === "quantity" || k === "perUnitCost" ? "number" : "text"} value={(bookForm as any)[k]} onChange={e => setBookForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
        </div>
        {bookErr && <p className="text-sm text-red-600 mt-1">{bookErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button><Button disabled={bookLoad} onClick={saveBook}>{bookLoad ? "Saving…" : "Add Book"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={issueOpen} onOpenChange={o => !o && setIssueOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Book *</label>
            <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={issueForm.bookId} onChange={e => setIssueForm(f => ({ ...f, bookId: e.target.value }))}>
              <option value="">— Select —</option>
              {books.filter(b => b.available > 0).map((b: any) => <option key={b.id} value={b.id}>{b.title} (avail: {b.available})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            {["student","staff"].map(t => <button key={t} onClick={() => setIssueForm(f => ({ ...f, issueTo: t }))}
              className={`px-3 py-1.5 rounded-lg text-sm border font-medium ${issueForm.issueTo === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
          </div>
          {issueForm.issueTo === "student" ? (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={issueForm.studentId} onChange={e => setIssueForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">— Select —</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
              </select>
            </div>
          ) : (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Staff *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={issueForm.staffId} onChange={e => setIssueForm(f => ({ ...f, staffId: e.target.value }))}>
                <option value="">— Select —</option>
                {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
              </select>
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label><Input type="date" min={today} value={issueForm.dueDate} onChange={e => setIssueForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
        </div>
        {issueErr && <p className="text-sm text-red-600">{issueErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button><Button disabled={issueLoad} onClick={issueBook}>{issueLoad ? "Issuing…" : "Issue Book"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
