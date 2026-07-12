"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Search, Eye, GraduationCap, CreditCard, Upload, UserX, Mail, Trash2, Layers, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  initialClassId?: string;
  initialSectionId?: string;
};

const FSEL = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

export function StudentsClient({ students, classSections, total, page, totalPages, limit, initialSearch, initialClassId = "", initialSectionId = "" }: Props) {
  const [search, setSearch]   = useState(initialSearch);
  const perm                  = usePermission("student_information");
  const router                = useRouter();
  const pathname              = usePathname();
  const searchParams          = useSearchParams();

  // Distinct classes + sections for the selected class (Class/Section filter)
  const classes = Array.from(
    new Map((classSections ?? []).map((cs: any) => [cs.class.id, cs.class])).values()
  ) as any[];
  const sections = (classSections ?? []).filter((cs: any) => cs.class.id === initialClassId).map((cs: any) => cs.section);

  const setParam = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v); else params.delete(k);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

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

  // ── Bulk select / delete / email (Smart School bulkdelete + sendbulkmail) ──
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "", target: "both" });
  const [busy, setBusy] = useState(false);

  const allOnPage = students.length > 0 && students.every((s: any) => selected.has(s.id));
  function toggle(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected((s) => {
      const n = new Set(s);
      if (allOnPage) students.forEach((x: any) => n.delete(x.id));
      else students.forEach((x: any) => n.add(x.id));
      return n;
    });
  }

  async function bulkDelete() {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} student(s)? Students with active enrollments will be skipped.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/students/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      alert(`Deleted ${d.deleted}${d.skipped ? `, skipped ${d.skipped} (active enrollment)` : ""}.`);
      setSelected(new Set());
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  }

  async function sendBulkEmail() {
    const ids = [...selected];
    if (!ids.length || !emailForm.message.trim()) { alert("Enter a message"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/students/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email", ids, ...emailForm }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      alert(`Email queued to ${d.sent} recipient group(s).`);
      setEmailOpen(false); setEmailForm({ subject: "", message: "", target: "both" }); setSelected(new Set());
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 w-full sm:w-64"
              placeholder="Search students…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className={FSEL} value={initialClassId}
            onChange={e => setParam({ classId: e.target.value, sectionId: "" })}>
            <option value="">All classes</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={FSEL} value={initialSectionId} disabled={!initialClassId}
            onChange={e => setParam({ sectionId: e.target.value })}>
            <option value="">All sections</option>
            {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <span className="text-sm text-gray-500 shrink-0">{total} student{total !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {perm.canAdd && (
            <Link href="/students/import">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" /> Import
              </Button>
            </Link>
          )}
          {/* Secondary flows live behind one menu — Add Student stays the
              single primary action (One Accent Rule). */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <MoreHorizontal className="h-4 w-4 mr-1" /> More
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem render={<Link href="/students/id-card" />}>
                <CreditCard className="h-4 w-4" /> ID Cards
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/students/promote" />}>
                <GraduationCap className="h-4 w-4" /> Promote students
              </DropdownMenuItem>
              {perm.canEdit && (
                <DropdownMenuItem render={<Link href="/students/multiclass" />}>
                  <Layers className="h-4 w-4" /> Multi-class enrollment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem render={<Link href="/students/disabled" />}>
                <UserX className="h-4 w-4" /> Disabled students
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {perm.canAdd && (
            <Link href="/students/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Student
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && perm.canEdit && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-indigo-700">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)}>
            <Mail className="h-3.5 w-3.5 mr-1" /> Email
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={busy} onClick={bulkDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <button className="text-xs text-gray-500 hover:underline ml-auto" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

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
                      <th className="px-4 py-3 w-8"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select all" /></th>
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
                        <tr key={s.id} className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/students/${s.id}`)}>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${s.firstName}`} /></td>
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
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            {/* Row itself navigates; keep an explicit link for keyboard/AT users */}
                            <Link href={`/students/${s.id}`}
                              aria-label={`View ${s.firstName} ${s.lastName}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                              <Eye className="h-4 w-4" />
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

      {/* Bulk email dialog */}
      <Dialog open={emailOpen} onOpenChange={(o) => !o && setEmailOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Email {selected.size} student{selected.size !== 1 ? "s" : ""}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send to</label>
              <select className={FSEL + " w-full"} value={emailForm.target} onChange={(e) => setEmailForm((f) => ({ ...f, target: e.target.value }))}>
                <option value="both">Student & Guardian</option>
                <option value="student">Student only</option>
                <option value="guardian">Guardian only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input value={emailForm.subject} onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                rows={4} value={emailForm.message} onChange={(e) => setEmailForm((f) => ({ ...f, message: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
              <Button disabled={busy} onClick={sendBulkEmail}>{busy ? "Sending…" : "Send Email"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
