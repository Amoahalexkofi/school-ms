"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bus, MapPin, Users, Plus, Pencil, Trash2 } from "lucide-react";

type Props = { vehicles: any[]; routes: any[]; pickupPoints: any[]; students: any[] };
type Tab = "vehicles" | "routes" | "points" | "students";

export function TransportClient({ vehicles, routes, pickupPoints, students }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("vehicles");

  const [vOpen, setVOpen] = useState(false);
  const [vForm, setVForm] = useState({ vehicleNo: "", vehicleModel: "", manufactureYear: "", driverName: "", driverContact: "", driverLicence: "" });
  const [vErr,  setVErr]  = useState(""); const [vLoad, setVLoad] = useState(false);

  const [rOpen, setROpen] = useState(false);
  const [rForm, setRForm] = useState({ title: "", vehicleId: "" });
  const [rErr,  setRErr]  = useState(""); const [rLoad, setRLoad] = useState(false);

  const [pOpen, setPOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pErr,  setPErr]  = useState(""); const [pLoad, setPLoad] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ studentId: "", routeId: "", pickupPointId: "" });
  const [assignErr,  setAssignErr]  = useState(""); const [assignLoad, setAssignLoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }
  async function del(url: string) {
    const res = await fetch(url, { method: "DELETE" }); if (!res.ok) throw new Error((await res.json()).error);
  }

  async function saveVehicle() {
    if (!vForm.vehicleNo.trim()) { setVErr("Vehicle number required"); return; }
    setVLoad(true); setVErr("");
    try { await post("/api/transport/vehicles", vForm); setVOpen(false); router.refresh(); }
    catch (e: any) { setVErr(e.message); } finally { setVLoad(false); }
  }
  async function saveRoute() {
    if (!rForm.title.trim()) { setRErr("Title required"); return; }
    setRLoad(true); setRErr("");
    try { await post("/api/transport/routes", rForm); setROpen(false); router.refresh(); }
    catch (e: any) { setRErr(e.message); } finally { setRLoad(false); }
  }
  async function savePoint() {
    if (!pName.trim()) { setPErr("Name required"); return; }
    setPLoad(true); setPErr("");
    try { await post("/api/transport/pickup-points", { name: pName }); setPOpen(false); router.refresh(); }
    catch (e: any) { setPErr(e.message); } finally { setPLoad(false); }
  }
  async function saveAssign() {
    if (!assignForm.studentId || !assignForm.routeId) { setAssignErr("Student and route required"); return; }
    setAssignLoad(true); setAssignErr("");
    try { await post("/api/transport/assign", assignForm); setAssignOpen(false); router.refresh(); }
    catch (e: any) { setAssignErr(e.message); } finally { setAssignLoad(false); }
  }

  const TABS = [
    { key: "vehicles" as Tab, label: "Vehicles",       icon: Bus },
    { key: "routes"   as Tab, label: "Routes",         icon: MapPin },
    { key: "points"   as Tab, label: "Pickup Points",  icon: MapPin },
    { key: "students" as Tab, label: "Student Assign", icon: Users },
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

      {/* ── Vehicles ── */}
      {tab === "vehicles" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setVForm({ vehicleNo: "", vehicleModel: "", manufactureYear: "", driverName: "", driverContact: "", driverLicence: "" }); setVErr(""); setVOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Vehicle
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Reg No.", "Model", "Year", "Driver", "Contact", "Licence"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No vehicles yet.</td></tr>
                : vehicles.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium">{v.vehicleNo}</td>
                    <td className="px-4 py-3 text-gray-600">{v.vehicleModel ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{v.manufactureYear ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{v.driverName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{v.driverContact ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{v.driverLicence ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Routes ── */}
      {tab === "routes" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{routes.length} route{routes.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setRForm({ title: "", vehicleId: "" }); setRErr(""); setROpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Route
            </Button>
          </div>
          <div className="space-y-3">
            {routes.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.vehicle?.vehicleNo ?? "No vehicle"} · {r._count.studentRoutes} students</p>
                    </div>
                  </div>
                  {r.routePickupPoints.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.routePickupPoints.map((rpp: any) => (
                        <span key={rpp.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                          {rpp.pickupPoint.name}{rpp.timing ? ` (${rpp.timing})` : ""}{rpp.fees ? ` · ₵${Number(rpp.fees).toLocaleString()}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {routes.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-gray-400">No routes yet.</CardContent></Card>}
          </div>
        </div>
      )}

      {/* ── Pickup Points ── */}
      {tab === "points" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{pickupPoints.length} pickup point{pickupPoints.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setPName(""); setPErr(""); setPOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Point
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pickupPoints.map((p: any) => (
              <Card key={p.id}><CardContent className="pt-4 text-sm font-medium text-gray-800">{p.name}</CardContent></Card>
            ))}
            {pickupPoints.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-6">No pickup points yet.</p>}
          </div>
        </div>
      )}

      {/* ── Student Assignment ── */}
      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{students.filter((s: any) => s.transportRoute).length} students assigned</p>
            <Button onClick={() => { setAssignForm({ studentId: "", routeId: "", pickupPointId: "" }); setAssignErr(""); setAssignOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Assign Student
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Student", "Adm No.", "Route", "Pickup Point"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {students.filter((s: any) => s.transportRoute).map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                    <td className="px-4 py-3 text-gray-600">{s.transportRoute?.route?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.transportRoute?.pickupPoint?.name ?? "—"}</td>
                  </tr>
                ))}
                {!students.some((s: any) => s.transportRoute) && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">No students assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={vOpen} onOpenChange={o => !o && setVOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[["Vehicle Reg No. *","vehicleNo"],["Model","vehicleModel"],["Year","manufactureYear"],["Driver Name","driverName"],["Driver Contact","driverContact"],["Licence No.","driverLicence"]].map(([label, key]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <Input value={(vForm as any)[key]} onChange={e => setVForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {vErr && <p className="text-sm text-red-600 mt-1">{vErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setVOpen(false)}>Cancel</Button><Button disabled={vLoad} onClick={saveVehicle}>{vLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={rOpen} onOpenChange={o => !o && setROpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Route</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><Input value={rForm.title} onChange={e => setRForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rForm.vehicleId} onChange={e => setRForm(f => ({ ...f, vehicleId: e.target.value }))}>
                <option value="">— None —</option>
                {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.vehicleNo} {v.vehicleModel ? `(${v.vehicleModel})` : ""}</option>)}
              </select>
            </div>
          </div>
          {rErr && <p className="text-sm text-red-600">{rErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setROpen(false)}>Cancel</Button><Button disabled={rLoad} onClick={saveRoute}>{rLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={pOpen} onOpenChange={o => !o && setPOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Pickup Point</DialogTitle></DialogHeader>
          <Input value={pName} onChange={e => setPName(e.target.value)} placeholder="Pickup point name" onKeyDown={e => e.key === "Enter" && savePoint()} />
          {pErr && <p className="text-sm text-red-600">{pErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPOpen(false)}>Cancel</Button><Button disabled={pLoad} onClick={savePoint}>{pLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={o => !o && setAssignOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Student to Route</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[["Student *","studentId", students.map((s: any) => ({ v: s.id, l: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))],
              ["Route *","routeId", routes.map((r: any) => ({ v: r.id, l: r.title }))],
              ["Pickup Point","pickupPointId", pickupPoints.map((p: any) => ({ v: p.id, l: p.name }))],
            ].map(([label, key, opts]: any) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={(assignForm as any)[key]} onChange={e => setAssignForm(f => ({ ...f, [key]: e.target.value }))}>
                  <option value="">— Select —</option>
                  {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}
          </div>
          {assignErr && <p className="text-sm text-red-600">{assignErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button disabled={assignLoad} onClick={saveAssign}>{assignLoad ? "Saving…" : "Assign"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
