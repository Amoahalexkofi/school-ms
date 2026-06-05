"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, MapPin, Users, Plus, X } from "lucide-react";

type Props = { vehicles: any[]; routes: any[]; pickupPoints: any[]; students: any[] };
type Tab = "vehicles" | "routes" | "points" | "students";
type Panel = "point" | "assign" | null;

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export function TransportClient({ vehicles, routes, pickupPoints, students }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("vehicles");
  const [panel, setPanel] = useState<Panel>(null);

  // Pickup point panel
  const [pName, setPName] = useState("");
  const [pLoad, setPLoad] = useState(false);

  // Assign student panel
  const [assignForm, setAssignForm] = useState({ studentId: "", routeId: "", pickupPointId: "" });
  const [assignLoad, setAssignLoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }

  async function savePoint() {
    if (!pName.trim()) { alert("Name required"); return; }
    setPLoad(true);
    try {
      await post("/api/transport/pickup-points", { name: pName });
      setPName("");
      setPanel(null);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setPLoad(false); }
  }

  async function saveAssign() {
    if (!assignForm.studentId || !assignForm.routeId) { alert("Student and route required"); return; }
    setAssignLoad(true);
    try {
      await post("/api/transport/assign", assignForm);
      setAssignForm({ studentId: "", routeId: "", pickupPointId: "" });
      setPanel(null);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setAssignLoad(false); }
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
            <Link href="/transport/vehicles/new">
              <Button><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
            </Link>
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
            <Link href="/transport/routes/new">
              <Button><Plus className="h-4 w-4 mr-1.5" /> Add Route</Button>
            </Link>
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
            <Button onClick={() => { setPName(""); setPanel(panel === "point" ? null : "point"); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Point
            </Button>
          </div>

          {/* Inline Pickup Point Panel */}
          {panel === "point" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Add Pickup Point</h3>
                <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <Input value={pName} onChange={e => setPName(e.target.value)} placeholder="Pickup point name" onKeyDown={e => e.key === "Enter" && savePoint()} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={pLoad} onClick={savePoint}>{pLoad ? "Saving…" : "Add"}</Button>
              </div>
            </div>
          )}

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
            <Button onClick={() => { setAssignForm({ studentId: "", routeId: "", pickupPointId: "" }); setPanel(panel === "assign" ? null : "assign"); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Assign Student
            </Button>
          </div>

          {/* Inline Assign Panel */}
          {panel === "assign" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Assign Student to Route</h3>
                <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Student *", "studentId", students.map((s: any) => ({ v: s.id, l: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))],
                  ["Route *", "routeId", routes.map((r: any) => ({ v: r.id, l: r.title }))],
                  ["Pickup Point", "pickupPointId", pickupPoints.map((p: any) => ({ v: p.id, l: p.name }))],
                ].map(([label, key, opts]: any) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select className={SEL} value={(assignForm as any)[key]} onChange={e => setAssignForm(f => ({ ...f, [key]: e.target.value }))}>
                      <option value="">— Select —</option>
                      {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={assignLoad} onClick={saveAssign}>{assignLoad ? "Saving…" : "Assign"}</Button>
              </div>
            </div>
          )}

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
    </main>
  );
}
