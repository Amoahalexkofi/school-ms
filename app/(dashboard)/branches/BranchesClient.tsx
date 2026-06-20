"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Pencil, Trash2, Users, UserCog, Star, X } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  code?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isMain: boolean;
  isActive: boolean;
  _count?: { students: number; staff: number };
};

const empty = { name: "", code: "", email: "", phone: "", address: "" };

export function BranchesClient({ initialBranches }: { initialBranches: Branch[] }) {
  const router = useRouter();
  const [branches] = useState<Branch[]>(initialBranches);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startAdd() {
    setEditing(null);
    setForm(empty);
    setError("");
    setOpen(true);
  }
  function startEdit(b: Branch) {
    setEditing(b);
    setForm({ name: b.name, code: b.code ?? "", email: b.email ?? "", phone: b.phone ?? "", address: b.address ?? "" });
    setError("");
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) { setError("Branch name is required"); return; }
    setSaving(true); setError("");
    const url = editing ? `/api/branches/${editing.id}` : "/api/branches";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save branch");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function remove(b: Branch) {
    if (!confirm(`Delete "${b.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/branches/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Failed to delete branch");
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">School branches</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Manage campuses. Switch the active branch from the sidebar to work within one.
          </p>
        </div>
        <button onClick={startAdd}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shrink-0">
          <Plus className="h-4 w-4" /> Add branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 border-dashed py-16 text-center">
          <Building2 className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">No branches yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your first branch to start organising campuses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-slate-900 text-[14px] truncate">{b.name}</p>
                      {b.isMain && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
                          <Star className="h-2.5 w-2.5" /> Main
                        </span>
                      )}
                    </div>
                    {b.code && <p className="text-[12px] text-slate-400">{b.code}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!b.isMain && (
                    <button onClick={() => remove(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {(b.phone || b.address) && (
                <div className="mt-3 space-y-0.5 text-[12px] text-slate-500">
                  {b.phone && <p>{b.phone}</p>}
                  {b.address && <p className="truncate">{b.address}</p>}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[12px]">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> {b._count?.students ?? 0} students
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <UserCog className="h-3.5 w-3.5 text-slate-400" /> {b._count?.staff ?? 0} staff
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">{editing ? "Edit branch" : "Add branch"}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {[
                { k: "name", label: "Branch name *", ph: "e.g. East Campus" },
                { k: "code", label: "Code", ph: "e.g. EC" },
                { k: "phone", label: "Phone", ph: "Phone number" },
                { k: "email", label: "Email", ph: "branch@school.edu" },
              ].map(({ k, label, ph }) => (
                <div key={k}>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    value={(form as any)[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    placeholder={ph}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Branch address"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all resize-none"
                />
              </div>
              {error && <p className="text-[12px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[13px] font-medium transition-colors">
                {saving ? "Saving…" : editing ? "Save changes" : "Add branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
