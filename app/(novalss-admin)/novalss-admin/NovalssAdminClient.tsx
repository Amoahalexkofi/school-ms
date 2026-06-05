"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Plus, X, ExternalLink, Trash2, CheckCircle2,
  XCircle, Clock, Users, Globe, RefreshCw,
} from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

type School = {
  id: string; name: string; subdomain: string; customDomain?: string;
  schemaName: string; plan: string; status: string; adminEmail: string;
  adminName?: string; phone?: string; address?: string; country: string;
  trialEndsAt?: string; createdAt: string;
};

const PLAN_COLOR: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700",
  basic: "bg-blue-100 text-blue-700",
  pro:   "bg-purple-100 text-purple-700",
};
const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  trial:     "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};
const PLANS = ["trial", "basic", "pro"];
const STATUSES = ["trial", "active", "suspended"];

const emptyForm = {
  name: "", subdomain: "", adminEmail: "", adminPassword: "",
  adminName: "", phone: "", address: "", country: "Ghana", plan: "trial",
};

export function NovalssAdminClient({ schools: initial }: { schools: School[] }) {
  const [schools, setSchools]     = useState<School[]>(initial);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<any>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState<string | null>(null);

  const filtered = schools.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subdomain.includes(search.toLowerCase()) || s.adminEmail.includes(search.toLowerCase())
  );

  function set(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function provision() {
    if (!form.name || !form.subdomain || !form.adminEmail || !form.adminPassword) {
      setError("School name, subdomain, admin email and password are required"); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSchools(s => [data, ...s]);
      setShowForm(false);
      setForm(emptyForm);
    } catch (e: any) { setError(e.message ?? "Provisioning failed"); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/schools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setSchools(s => s.map(x => x.id === id ? { ...x, status } : x));
  }

  async function updatePlan(id: string, plan: string) {
    const res = await fetch(`/api/admin/schools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) setSchools(s => s.map(x => x.id === id ? { ...x, plan } : x));
  }

  async function deleteSchool(id: string, name: string) {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${name}" and all its data? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
    if (res.ok) setSchools(s => s.filter(x => x.id !== id));
    setDeleting(null);
  }

  const active    = schools.filter(s => s.status === "active").length;
  const trial     = schools.filter(s => s.status === "trial").length;
  const suspended = schools.filter(s => s.status === "suspended").length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Novalss Admin</h1>
            <p className="text-xs text-gray-400">School Management Platform</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(true); setError(""); setForm(emptyForm); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Provision New School
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Total Schools</p><p className="text-3xl font-bold">{schools.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Active</p><p className="text-3xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Trial</p><p className="text-3xl font-bold text-amber-600">{trial}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Suspended</p><p className="text-3xl font-bold text-red-500">{suspended}</p></CardContent></Card>
      </div>

      {/* Provision form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-800">Provision New School</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label>School Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sunshine Academy" />
            </div>
            <div>
              <Label>Subdomain *</Label>
              <div className="flex items-center gap-1">
                <Input value={form.subdomain} onChange={e => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="sunshine" className="flex-1" />
                <span className="text-xs text-gray-400 whitespace-nowrap">.novalss.com</span>
              </div>
            </div>
            <div>
              <Label>Admin Email *</Label>
              <Input type="email" value={form.adminEmail} onChange={e => set("adminEmail", e.target.value)} placeholder="principal@sunshine.edu.gh" />
            </div>
            <div>
              <Label>Admin Password *</Label>
              <Input type="password" value={form.adminPassword} onChange={e => set("adminPassword", e.target.value)} placeholder="Strong password" />
            </div>
            <div>
              <Label>Admin Full Name</Label>
              <Input value={form.adminName} onChange={e => set("adminName", e.target.value)} placeholder="Dr. Kwame Mensah" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+233 XX XXX XXXX" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="School address" />
            </div>
            <div>
              <Label>Plan</Label>
              <select className={SEL} value={form.plan} onChange={e => set("plan", e.target.value)}>
                {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            {error && <p className="lg:col-span-3 text-sm text-red-600 font-medium">{error}</p>}
            <div className="lg:col-span-3 flex gap-2">
              <Button onClick={provision} disabled={saving}>
                {saving ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Provisioning… (30-60s)</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-1.5" />Provision School</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            {saving && (
              <p className="lg:col-span-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                Creating Postgres schema, copying table structure, and seeding admin account…
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search schools…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <p className="text-sm text-gray-400">{filtered.length} school{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Schools table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">School</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subdomain</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Trial Ends</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No schools yet. Provision your first school above.</p>
                  </td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{s.schemaName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`https://${s.subdomain}.novalss.com`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                        {s.subdomain}.novalss.com <ExternalLink className="h-3 w-3" />
                      </a>
                      {s.customDomain && (
                        <a href={`https://${s.customDomain}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline text-xs mt-0.5">
                          <Globe className="h-3 w-3" />{s.customDomain}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{s.adminName || "—"}</p>
                      <p className="text-xs text-gray-400">{s.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={s.plan}
                        onChange={e => updatePlan(s.id, e.target.value)}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={s.status}
                        onChange={e => updateStatus(s.id, e.target.value)}
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {s.trialEndsAt ? (
                        <span className={new Date(s.trialEndsAt) < new Date() ? "text-red-500" : "text-amber-600"}>
                          {new Date(s.trialEndsAt).toLocaleDateString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => deleteSchool(s.id, s.name)}
                        disabled={deleting === s.id}
                        className="text-red-400 hover:text-red-600"
                      >
                        {deleting === s.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
