"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CheckCircle2, Clock, UserCheck } from "lucide-react";

type Props = { purposes: any[]; visitors: any[]; complaintTypes: any[]; complaints: any[]; enquiries: any[] };
type Tab = "visitors" | "complaints" | "enquiries";

const COMPLAINT_STATUS_STYLE: Record<string, string> = {
  OPEN:        "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED:    "bg-green-100 text-green-700",
};
const ENQ_STATUS_STYLE: Record<string, string> = {
  NEW:       "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  CONVERTED: "bg-green-100 text-green-700",
  CLOSED:    "bg-gray-100 text-gray-600",
};

export function FrontOfficeClient({ purposes, visitors, complaintTypes, complaints, enquiries }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("visitors");

  // Visitor state
  const [vOpen, setVOpen] = useState(false);
  const [vForm, setVForm] = useState({ name: "", phone: "", purposeId: "", host: "", numVisitors: "1", idProof: "", note: "" });
  const [vErr, setVErr] = useState(""); const [vLoad, setVLoad] = useState(false);
  const [checkedOut, setCheckedOut] = useState<string | null>(null);

  // Complaint state
  const [cOpen, setCOpen] = useState(false);
  const [cForm, setCForm] = useState({ title: "", raisedBy: "", phone: "", complaintTypeId: "", description: "" });
  const [cErr, setCErr] = useState(""); const [cLoad, setCLoad] = useState(false);

  // Enquiry state
  const [eOpen, setEOpen] = useState(false);
  const [eForm, setEForm] = useState({ name: "", phone: "", email: "", classId: "", description: "", note: "" });
  const [eErr, setEErr] = useState(""); const [eLoad, setELoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }
  async function patch(url: string, body: object) {
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }

  async function logVisitor() {
    if (!vForm.name.trim()) { setVErr("Name required"); return; }
    setVLoad(true); setVErr("");
    try { await post("/api/front-office/visitors", vForm); setVOpen(false); router.refresh(); }
    catch (e: any) { setVErr(e.message); } finally { setVLoad(false); }
  }

  async function checkout(id: string) {
    setCheckedOut(id);
    await patch(`/api/front-office/visitors/${id}`, { outTime: new Date().toISOString() });
    router.refresh(); setCheckedOut(null);
  }

  async function logComplaint() {
    if (!cForm.title.trim() || !cForm.raisedBy.trim() || !cForm.description.trim()) { setCErr("Title, raised by, and description required"); return; }
    setCLoad(true); setCErr("");
    try { await post("/api/front-office/complaints", cForm); setCOpen(false); router.refresh(); }
    catch (e: any) { setCErr(e.message); } finally { setCLoad(false); }
  }

  async function updateComplaintStatus(id: string, status: string) {
    await patch(`/api/front-office/complaints/${id}`, { status });
    router.refresh();
  }

  async function logEnquiry() {
    if (!eForm.name.trim()) { setEErr("Name required"); return; }
    setELoad(true); setEErr("");
    try { await post("/api/front-office/enquiries", eForm); setEOpen(false); router.refresh(); }
    catch (e: any) { setEErr(e.message); } finally { setELoad(false); }
  }

  async function updateEnquiryStatus(id: string, status: string) {
    await patch(`/api/front-office/enquiries/${id}`, { status });
    router.refresh();
  }

  const TABS = [
    { key: "visitors"   as Tab, label: `Visitors (${visitors.filter(v => !v.outTime).length} in)` },
    { key: "complaints" as Tab, label: `Complaints (${complaints.filter(c => c.status === "OPEN").length} open)` },
    { key: "enquiries"  as Tab, label: `Enquiries (${enquiries.filter(e => e.status === "NEW").length} new)` },
  ];

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Visitors ── */}
      {tab === "visitors" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{visitors.length} visitor{visitors.length !== 1 ? "s" : ""} today</p>
            <Button onClick={() => { setVForm({ name: "", phone: "", purposeId: "", host: "", numVisitors: "1", idProof: "", note: "" }); setVErr(""); setVOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Log Visitor
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Visitor","Phone","Purpose","Host","# Visitors","In","Out",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {visitors.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No visitors today.</td></tr>
                : visitors.map((v: any) => (
                  <tr key={v.id} className={`hover:bg-gray-50 ${!v.outTime ? "bg-blue-50/20" : ""}`}>
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-500">{v.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{v.purpose?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{v.host ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{v.numVisitors}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(v.inTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{v.outTime ? new Date(v.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : <span className="text-blue-600">In</span>}</td>
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
            <p className="text-sm text-gray-500">{complaints.length} complaint{complaints.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setCForm({ title: "", raisedBy: "", phone: "", complaintTypeId: "", description: "" }); setCErr(""); setCOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Add Complaint
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Title","Type","Raised By","Date","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {complaints.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No complaints.</td></tr>
                : complaints.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-500">{c.complaintType?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.raisedBy}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COMPLAINT_STATUS_STYLE[c.status]}`}>{c.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3">
                      {c.status === "OPEN" && <Button size="sm" variant="outline" onClick={() => updateComplaintStatus(c.id, "IN_PROGRESS")}>In Progress</Button>}
                      {c.status === "IN_PROGRESS" && <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => updateComplaintStatus(c.id, "RESOLVED")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Resolve</Button>}
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
            <p className="text-sm text-gray-500">{enquiries.length} enqu{enquiries.length !== 1 ? "iries" : "iry"}</p>
            <Button onClick={() => { setEForm({ name: "", phone: "", email: "", classId: "", description: "", note: "" }); setEErr(""); setEOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Add Enquiry
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Name","Phone","Email","Description","Date","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {enquiries.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No enquiries.</td></tr>
                : enquiries.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 text-gray-500">{e.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs">{e.description ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENQ_STATUS_STYLE[e.status]}`}>{e.status}</span></td>
                    <td className="px-4 py-3">
                      {e.status === "NEW"       && <Button size="sm" variant="outline" onClick={() => updateEnquiryStatus(e.id, "CONTACTED")}>Contacted</Button>}
                      {e.status === "CONTACTED" && <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => updateEnquiryStatus(e.id, "CONVERTED")}>Converted</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Visitor Dialog */}
      <Dialog open={vOpen} onOpenChange={o => !o && setVOpen(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Log Visitor</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[["Visitor Name *","name"],["Phone","phone"],["Host / Person to See","host"],["ID Proof","idProof"]].map(([l, k]) => (
            <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><Input value={(vForm as any)[k]} onChange={e => setVForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={vForm.purposeId} onChange={e => setVForm(f => ({ ...f, purposeId: e.target.value }))}>
              <option value="">— None —</option>
              {purposes.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">No. of Visitors</label><Input type="number" min="1" value={vForm.numVisitors} onChange={e => setVForm(f => ({ ...f, numVisitors: e.target.value }))} /></div>
        </div>
        {vErr && <p className="text-sm text-red-600 mt-1">{vErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setVOpen(false)}>Cancel</Button><Button disabled={vLoad} onClick={logVisitor}>{vLoad ? "Saving…" : "Log Visitor"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Add Complaint Dialog */}
      <Dialog open={cOpen} onOpenChange={o => !o && setCOpen(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Complaint</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {[["Title *","title"],["Raised By *","raisedBy"],["Phone","phone"]].map(([l, k]) => (
            <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><Input value={(cForm as any)[k]} onChange={e => setCForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cForm.complaintTypeId} onChange={e => setCForm(f => ({ ...f, complaintTypeId: e.target.value }))}>
              <option value="">— None —</option>
              {complaintTypes.map((ct: any) => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cForm.description} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
        {cErr && <p className="text-sm text-red-600">{cErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCOpen(false)}>Cancel</Button><Button disabled={cLoad} onClick={logComplaint}>{cLoad ? "Saving…" : "Submit"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Add Enquiry Dialog */}
      <Dialog open={eOpen} onOpenChange={o => !o && setEOpen(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Enquiry</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[["Name *","name"],["Phone","phone"],["Email","email"],["Note","note"]].map(([l, k]) => (
            <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><Input value={(eForm as any)[k]} onChange={e => setEForm(f => ({ ...f, [k]: e.target.value }))} /></div>
          ))}
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={eForm.description} onChange={e => setEForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
        {eErr && <p className="text-sm text-red-600">{eErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEOpen(false)}>Cancel</Button><Button disabled={eLoad} onClick={logEnquiry}>{eLoad ? "Saving…" : "Submit"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
