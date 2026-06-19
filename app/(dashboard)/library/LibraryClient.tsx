"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RotateCcw, Trash2, X } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

type Props = { books: any[]; issues: any[]; students: any[]; staff: any[]; members: any[] };
type Tab = "catalog" | "issues" | "members";

const STATUS_STYLE: Record<string, string> = {
  ISSUED: "bg-blue-100 text-blue-700", RETURNED: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700",
};

export function LibraryClient({ books, issues, students, staff, members: initialMembers }: Props) {
  const router = useRouter();
  const perm = usePermission("library");
  const [tab, setTab] = useState<Tab>("catalog");
  const [search, setSearch] = useState("");
  const [returning,     setReturning]     = useState<string | null>(null);
  const [issueFromDate, setIssueFromDate] = useState("");
  const [issueToDate,   setIssueToDate]   = useState("");
  const [issueStatus,   setIssueStatus]   = useState<"" | "ISSUED" | "RETURNED">("");

  // Members state
  const [members,       setMembers]       = useState(initialMembers);
  const [memPanel,      setMemPanel]      = useState(false);
  const [memType,       setMemType]       = useState("student");
  const [memPersonId,   setMemPersonId]   = useState("");
  const [memCardNo,     setMemCardNo]     = useState("");
  const [memLoad,       setMemLoad]       = useState(false);
  const [memErr,        setMemErr]        = useState("");
  const [removingMem,   setRemovingMem]   = useState<string | null>(null);

  async function returnBook(id: string) {
    setReturning(id);
    const res = await fetch(`/api/library/issues/${id}`, { method: "PATCH" });
    if (!res.ok) alert((await res.json()).error); else router.refresh();
    setReturning(null);
  }

  const filtered = books.filter(b => !search || [b.title, b.author, b.bookNo].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const filteredIssues = issues.filter((i: any) => {
    if (issueStatus && i.status !== issueStatus) return false;
    const issuedAt = new Date(i.issuedAt);
    if (issueFromDate && issuedAt < new Date(issueFromDate)) return false;
    if (issueToDate   && issuedAt > new Date(issueToDate + "T23:59:59")) return false;
    return true;
  });

  // Already-registered person IDs for the selected type
  const registeredIds = new Set(members.filter((m: any) => m.memberType === memType).map((m: any) => m.memberId));
  const personOptions = (memType === "student" ? students : staff).filter((p: any) => !registeredIds.has(p.id));

  async function saveMember() {
    if (!memPersonId) { setMemErr("Select a person"); return; }
    setMemLoad(true); setMemErr("");
    try {
      const res = await fetch("/api/library/members", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberType: memType, memberId: memPersonId, libraryCardNo: memCardNo || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const person = (memType === "student" ? students : staff).find((p: any) => p.id === memPersonId);
      setMembers(ms => [{ ...data, person }, ...ms]);
      setMemPanel(false); setMemPersonId(""); setMemCardNo("");
    } catch (e: any) { setMemErr(e.message); }
    finally { setMemLoad(false); }
  }

  async function removeMember(id: string) {
    if (!confirm("Remove this library member?")) return;
    setRemovingMem(id);
    try {
      const res = await fetch("/api/library/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setMembers(ms => ms.filter((m: any) => m.id !== id));
    } catch (e: any) { alert(e.message); }
    finally { setRemovingMem(null); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {[
          { key: "catalog" as Tab, label: "Book Catalog" },
          { key: "issues"  as Tab, label: `Issue Log (${issues.filter(i => i.status === "ISSUED").length} active)` },
          { key: "members" as Tab, label: `Members (${members.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input className="w-full sm:w-64" placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex gap-2 shrink-0">
              {perm.canAdd && (
                <Link href="/library/issue/new">
                  <Button variant="outline"><Plus className="h-4 w-4 mr-1.5" />Issue Book</Button>
                </Link>
              )}
              {perm.canAdd && (
                <Link href="/library/books/new">
                  <Button><Plus className="h-4 w-4 mr-1.5" />Add Book</Button>
                </Link>
              )}
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
                      {perm.canAdd && b.available > 0 && (
                        <Link href="/library/issue/new">
                          <Button size="sm" variant="outline">Issue</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Button onClick={() => { setMemPanel(true); setMemPersonId(""); setMemCardNo(""); setMemErr(""); }}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Member
              </Button>
            )}
          </div>

          {memPanel && (
            <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-800">Register Library Member</p>
                <button onClick={() => setMemPanel(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Member Type *</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    value={memType} onChange={e => { setMemType(e.target.value); setMemPersonId(""); }}>
                    <option value="student">Student</option>
                    <option value="teacher">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{memType === "student" ? "Student" : "Staff"} *</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    value={memPersonId} onChange={e => setMemPersonId(e.target.value)}>
                    <option value="">— Select —</option>
                    {personOptions.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({memType === "student" ? p.admissionNo : p.employeeId})
                      </option>
                    ))}
                  </select>
                  {personOptions.length === 0 && <p className="text-xs text-gray-400 mt-1">All {memType === "student" ? "students" : "staff"} are already registered.</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Library Card No (optional)</label>
                  <Input value={memCardNo} onChange={e => setMemCardNo(e.target.value)} placeholder="Auto-generated if blank" />
                </div>
              </div>
              {memErr && <p className="text-sm text-red-600">{memErr}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMemPanel(false)}>Cancel</Button>
                <Button disabled={memLoad} onClick={saveMember}>{memLoad ? "Saving…" : "Register"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Card No.","Name","ID / Adm No.","Type","Joined",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {members.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No library members registered.</td></tr>
                : members.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.libraryCardNo ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.person ? `${m.person.firstName} ${m.person.lastName}` : `[${m.memberId.slice(0, 8)}…]`}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {m.memberType === "student" ? m.person?.admissionNo : m.person?.employeeId ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.memberType === "student" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {m.memberType === "student" ? "Student" : "Staff"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {perm.canDelete && (
                        <button onClick={() => removeMember(m.id)} disabled={removingMem === m.id}
                          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
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
        <div className="space-y-3">
          {/* Date-range / status filter bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <Input type="date" value={issueFromDate} onChange={e => setIssueFromDate(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <Input type="date" value={issueToDate} onChange={e => setIssueToDate(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={issueStatus} onChange={e => setIssueStatus(e.target.value as any)}
                className="h-8 text-sm border rounded-lg px-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="ISSUED">Issued</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
            {(issueFromDate || issueToDate || issueStatus) && (
              <Button size="sm" variant="outline" onClick={() => { setIssueFromDate(""); setIssueToDate(""); setIssueStatus(""); }}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
            <span className="text-xs text-gray-400 ml-auto self-end">{filteredIssues.length} record{filteredIssues.length !== 1 ? "s" : ""}</span>
          </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{["Book","Issued To","Issued","Due","Status","Fine",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filteredIssues.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No records match the filter.</td></tr>
              : filteredIssues.map((i: any) => {
                const overdue = i.status === "ISSUED" && new Date(i.dueDate) < new Date();
                return (
                  <tr key={i.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3"><div className="font-medium truncate max-w-[160px]">{i.book.title}</div><div className="text-xs text-gray-400">{i.book.bookNo}</div></td>
                    <td className="px-4 py-3 text-gray-700">{i.student ? `${i.student.firstName} ${i.student.lastName}` : i.staff ? `${i.staff.firstName} ${i.staff.lastName}` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(i.issuedAt).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>{new Date(i.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${overdue ? "bg-red-100 text-red-700" : STATUS_STYLE[i.status]}`}>{overdue ? "OVERDUE" : i.status}</span></td>
                    <td className="px-4 py-3 text-gray-600">{i.fine ? `₵${Number(i.fine).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3">{i.status === "ISSUED" && perm.canEdit && <Button size="sm" variant="outline" disabled={returning === i.id} onClick={() => returnBook(i.id)}><RotateCcw className="h-3.5 w-3.5 mr-1" />{returning === i.id ? "…" : "Return"}</Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </main>
  );
}
