"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, UserCheck, X, Pencil, Trash2, Send, Inbox } from "lucide-react";

type Props = { purposes: any[]; visitors: any[]; complaintTypes: any[]; complaints: any[]; enquiries: any[]; dispatches: any[] };
type Tab = "visitors" | "complaints" | "enquiries" | "complaint-types" | "dispatch";

const COMPLAINT_STATUS_STYLE: Record<string, string> = {
  OPEN:        "bg-red-500/10 text-red-400",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400",
  RESOLVED:    "bg-emerald-500/10 text-emerald-400",
};
const ENQ_STATUS_STYLE: Record<string, string> = {
  NEW:       "bg-blue-500/10 text-blue-400",
  CONTACTED: "bg-amber-500/10 text-amber-400",
  CONVERTED: "bg-emerald-500/10 text-emerald-400",
  CLOSED:    "bg-white/[0.04] text-white/50",
};

export function FrontOfficeClient({ purposes, visitors, complaintTypes: initTypes, complaints, enquiries, dispatches: initialDispatches }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("visitors");
  const [checkedOut, setCheckedOut] = useState<string | null>(null);

  // Dispatch state
  const [dispatches,    setDispatches]    = useState(initialDispatches);
  const [dispPanel,     setDispPanel]     = useState(false);
  const [dispType,      setDispType]      = useState("incoming");
  const [dispTitle,     setDispTitle]     = useState("");
  const [dispRefNo,     setDispRefNo]     = useState("");
  const [dispFromTo,    setDispFromTo]    = useState("");
  const [dispAddress,   setDispAddress]   = useState("");
  const [dispNote,      setDispNote]      = useState("");
  const [dispDate,      setDispDate]      = useState(new Date().toISOString().slice(0, 10));
  const [dispLoad,      setDispLoad]      = useState(false);
  const [dispErr,       setDispErr]       = useState("");
  const [dispFilter,    setDispFilter]    = useState<"all" | "incoming" | "outgoing">("all");

  // Complaint types state
  const [types, setTypes]         = useState(initTypes);
  const [typePanel, setTypePanel] = useState(false);
  const [typeEdit, setTypeEdit]   = useState<any>(null);
  const [typeName, setTypeName]   = useState("");
  const [typeLoad, setTypeLoad]   = useState(false);
  const [typeErr,  setTypeErr]    = useState("");

  // Enquiry follow-up state
  const [followUpId,   setFollowUpId]   = useState<string | null>(null);
  const [followNote,   setFollowNote]   = useState("");
  const [followDate,   setFollowDate]   = useState("");
  const [followLoad,   setFollowLoad]   = useState(false);

  async function patch(url: string, body: object) {
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }
  async function del(url: string) {
    const res = await fetch(url, { method: "DELETE" }); if (!res.ok) throw new Error("Failed");
  }

  async function checkout(id: string) {
    setCheckedOut(id);
    await patch(`/api/front-office/visitors/${id}`, { outTime: new Date().toISOString() });
    router.refresh(); setCheckedOut(null);
  }

  async function updateComplaintStatus(id: string, status: string) {
    await patch(`/api/front-office/complaints/${id}`, { status });
    router.refresh();
  }

  async function updateEnquiryStatus(id: string, status: string) {
    await patch(`/api/front-office/enquiries/${id}`, { status });
    router.refresh();
  }

  async function saveFollowUp(enquiryId: string) {
    setFollowLoad(true);
    try {
      await patch(`/api/front-office/enquiries/${enquiryId}`, {
        status: "CONTACTED",
        followUpNote: followNote || null,
        nextFollowUp: followDate ? new Date(followDate).toISOString() : null,
      });
      setFollowUpId(null); router.refresh();
    } finally { setFollowLoad(false); }
  }

  // Complaint type CRUD
  async function saveType() {
    if (!typeName.trim()) { setTypeErr("Name required"); return; }
    setTypeLoad(true); setTypeErr("");
    try {
      if (typeEdit) {
        const updated = await patch(`/api/front-office/complaint-types/${typeEdit.id}`, { name: typeName });
        setTypes(t => t.map(x => x.id === typeEdit.id ? updated : x));
      } else {
        const res = await fetch("/api/front-office/complaint-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: typeName }) });
        const created = await res.json();
        setTypes(t => [...t, created]);
      }
      setTypePanel(false); setTypeEdit(null); setTypeName("");
    } catch (e: any) { setTypeErr(e.message); }
    finally { setTypeLoad(false); }
  }
  async function deleteType(id: string) {
    if (!confirm("Delete this complaint type?")) return;
    try { await del(`/api/front-office/complaint-types/${id}`); setTypes(t => t.filter(x => x.id !== id)); }
    catch { alert("Failed to delete"); }
  }

  // Dispatch CRUD
  async function saveDispatch() {
    if (!dispTitle.trim() || !dispDate) { setDispErr("Title and date are required"); return; }
    setDispLoad(true); setDispErr("");
    try {
      const res = await fetch("/api/front-office/dispatch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: dispType, title: dispTitle, refNo: dispRefNo || null,
          fromTo: dispFromTo || null, address: dispAddress || null,
          note: dispNote || null, date: dispDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDispatches(ds => [data, ...ds]);
      setDispPanel(false);
      setDispTitle(""); setDispRefNo(""); setDispFromTo(""); setDispAddress(""); setDispNote("");
      setDispDate(new Date().toISOString().slice(0, 10));
    } catch (e: any) { setDispErr(e.message); }
    finally { setDispLoad(false); }
  }

  const TABS = [
    { key: "visitors"        as Tab, label: `Visitors (${visitors.filter(v => !v.outTime).length} in)` },
    { key: "complaints"      as Tab, label: `Complaints (${complaints.filter(c => c.status === "OPEN").length} open)` },
    { key: "enquiries"       as Tab, label: `Enquiries (${enquiries.filter(e => e.status === "NEW").length} new)` },
    { key: "dispatch"        as Tab, label: `Dispatch (${dispatches.length})` },
    { key: "complaint-types" as Tab, label: "Complaint Types" },
  ];

  return (
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">
      <div className="flex flex-wrap gap-1 bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-white/50 hover:bg-white/[0.04]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Visitors ── */}
      {tab === "visitors" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{visitors.length} visitor{visitors.length !== 1 ? "s" : ""} today</p>
            <Link href="/front-office/visitors/new"><Button><Plus className="h-4 w-4 mr-1.5" />Log Visitor</Button></Link>
          </div>
          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Visitor","Phone","Purpose","Host","# Visitors","In","Out",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {visitors.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-white/30">No visitors today.</td></tr>
                : visitors.map((v: any) => (
                  <tr key={v.id} className={`hover:bg-[#0f1015] ${!v.outTime ? "bg-blue-500/10/20" : ""}`}>
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-white/40">{v.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{v.purpose?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/40">{v.host ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{v.numVisitors}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{new Date(v.inTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{v.outTime ? new Date(v.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="text-blue-400">In</span>}</td>
                    <td className="px-4 py-3">
                      {!v.outTime && <Button size="sm" variant="outline" disabled={checkedOut === v.id} onClick={() => checkout(v.id)}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />{checkedOut === v.id ? "…" : "Check Out"}
                      </Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Complaints ── */}
      {tab === "complaints" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{complaints.length} complaint{complaints.length !== 1 ? "s" : ""}</p>
            <Link href="/front-office/complaints/new"><Button><Plus className="h-4 w-4 mr-1.5" />Add Complaint</Button></Link>
          </div>
          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Title","Type","Raised By","Date","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {complaints.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-white/30">No complaints.</td></tr>
                : complaints.map((c: any) => (
                  <tr key={c.id} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.title}</td>
                    <td className="px-4 py-3 text-white/40">{c.complaintType?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50">{c.raisedBy}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COMPLAINT_STATUS_STYLE[c.status]}`}>{c.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3">
                      {c.status === "OPEN"        && <Button size="sm" variant="outline" onClick={() => updateComplaintStatus(c.id, "IN_PROGRESS")}>In Progress</Button>}
                      {c.status === "IN_PROGRESS" && <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20" onClick={() => updateComplaintStatus(c.id, "RESOLVED")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Resolve</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Enquiries ── */}
      {tab === "enquiries" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{enquiries.length} enqu{enquiries.length !== 1 ? "iries" : "iry"}</p>
            <Link href="/front-office/enquiries/new"><Button><Plus className="h-4 w-4 mr-1.5" />Add Enquiry</Button></Link>
          </div>

          {/* Follow-up inline form */}
          {followUpId && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-amber-300">Log Follow-Up</p>
                <button onClick={() => setFollowUpId(null)}><X className="h-4 w-4 text-white/30" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Follow-up Note</Label>
                  <Input value={followNote} onChange={e => setFollowNote(e.target.value)} placeholder="What was discussed…" />
                </div>
                <div>
                  <Label className="text-xs">Next Follow-up Date</Label>
                  <Input type="date" value={followDate} onChange={e => setFollowDate(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={followLoad} onClick={() => saveFollowUp(followUpId)}>{followLoad ? "Saving…" : "Save & Mark Contacted"}</Button>
                <Button size="sm" variant="outline" onClick={() => setFollowUpId(null)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Name","Phone","Description","Next Follow-up","Follow-up Note","Date","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50 text-xs">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {enquiries.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-white/30">No enquiries.</td></tr>
                : enquiries.map((e: any) => (
                  <tr key={e.id} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{e.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-white/40 max-w-[160px] truncate text-xs">{e.description ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-amber-400">{e.nextFollowUp ? new Date(e.nextFollowUp).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[160px] truncate">{e.followUpNote ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENQ_STATUS_STYLE[e.status]}`}>{e.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {e.status === "NEW"       && <Button size="sm" variant="outline" onClick={() => { setFollowUpId(e.id); setFollowNote(e.followUpNote ?? ""); setFollowDate(e.nextFollowUp ? new Date(e.nextFollowUp).toISOString().slice(0,10) : ""); }}>Follow Up</Button>}
                        {e.status === "CONTACTED" && <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20" onClick={() => updateEnquiryStatus(e.id, "CONVERTED")}>Converted</Button>}
                        {(e.status === "NEW" || e.status === "CONTACTED") && <Button size="sm" variant="ghost" onClick={() => updateEnquiryStatus(e.id, "CLOSED")} className="text-white/30">Close</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dispatch ── */}
      {tab === "dispatch" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              {(["all", "incoming", "outgoing"] as const).map(f => (
                <button key={f} onClick={() => setDispFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dispFilter === f ? "bg-blue-600 text-white" : "bg-[#111318] border border-white/[0.06] text-white/50 hover:bg-[#0f1015]"}`}>
                  {f === "all" ? "All" : f === "incoming" ? "Incoming" : "Outgoing"}
                </button>
              ))}
            </div>
            <Button onClick={() => { setDispPanel(true); setDispErr(""); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Record
            </Button>
          </div>

          {dispPanel && (
            <div className="bg-[#111318] rounded-xl border border-blue-500/20 p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-300">New Dispatch Record</p>
                <button onClick={() => setDispPanel(false)}><X className="h-4 w-4 text-white/30" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Type *</label>
                  <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dispType} onChange={e => setDispType(e.target.value)}>
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Title *</label>
                  <Input value={dispTitle} onChange={e => setDispTitle(e.target.value)} placeholder="e.g. Letter from Ministry" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Reference No.</label>
                  <Input value={dispRefNo} onChange={e => setDispRefNo(e.target.value)} placeholder="e.g. MOE/2026/001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">{dispType === "incoming" ? "From" : "To"}</label>
                  <Input value={dispFromTo} onChange={e => setDispFromTo(e.target.value)} placeholder={dispType === "incoming" ? "Sender name / organization" : "Recipient name / organization"} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Date *</label>
                  <input type="date" value={dispDate} onChange={e => setDispDate(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Note</label>
                  <Input value={dispNote} onChange={e => setDispNote(e.target.value)} placeholder="Optional note" />
                </div>
              </div>
              {dispErr && <p className="text-sm text-red-400">{dispErr}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDispPanel(false)}>Cancel</Button>
                <Button disabled={dispLoad} onClick={saveDispatch}>{dispLoad ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          )}

          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Type","Title","Ref No.","From / To","Date","Note"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50 text-xs">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {dispatches.filter(d => dispFilter === "all" || d.type === dispFilter).length === 0
                  ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-white/30">No dispatch records.</td></tr>
                  : dispatches
                      .filter(d => dispFilter === "all" || d.type === dispFilter)
                      .map((d: any) => (
                    <tr key={d.id} className="hover:bg-[#0f1015]">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${d.type === "incoming" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {d.type === "incoming" ? <Inbox className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                          {d.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-white/80 max-w-[200px] truncate">{d.title}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/40">{d.refNo ?? "—"}</td>
                      <td className="px-4 py-3 text-white/50 max-w-[150px] truncate">{d.fromTo ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/40">{new Date(d.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-white/30 max-w-[200px] truncate">{d.note ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Complaint Types ── */}
      {tab === "complaint-types" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{types.length} type{types.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setTypeName(""); setTypeEdit(null); setTypeErr(""); setTypePanel(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Type
            </Button>
          </div>

          {typePanel && (
            <div className="bg-[#111318] rounded-xl border border-blue-500/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-300">{typeEdit ? "Edit Type" : "New Complaint Type"}</p>
                <button onClick={() => setTypePanel(false)}><X className="h-4 w-4 text-white/30" /></button>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label>Name *</Label>
                  <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Infrastructure, Academic" />
                </div>
                <Button disabled={typeLoad} onClick={saveType}>{typeLoad ? "Saving…" : "Save"}</Button>
                <Button variant="outline" onClick={() => setTypePanel(false)}>Cancel</Button>
              </div>
              {typeErr && <p className="text-sm text-red-400">{typeErr}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {types.length === 0
              ? <p className="text-sm text-white/30 col-span-3 text-center py-8">No complaint types yet. Add one above.</p>
              : types.map((t: any) => (
                <div key={t.id} className="bg-[#111318] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between">
                  <p className="font-medium text-white/70">{t.name}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setTypeName(t.name); setTypeEdit(t); setTypeErr(""); setTypePanel(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteType(t.id)} className="text-red-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

    </main>
  );
}
