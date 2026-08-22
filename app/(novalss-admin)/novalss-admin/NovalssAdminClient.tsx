"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, Plus, X, ExternalLink, Trash2, CheckCircle2,
  XCircle, Clock, RefreshCw, ChevronDown, ChevronUp,
  BarChart3, Users, GraduationCap, Edit2, KeyRound,
  Globe, CalendarDays, StickyNote, AlertTriangle, Copy, Check,
  CreditCard, History, Repeat,
} from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type School = {
  id: string; name: string; subdomain: string; customDomain?: string;
  schemaName: string; plan: string; status: string; adminEmail: string;
  adminName?: string; phone?: string; address?: string; country: string;
  trialEndsAt?: string; notes?: string; addons?: string; createdAt: string;
  billingCycle?: string; subscriptionStartsAt?: string; subscriptionEndsAt?: string;
};

type BillingEvent = {
  id: string; type: string; billingCycle?: string | null;
  amount?: string | number | null; currency?: string | null;
  note?: string | null; createdAt: string;
};

const BILLING_CYCLES: { value: string; label: string }[] = [
  { value: "monthly",  label: "Monthly" },
  { value: "yearly",   label: "1 Year" },
  { value: "5yr",      label: "5 Years" },
  { value: "7yr",      label: "7 Years" },
  { value: "lifetime", label: "Lifetime" },
];
const BILLING_CYCLE_LABEL: Record<string, string> = Object.fromEntries(BILLING_CYCLES.map(c => [c.value, c.label]));

// Matches app/HomepageClient.tsx's public pricing section (#pricing) — kept
// in sync manually since the site copy and this suggestion aren't the same
// render. Just a starting point in the amount field; the admin can override.
const PRICE_SUGGESTION: Record<string, number> = {
  monthly: 199, yearly: 1990, "5yr": 7990, "7yr": 9990, lifetime: 48000,
};

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

// Purchasable add-ons that can be released to a school.
const ADDON_CATALOG: { key: string; label: string }[] = [
  { key: "multi_branch", label: "Multi Branch" },
];

type Stats = { students: number; staff: number; sessions: number; lastActive: string | null };

const PLAN_BADGE: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700 border border-amber-200",
  basic: "bg-blue-100 text-blue-700 border border-blue-200",
  pro:   "bg-purple-100 text-purple-700 border border-purple-200",
};
const STATUS_BADGE: Record<string, string> = {
  active:    "bg-green-100 text-green-700 border border-green-200",
  trial:     "bg-amber-100 text-amber-700 border border-amber-200",
  suspended: "bg-red-100 text-red-700 border border-red-200",
};
const PLANS    = ["trial", "basic", "pro"];
const STATUSES = ["trial", "active", "suspended"];

