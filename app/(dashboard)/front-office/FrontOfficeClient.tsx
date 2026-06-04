"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, MessageSquare, ClipboardList, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

const complaintStatusColor: Record<string, string> = { OPEN: "bg-red-100 text-red-700", IN_PROGRESS: "bg-yellow-100 text-yellow-700", RESOLVED: "bg-green-100 text-green-700" };
const enquiryStatusColor: Record<string, string> = { NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-purple-100 text-purple-700", CONVERTED: "bg-green-100 text-green-700", CLOSED: "bg-gray-100 text-gray-600" };

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
  return res.json();
}

export function FrontOfficeClient({ visitorsToday, allVisitors, complaints, enquiries }: any) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visitorForm, setVisitorForm] = useState({ name: "", phone: "", purpose: "", host: "" });
  const [complaintForm, setComplaintForm] = useState({ title: "", description: "", raisedBy: "" });
  const [enquiryForm, setEnquiryForm] = useState({ name: "", phone: "", email: "", message: "" });

  async function submit(url: string, body: object) {
    setLoading(true); setError("");
    try { await post(url, body); setOpen(null); router.refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function checkout(id: string) {
    setLoading(true);
    try { await post(`/api/front-office/visitors/${id}/checkout`, {}); router.refresh(); }
    catch (e: any) { alert((e as Error).message); }
    finally { setLoading(false); }
  }

  async function updateStatus(type: "complaint" | "enquiry", id: string, status: string) {
    const url = type === "complaint" ? "/api/front-office/complaints" : "/api/front-office/enquiries";
    await submit(url, { action: "updateStatus", id, status });
  }

  const openComplaints = complaints.filter((c: any) => c.status !== "RESOLVED").length;
  const newEnquiries = enquiries.filter((e: any) => e.status === "NEW").length;

  return (
    <main className="flex-1 p-6 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Visitors Today</p><p className="text-3xl font-bold">{visitorsToday}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Visitors</p><p className="text-3xl font-bold">{allVisitors.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Open Complaints</p><p className={`text-3xl font-bold ${openComplaints > 0 ? "text-red-600" : "text-gray-800"}`}>{openComplaints}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">New Enquiries</p><p className={`text-3xl font-bold ${newEnquiries > 0 ? "text-blue-600" : "text-gray-800"}`}>{newEnquiries}</p></CardContent></Card>
      </div>

      {/* Visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Visitor Log</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("visitor"); }}><Plus className="h-4 w-4 mr-1" /> Log Visitor</Button>
        </CardHeader>
        <CardContent>
          {allVisitors.length === 0 ? <p className="text-sm text-gray-500 text-center py-6">No visitors yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Purpose</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">In</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Out</th>
                  <th className="px-3 py-2"></th>
                </tr></thead>
                <tbody className="divide-y">
                  {allVisitors.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium">{v.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{v.purpose}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{new Date(v.inTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{v.outTime ? new Date(v.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-3 py-2.5">
                        {!v.outTime && <Button size="sm" variant="outline" disabled={loading} onClick={() => checkout(v.id)}>Check Out</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-red-500" /> Complaints</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("complaint"); }}><Plus className="h-4 w-4 mr-1" /> New</Button>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? <p className="text-sm text-gray-500 text-center py-6">No complaints.</p> : (
            <div className="space-y-3">
              {complaints.map((c: any) => (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">By: {c.raisedBy}</p>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${complaintStatusColor[c.status]}`}>{c.status.replace("_", " ")}</span>
                      {c.status === "OPEN" && <Button size="sm" variant="outline" onClick={() => updateStatus("complaint", c.id, "IN_PROGRESS")}>Start</Button>}
                      {c.status === "IN_PROGRESS" && <Button size="sm" variant="outline" onClick={() => updateStatus("complaint", c.id, "RESOLVED")}>Resolve</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enquiries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-600" /> Enquiries</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("enquiry"); }}><Plus className="h-4 w-4 mr-1" /> New</Button>
        </CardHeader>
        <CardContent>
          {enquiries.length === 0 ? <p className="text-sm text-gray-500 text-center py-6">No enquiries.</p> : (
            <div className="space-y-3">
              {enquiries.map((e: any) => (
                <div key={e.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{e.name}</p>
                      <div className="flex gap-3 text-xs text-gray-500">{e.phone && <span>{e.phone}</span>}{e.email && <span>{e.email}</span>}</div>
                      <p className="text-sm text-gray-600 mt-1">{e.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${enquiryStatusColor[e.status]}`}>{e.status}</span>
                      {e.status === "NEW" && <Button size="sm" variant="outline" onClick={() => updateStatus("enquiry", e.id, "CONTACTED")}>Contact</Button>}
                      {e.status === "CONTACTED" && <Button size="sm" variant="outline" onClick={() => updateStatus("enquiry", e.id, "CONVERTED")}>Convert</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Visitor */}
      <Dialog open={open === "visitor"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Visitor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input className="mt-1" value={visitorForm.name} onChange={e => setVisitorForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={visitorForm.phone} onChange={e => setVisitorForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Purpose *</Label><Input className="mt-1" value={visitorForm.purpose} onChange={e => setVisitorForm(f => ({ ...f, purpose: e.target.value }))} /></div>
            <div><Label>Visiting</Label><Input className="mt-1" placeholder="Staff/department name" value={visitorForm.host} onChange={e => setVisitorForm(f => ({ ...f, host: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/front-office/visitors", visitorForm)}>{loading ? "Logging…" : "Log Visitor"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Complaint */}
      <Dialog open={open === "complaint"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input className="mt-1" value={complaintForm.title} onChange={e => setComplaintForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Raised By *</Label><Input className="mt-1" value={complaintForm.raisedBy} onChange={e => setComplaintForm(f => ({ ...f, raisedBy: e.target.value }))} /></div>
            <div><Label>Description *</Label><textarea className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} value={complaintForm.description} onChange={e => setComplaintForm(f => ({ ...f, description: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/front-office/complaints", complaintForm)}>{loading ? "Submitting…" : "Submit Complaint"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Enquiry */}
      <Dialog open={open === "enquiry"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Enquiry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input className="mt-1" value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input className="mt-1" type="email" value={enquiryForm.email} onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Message *</Label><textarea className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/front-office/enquiries", enquiryForm)}>{loading ? "Submitting…" : "Submit Enquiry"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
