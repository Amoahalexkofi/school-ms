"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, CheckCircle2, AlertCircle } from "lucide-react";

type Props = { sessions: any[]; classSections: any[]; discounts: any[] };

type StudentRow = {
  studentSessionId: string;
  rollNo: string | null;
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  assigned: { id: string; status: string } | null;
};

export function FeeDiscountsClient({ sessions, classSections, discounts }: Props) {
  const [sessionId,      setSessionId]      = useState(sessions[0]?.id ?? "");
  const [classSectionId, setClassSectionId] = useState("");
  const [discountId,     setDiscountId]     = useState(discounts[0]?.id ?? "");
  const [rows,           setRows]           = useState<StudentRow[]>([]);
  const [checked,        setChecked]        = useState<Set<string>>(new Set());
  const [loading,        setLoading]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [searched,       setSearched]       = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");

  const selectedDiscount = discounts.find((d: any) => d.id === discountId);

  async function handleSearch() {
    if (!sessionId || !classSectionId || !discountId) {
      setError("Please select a session, class/section, and discount."); return;
    }
    setLoading(true); setError(""); setSuccess(""); setRows([]); setSearched(false);
    try {
      const res = await fetch(
        `/api/fees/discounts/assign?sessionId=${sessionId}&classSectionId=${classSectionId}&discountId=${discountId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data);
      // Pre-check students who already have the discount
      setChecked(new Set(data.filter((r: StudentRow) => r.assigned).map((r: StudentRow) => r.studentSessionId)));
      setSearched(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function toggleRow(ssId: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(ssId)) next.delete(ssId); else next.add(ssId);
      return next;
    });
  }

  function toggleAll() {
    if (checked.size === rows.length) setChecked(new Set());
    else setChecked(new Set(rows.map(r => r.studentSessionId)));
  }

  async function handleSave() {
    setSaving(true); setError(""); setSuccess("");

    // toAssign = checked but not yet assigned
    const toAssign   = rows.filter(r => checked.has(r.studentSessionId) && !r.assigned).map(r => r.studentSessionId);
    // toRemove = previously assigned but now unchecked
    const toRemove   = rows.filter(r => !checked.has(r.studentSessionId) && r.assigned).map(r => r.studentSessionId);

    try {
      if (toAssign.length > 0) {
        const res = await fetch("/api/fees/discounts/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountId, studentSessionIds: toAssign }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      }

      if (toRemove.length > 0) {
        const res = await fetch("/api/fees/discounts/assign", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountId, studentSessionIds: toRemove }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      }

      setSuccess(`Saved: ${toAssign.length} assigned, ${toRemove.length} removed.`);
      // Refresh the list
      await handleSearch();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      {/* Filter form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Assign Discount to Students</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount *</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={discountId} onChange={e => { setDiscountId(e.target.value); setSearched(false); setRows([]); }}>
              <option value="">— Select discount —</option>
              {discounts.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type === "percentage" ? `${d.percentage}%` : `₵${Number(d.amount).toLocaleString()}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={sessionId} onChange={e => { setSessionId(e.target.value); setSearched(false); setRows([]); }}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class / Section *</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={classSectionId} onChange={e => { setClassSectionId(e.target.value); setSearched(false); setRows([]); }}>
              <option value="">— Select class —</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button disabled={loading} onClick={handleSearch} className="w-full">
              <Search className="h-4 w-4 mr-1.5" />
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>

        {selectedDiscount && (
          <p className="text-xs text-blue-600">
            {selectedDiscount.name} — {selectedDiscount.type === "percentage"
              ? `${selectedDiscount.percentage}% off`
              : `₵${Number(selectedDiscount.amount).toLocaleString()} fixed`}
            {selectedDiscount.expireDate && ` · expires ${new Date(selectedDiscount.expireDate).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Student table */}
      {searched && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-700">
              {rows.length} student{rows.length !== 1 ? "s" : ""} found
              {rows.length > 0 && ` · ${checked.size} selected`}
            </p>
            {rows.length > 0 && (
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            )}
          </div>

          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">No active students found in this class/session.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={checked.size === rows.length} onChange={toggleAll}
                      className="rounded border-slate-200 text-blue-600 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </th>
                  {["Admission No", "Name", "Roll No", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const isChecked = checked.has(row.studentSessionId);
                  return (
                    <tr key={row.studentSessionId} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRow(row.studentSessionId)}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleRow(row.studentSessionId)}
                          className="rounded border-slate-200 text-blue-600 focus:ring-indigo-500/20 focus:border-indigo-400" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.student.admissionNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.rollNo ?? "—"}</td>
                      <td className="px-4 py-3">
                        {row.assigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Not assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {rows.length > 0 && (
            <div className="px-4 py-3 border-t flex justify-end">
              <Button disabled={saving} onClick={handleSave}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