const emptyProvision = {
  name: "", subdomain: "", adminEmail: "", adminPassword: "",
  adminName: "", phone: "", address: "", country: "Ghana", plan: "trial",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function NovalssAdminClient({ schools: initial }: { schools: School[] }) {
  const [schools, setSchools]         = useState<School[]>(initial);
  const [showProvision, setShowProv]  = useState(false);
  const [form, setForm]               = useState<any>(emptyProvision);
  const [saving, setSaving]           = useState(false);
  const [provErr, setProvErr]         = useState("");
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [stats, setStats]             = useState<Record<string, Stats>>({});
  const [loadingStats, setLoadingStats] = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [editTarget, setEditTarget]   = useState<School | null>(null);
  const [editForm, setEditForm]       = useState<any>({});
  const [editSaving, setEditSaving]   = useState(false);
  const [editErr, setEditErr]         = useState("");
  const [suspendTarget, setSuspendTarget] = useState<School | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending]   = useState(false);
  const [resetTarget, setResetTarget] = useState<School | null>(null);
  const [newPwd, setNewPwd]           = useState("");
  const [resetting, setResetting]     = useState(false);
  const [resetErr, setResetErr]       = useState("");
  const [resetOk, setResetOk]         = useState(false);
  const [copied, setCopied]           = useState<string | null>(null);
  const [showRenewalsOnly, setShowRenewalsOnly] = useState(false);
  const [events, setEvents]           = useState<Record<string, BillingEvent[]>>({});
  const [loadingEvents, setLoadingEvents] = useState<string | null>(null);
  const [renewTarget, setRenewTarget] = useState<School | null>(null);
  const [renewForm, setRenewForm]     = useState({ billingCycle: "monthly", amount: "", note: "" });
  const [renewSaving, setRenewSaving] = useState(false);
  const [renewErr, setRenewErr]       = useState("");

  const filtered = schools.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subdomain.includes(search.toLowerCase()) ||
      s.adminEmail.includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (showRenewalsOnly) {
      const d = daysUntil(s.subscriptionEndsAt);
      if (d === null || d > 7) return false;
    }
    return true;
  });

  // ── provision ──────────────────────────────────────────────────────────────

  function setF(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function provision() {
    if (!form.name || !form.subdomain || !form.adminEmail || !form.adminPassword) {
      setProvErr("School name, subdomain, admin email and password are required"); return;
    }
    setSaving(true); setProvErr("");
    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSchools(s => [data, ...s]);
      setShowProv(false); setForm(emptyProvision);
    } catch (e: any) { setProvErr(e.message ?? "Provisioning failed"); }
    finally { setSaving(false); }
  }

  // ── stats ──────────────────────────────────────────────────────────────────

  async function loadStats(id: string) {
    if (stats[id]) return;
    setLoadingStats(id);
    try {
      const res = await fetch(`/api/admin/schools/${id}/stats`);
      const data = await res.json();
      if (res.ok) setStats(s => ({ ...s, [id]: data }));
    } finally { setLoadingStats(null); }
  }

  async function loadEvents(id: string) {
    if (events[id]) return;
    setLoadingEvents(id);
    try {
      const res = await fetch(`/api/admin/schools/${id}/billing-events`);
      const data = await res.json();
      if (res.ok) setEvents(e => ({ ...e, [id]: data }));
    } finally { setLoadingEvents(null); }
  }

  function toggleExpand(id: string) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) { loadStats(next); loadEvents(next); }
  }

  // ── renew / record payment ─────────────────────────────────────────────────

  function openRenew(s: School) {
    setRenewTarget(s);
    const cycle = s.billingCycle || "monthly";
    setRenewForm({ billingCycle: cycle, amount: String(PRICE_SUGGESTION[cycle] ?? ""), note: "" });
    setRenewErr("");
  }

  // Re-suggests the amount when the cycle changes, but only if the admin
  // hasn't already typed a custom figure over the previous suggestion.
  function setRenewCycle(cycle: string) {
    setRenewForm(f => {
      const wasSuggested = f.amount === "" || f.amount === String(PRICE_SUGGESTION[f.billingCycle] ?? "");
      return { ...f, billingCycle: cycle, amount: wasSuggested ? String(PRICE_SUGGESTION[cycle] ?? "") : f.amount };
    });
  }

  async function confirmRenew() {
    if (!renewTarget) return;
    setRenewSaving(true); setRenewErr("");
    try {
      const res = await fetch(`/api/admin/schools/${renewTarget.id}/billing-events`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "renewed",
          billingCycle: renewForm.billingCycle,
          amount: renewForm.amount ? Number(renewForm.amount) : undefined,
          note: renewForm.note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to record payment");
      if (data.tenant) {
        setSchools(list => list.map(x => x.id === renewTarget.id ? { ...x, ...data.tenant } : x));
      }
      setEvents(e => ({ ...e, [renewTarget.id]: [data.event, ...(e[renewTarget.id] ?? [])] }));
      setRenewTarget(null);
    } catch (e: any) { setRenewErr(e.message); }
    finally { setRenewSaving(false); }
  }

  // ── inline updates ─────────────────────────────────────────────────────────

  async function patch(id: string, data: Record<string, any>) {
    const res = await fetch(`/api/admin/schools/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setSchools(s => s.map(x => x.id === id ? { ...x, ...updated } : x));
    }
  }

  // ── edit dialog ────────────────────────────────────────────────────────────

  function openEdit(s: School) {
    setEditTarget(s);
    setEditForm({
      name: s.name, adminEmail: s.adminEmail, adminName: s.adminName ?? "",
      phone: s.phone ?? "", address: s.address ?? "", country: s.country,
      customDomain: s.customDomain ?? "",
      trialEndsAt: s.trialEndsAt ? s.trialEndsAt.slice(0, 10) : "",
      notes: s.notes ?? "",
      billingCycle: s.billingCycle ?? "",
      subscriptionStartsAt: s.subscriptionStartsAt ? s.subscriptionStartsAt.slice(0, 10) : "",
      subscriptionEndsAt: s.subscriptionEndsAt ? s.subscriptionEndsAt.slice(0, 10) : "",
    });
    setEditErr("");
  }

  async function saveEdit() {
    if (!editTarget) return;
    setEditSaving(true); setEditErr("");
    try {
      const payload: any = { ...editForm };
      if (!payload.customDomain) payload.customDomain = null;
      if (payload.trialEndsAt) payload.trialEndsAt = new Date(payload.trialEndsAt).toISOString();
      else payload.trialEndsAt = null;
      payload.subscriptionStartsAt = payload.subscriptionStartsAt ? new Date(payload.subscriptionStartsAt).toISOString() : null;
      payload.subscriptionEndsAt   = payload.subscriptionEndsAt   ? new Date(payload.subscriptionEndsAt).toISOString()   : null;
      payload.billingCycle = payload.billingCycle || null;
      await patch(editTarget.id, payload);
      setEditTarget(null);
    } catch (e: any) { setEditErr(e.message); }
    finally { setEditSaving(false); }
  }

  // ── suspend dialog ─────────────────────────────────────────────────────────

  async function confirmSuspend() {
    if (!suspendTarget) return;
    setSuspending(true);
    await patch(suspendTarget.id, { status: "suspended", notes: suspendReason || null });
    setSuspendTarget(null); setSuspendReason(""); setSuspending(false);
  }

  // ── reset password ─────────────────────────────────────────────────────────

  async function confirmReset() {
    if (!resetTarget || !newPwd) return;
    setResetting(true); setResetErr(""); setResetOk(false);
    try {
      const res = await fetch(`/api/admin/schools/${resetTarget.id}/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetOk(true);
    } catch (e: any) { setResetErr(e.message); }
    finally { setResetting(false); }
  }

  // ── delete ─────────────────────────────────────────────────────────────────

  async function deleteSchool(id: string, name: string) {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${name}" and ALL its data? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
    if (res.ok) setSchools(s => s.filter(x => x.id !== id));
    setDeleting(null);
  }

  // ── copy helper ────────────────────────────────────────────────────────────

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  // ── stats ──────────────────────────────────────────────────────────────────

  const active    = schools.filter(s => s.status === "active").length;
  const trial     = schools.filter(s => s.status === "trial").length;
  const suspended = schools.filter(s => s.status === "suspended").length;
  const renewalsDue = schools.filter(s => {
    const d = daysUntil(s.subscriptionEndsAt);
    return d !== null && d <= 7;
  }).length;

  // ── render ─────────────────────────────────────────────────────────────────

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
            <p className="text-xs text-gray-400">Skula Platform Admin</p>
          </div>
        </div>
        <Button onClick={() => { setShowProv(true); setProvErr(""); setForm(emptyProvision); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Provision New School
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Total Schools</p><p className="text-3xl font-bold">{schools.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Active</p><p className="text-3xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Trial</p><p className="text-3xl font-bold text-amber-600">{trial}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Suspended</p><p className="text-3xl font-bold text-red-500">{suspended}</p></CardContent></Card>
        <Card
          className={`cursor-pointer transition-colors ${showRenewalsOnly ? "border-orange-300 bg-orange-50/50" : "hover:border-orange-200"}`}
          onClick={() => setShowRenewalsOnly(v => !v)}
        >
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Renewals Due <span className="text-gray-400">(7d)</span></p>
            <p className="text-3xl font-bold text-orange-600">{renewalsDue}</p>
          </CardContent>
        </Card>
      </div>
      {showRenewalsOnly && (
        <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 -mt-2">
          <Repeat className="h-3.5 w-3.5" />
          Showing tenants whose subscription expired or renews within 7 days.
          <button className="ml-auto underline" onClick={() => setShowRenewalsOnly(false)}>Clear filter</button>
        </div>
      )}

      {/* Provision Form */}
      {showProvision && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-800">Provision New School</CardTitle>
              <button onClick={() => setShowProv(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><Label>School Name *</Label>
              <Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Sunshine Academy" />
            </div>
            <div><Label>Subdomain *</Label>
              <div className="flex items-center gap-1">
                <Input value={form.subdomain} onChange={e => setF("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="sunshine" className="flex-1" />
                <span className="text-xs text-gray-400 whitespace-nowrap">.getskula.com</span>
              </div>
            </div>
            <div><Label>Admin Email *</Label>
              <Input type="email" value={form.adminEmail} onChange={e => setF("adminEmail", e.target.value)} placeholder="principal@school.edu" />
            </div>
            <div><Label>Admin Password *</Label>
              <Input type="password" value={form.adminPassword} onChange={e => setF("adminPassword", e.target.value)} />
            </div>
            <div><Label>Admin Name</Label>
              <Input value={form.adminName} onChange={e => setF("adminName", e.target.value)} placeholder="Dr. Kwame Mensah" />
            </div>
            <div><Label>Phone</Label>
              <Input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+233 XX XXX XXXX" />
            </div>
            <div><Label>Address</Label>
              <Input value={form.address} onChange={e => setF("address", e.target.value)} placeholder="School address" />
            </div>
            <div><Label>Plan</Label>
              <select className={SEL} value={form.plan} onChange={e => setF("plan", e.target.value)}>
                {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            {provErr && <p className="lg:col-span-3 text-sm text-red-600">{provErr}</p>}
            <div className="lg:col-span-3 flex gap-2">
              <Button onClick={provision} disabled={saving}>
                {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Provisioning…</> : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Provision School</>}
              </Button>
              <Button variant="outline" onClick={() => setShowProv(false)}>Cancel</Button>
            </div>
            {saving && <p className="lg:col-span-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">Creating Postgres schema, copying tables, seeding admin account…</p>}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input placeholder="Search schools…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <p className="text-sm text-gray-400">{filtered.length} school{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* School List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-gray-400">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No schools yet. Provision your first school above.</p>
          </CardContent></Card>
        ) : filtered.map(s => {
          const isExpanded = expanded === s.id;
          const schoolStats = stats[s.id];
          const trialExpired = s.trialEndsAt && new Date(s.trialEndsAt) < new Date();
          const subDaysLeft = daysUntil(s.subscriptionEndsAt);
          const subExpired = subDaysLeft !== null && subDaysLeft < 0;
          const subDueSoon = subDaysLeft !== null && subDaysLeft >= 0 && subDaysLeft <= 7;

          return (
            <Card key={s.id} className={isExpanded ? "border-blue-200 shadow-sm" : ""}>
              <CardContent className="p-0">
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-xl"
                  onClick={() => toggleExpand(s.id)}
                >
                  <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                      <Badge label={s.plan} cls={PLAN_BADGE[s.plan] ?? PLAN_BADGE.trial} />
                      <Badge label={s.status} cls={STATUS_BADGE[s.status] ?? STATUS_BADGE.active} />
                      {trialExpired && <Badge label="Trial expired" cls="bg-red-50 text-red-500 border border-red-200" />}
                      {subExpired && <Badge label={`Renewal ${Math.abs(subDaysLeft!)}d overdue`} cls="bg-red-50 text-red-500 border border-red-200" />}
                      {!subExpired && subDueSoon && <Badge label={`Renews in ${subDaysLeft}d`} cls="bg-orange-50 text-orange-600 border border-orange-200" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.adminEmail} · {s.subdomain}.getskula.com</p>
                  </div>
                  {schoolStats && (
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{schoolStats.students}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{schoolStats.staff}</span>
                    </div>
                  )}
                  {loadingStats === s.id && <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-4">

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Field label="Admin Name" value={s.adminName} />
                      <Field label="Phone" value={s.phone} />
                      <Field label="Country" value={s.country} />
                      <Field label="Address" value={s.address} />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Subdomain</p>
                        <a href={`https://${s.subdomain}.getskula.com`} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          {s.subdomain}.getskula.com <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {s.customDomain && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Custom Domain</p>
                          <a href={`https://${s.customDomain}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:underline flex items-center gap-1">
                            <Globe className="h-3 w-3" />{s.customDomain}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Trial Ends</p>
                        <p className={`text-sm ${trialExpired ? "text-red-500 font-medium" : "text-gray-700"}`}>
                          {s.trialEndsAt ? new Date(s.trialEndsAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Registered</p>
                        <p className="text-sm text-gray-700">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Schema</p>
                        <p className="text-xs text-gray-400 font-mono">{s.schemaName}</p>
                      </div>
                    </div>

                    {/* Usage stats */}
                    {schoolStats ? (
                      <div className="bg-gray-50 rounded-lg px-4 py-3 flex flex-wrap gap-6 text-sm">
                        <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-500" /><strong>{schoolStats.students}</strong> students</span>
                        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-green-500" /><strong>{schoolStats.staff}</strong> staff</span>
                        <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-purple-500" /><strong>{schoolStats.sessions}</strong> sessions</span>
                        {schoolStats.lastActive && (
                          <span className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4" />Last active: {new Date(schoolStats.lastActive).toLocaleDateString()}</span>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => loadStats(s.id)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" /> Load usage stats
                      </button>
                    )}

                    {/* Subscription */}
                    <div className="border border-slate-200 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" /> Subscription
                        </p>
                        <Button size="sm" variant="outline" onClick={() => openRenew(s)}>
                          <Repeat className="h-3.5 w-3.5 mr-1.5" /> {s.billingCycle ? "Renew" : "Start Subscription"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Billing Cycle</p>
                          <p className="text-sm text-gray-700">{s.billingCycle ? (BILLING_CYCLE_LABEL[s.billingCycle] ?? s.billingCycle) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Started</p>
                          <p className="text-sm text-gray-700">
                            {s.subscriptionStartsAt ? new Date(s.subscriptionStartsAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Renews / Expires</p>
                          <p className={`text-sm ${subExpired ? "text-red-500 font-medium" : subDueSoon ? "text-orange-600 font-medium" : "text-gray-700"}`}>
                            {s.billingCycle === "lifetime"
                              ? "Never expires"
                              : s.subscriptionEndsAt ? new Date(s.subscriptionEndsAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Billing history */}
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-2">
                          <History className="h-3.5 w-3.5" /> Billing History
                        </p>
                        {loadingEvents === s.id ? (
                          <p className="text-xs text-gray-400 flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" /> Loading…</p>
                        ) : (events[s.id]?.length ?? 0) === 0 ? (
                          <p className="text-xs text-gray-400">No billing events recorded yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {events[s.id].map(ev => (
                              <div key={ev.id} className="flex items-center gap-3 text-xs">
                                <span className="text-gray-400 w-20 shrink-0">{new Date(ev.createdAt).toLocaleDateString()}</span>
                                <span className="capitalize font-medium text-gray-700 w-16 shrink-0">{ev.type}</span>
                                {ev.billingCycle && <span className="text-gray-500">{BILLING_CYCLE_LABEL[ev.billingCycle] ?? ev.billingCycle}</span>}
                                {ev.amount != null && <span className="text-gray-700 font-medium">{ev.currency ?? "GHS"} {Number(ev.amount).toLocaleString()}</span>}
                                {ev.note && <span className="text-gray-400 truncate">— {ev.note}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {s.notes && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-sm text-amber-700">
                        <StickyNote className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{s.notes}</p>
                      </div>
                    )}

                    {/* Inline plan + status */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Plan</Label>
                        <select className="text-xs border rounded px-2 py-1" value={s.plan}
                          onChange={e => patch(s.id, { plan: e.target.value })}>
                          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Status</Label>
                        <select className="text-xs border rounded px-2 py-1" value={s.status}
                          onChange={e => {
                            if (e.target.value === "suspended") { setSuspendTarget(s); setSuspendReason(s.notes ?? ""); }
                            else patch(s.id, { status: e.target.value });
                          }}>
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Add-ons — release paid features to this school */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Label className="text-xs">Add-ons</Label>
                      {ADDON_CATALOG.map(addon => {
                        const enabled = (s.addons ?? "").split(",").map(x => x.trim()).filter(Boolean);
                        const on = enabled.includes(addon.key);
                        return (
                          <button
                            key={addon.key}
                            type="button"
                            onClick={() => {
                              const next = on ? enabled.filter(k => k !== addon.key) : [...enabled, addon.key];
                              patch(s.id, { addons: next });
                            }}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                              on
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-gray-300"}`} />
                            {addon.label} {on ? "· On" : "· Off"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setResetTarget(s); setNewPwd(""); setResetErr(""); setResetOk(false); }}>
                        <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Reset Password
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => copyText(s.adminEmail, `email-${s.id}`)}>
                        {copied === `email-${s.id}` ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                        Copy Admin Email
                      </Button>
                      {s.status !== "suspended" && (
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => { setSuspendTarget(s); setSuspendReason(s.notes ?? ""); }}>
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Suspend
                        </Button>
                      )}
                      {s.status === "suspended" && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => patch(s.id, { status: "active", notes: null })}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Reactivate
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 ml-auto"
                        onClick={() => deleteSchool(s.id, s.name)} disabled={deleting === s.id}>
                        {deleting === s.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        <span className="ml-1.5">Delete</span>
                      </Button>
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Edit — {editTarget.name}</h2>
              <button onClick={() => setEditTarget(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>School Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} />
              </div>
              <div><Label>Admin Email</Label>
                <Input type="email" value={editForm.adminEmail} onChange={e => setEditForm((f: any) => ({ ...f, adminEmail: e.target.value }))} />
              </div>
              <div><Label>Admin Name</Label>
                <Input value={editForm.adminName} onChange={e => setEditForm((f: any) => ({ ...f, adminName: e.target.value }))} />
              </div>
              <div><Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div><Label>Country</Label>
                <Input value={editForm.country} onChange={e => setEditForm((f: any) => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="sm:col-span-2"><Label>Address</Label>
                <Input value={editForm.address} onChange={e => setEditForm((f: any) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Custom Domain</Label>
                <Input value={editForm.customDomain} onChange={e => setEditForm((f: any) => ({ ...f, customDomain: e.target.value }))} placeholder="portal.schoolname.edu.gh (optional)" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Trial Ends</Label>
                <Input type="date" value={editForm.trialEndsAt} onChange={e => setEditForm((f: any) => ({ ...f, trialEndsAt: e.target.value }))} />
              </div>
              <div>
                <Label className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Billing Cycle</Label>
                <select className={SEL} value={editForm.billingCycle} onChange={e => setEditForm((f: any) => ({ ...f, billingCycle: e.target.value }))}>
                  <option value="">— None —</option>
                  {BILLING_CYCLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Subscription Start</Label>
                <Input type="date" value={editForm.subscriptionStartsAt} onChange={e => setEditForm((f: any) => ({ ...f, subscriptionStartsAt: e.target.value }))} />
              </div>
              <div>
                <Label className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Subscription Ends</Label>
                <Input type="date" value={editForm.subscriptionEndsAt} onChange={e => setEditForm((f: any) => ({ ...f, subscriptionEndsAt: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label className="flex items-center gap-1"><StickyNote className="h-3.5 w-3.5" /> Notes</Label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  rows={3}
                  value={editForm.notes}
                  onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes about this school…"
                />
              </div>
              {editErr && <p className="sm:col-span-2 text-sm text-red-600">{editErr}</p>}
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={saveEdit} disabled={editSaving}>
                  {editSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Suspend Dialog ───────────────────────────────────────────────────── */}
      {suspendTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Suspend School</h2>
                <p className="text-xs text-gray-400">{suspendTarget.name}</p>
              </div>
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                rows={3}
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="Payment overdue, policy violation…"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmSuspend} disabled={suspending}>
                {suspending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1.5" />Suspend</>}
              </Button>
              <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Dialog ────────────────────────────────────────────── */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">Reset Admin Password</h2>
                  <p className="text-xs text-gray-400">{resetTarget.adminEmail}</p>
                </div>
              </div>
              <button onClick={() => setResetTarget(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            {resetOk ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Password updated successfully.
              </div>
            ) : (
              <>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" />
                </div>
                {resetErr && <p className="text-sm text-red-600">{resetErr}</p>}
                <div className="flex gap-2">
                  <Button onClick={confirmReset} disabled={resetting || !newPwd}>
                    {resetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Set Password"}
                  </Button>
                  <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Renew / Record Payment Dialog ────────────────────────────────────── */}
      {renewTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Repeat className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {renewTarget.billingCycle ? "Renew / Change Plan" : "Start Subscription"}
                  </h2>
                  <p className="text-xs text-gray-400">{renewTarget.name}</p>
                </div>
              </div>
              <button onClick={() => setRenewTarget(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>

            <div>
              <Label>Billing Cycle *</Label>
              <select className={SEL} value={renewForm.billingCycle} onChange={e => setRenewCycle(e.target.value)}>
                {BILLING_CYCLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                {renewForm.billingCycle === "lifetime"
                  ? "One-time payment — this tenant never needs to renew again."
                  : renewTarget.subscriptionEndsAt && new Date(renewTarget.subscriptionEndsAt) > new Date()
                    ? "Extends from the current renewal date."
                    : "Starts counting from today."}
              </p>
            </div>
            <div>
              <Label>Amount Paid (optional)</Label>
              <Input type="number" min="0" step="0.01" value={renewForm.amount}
                onChange={e => setRenewForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 600" />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input value={renewForm.note} onChange={e => setRenewForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Paid via Mobile Money" />
            </div>

            {renewErr && <p className="text-sm text-red-600">{renewErr}</p>}
            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmRenew} disabled={renewSaving}>
                {renewSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Confirm</>}
              </Button>
              <Button variant="outline" onClick={() => setRenewTarget(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
