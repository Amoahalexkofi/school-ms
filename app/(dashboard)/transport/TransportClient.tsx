"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, MapPin, Users, Plus, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

type Props = { vehicles: any[]; routes: any[]; pickupPoints: any[]; students: any[] };
type Tab = "vehicles" | "routes" | "points" | "students";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

export function TransportClient({ vehicles, routes: initialRoutes, pickupPoints: initialPoints, students: initialStudents }: Props) {
  const router = useRouter();
  const perm = usePermission("transport");
  const [tab, setTab] = useState<Tab>("vehicles");

  // Local copies so we can optimistically update without full page refresh
  const [routes, setRoutes] = useState(initialRoutes);
  const [pickupPoints, setPickupPoints] = useState(initialPoints);
  const [students, setStudents] = useState(initialStudents);

  // Routes tab — which route is expanded
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({ pickupPointId: "", timing: "", fees: "" });
  const [stopLoading, setStopLoading] = useState(false);

  // Pickup Points tab — add form
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [pName, setPName] = useState("");
  const [pLoad, setPLoad] = useState(false);

  // Student assign
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ studentId: "", routeId: "", pickupPointId: "" });
  const [assignLoad, setAssignLoad] = useState(false);

  async function api(method: string, url: string, body?: object) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error ?? "Failed");
    return d;
  }

  // ── Stop management ──────────────────────────────────────────────────────

  async function addStop(routeId: string) {
    if (!stopForm.pickupPointId) { alert("Select a pickup point"); return; }
    setStopLoading(true);
    try {
      const rpp = await api("POST", `/api/transport/routes/${routeId}/pickup-points`, stopForm);
      setRoutes(rs => rs.map(r => r.id === routeId
        ? { ...r, routePickupPoints: [...r.routePickupPoints, rpp] }
        : r
      ));
      setStopForm({ pickupPointId: "", timing: "", fees: "" });
    } catch (e: any) { alert(e.message); }
    finally { setStopLoading(false); }
  }

  async function removeStop(routeId: string, rppId: string) {
    if (!confirm("Remove this stop?")) return;
    try {
      await api("DELETE", `/api/transport/route-stops/${rppId}`);
      setRoutes(rs => rs.map(r => r.id === routeId
        ? { ...r, routePickupPoints: r.routePickupPoints.filter((s: any) => s.id !== rppId) }
        : r
      ));
    } catch (e: any) { alert(e.message); }
  }

  // ── Pickup Points ─────────────────────────────────────────────────────────

  async function savePoint() {
    if (!pName.trim()) { alert("Name required"); return; }
    setPLoad(true);
    try {
      const p = await api("POST", "/api/transport/pickup-points", { name: pName.trim() });
      setPickupPoints(pts => [...pts, p].sort((a, b) => a.name.localeCompare(b.name)));
      setPName("");
      setShowAddPoint(false);
    } catch (e: any) { alert(e.message); }
    finally { setPLoad(false); }
  }

  async function deletePoint(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will remove it from all routes.`)) return;
    try {
      await api("DELETE", `/api/transport/pickup-points/${id}`);
      setPickupPoints(pts => pts.filter(p => p.id !== id));
      router.refresh();
    } catch (e: any) { alert(e.message); }
  }

  // ── Student assign ────────────────────────────────────────────────────────

  async function saveAssign() {
    if (!assignForm.studentId || !assignForm.routeId) { alert("Student and route required"); return; }
    setAssignLoad(true);
    try {
      await api("POST", "/api/transport/assign", assignForm);
      setStudents(ss => ss.map(s => s.id === assignForm.studentId
        ? {
            ...s,
            transportRoute: {
              route: routes.find(r => r.id === assignForm.routeId),
              pickupPoint: pickupPoints.find(p => p.id === assignForm.pickupPointId) ?? null,
            },
          }
        : s
      ));
      setAssignForm({ studentId: "", routeId: "", pickupPointId: "" });
      setShowAssign(false);
    } catch (e: any) { alert(e.message); }
    finally { setAssignLoad(false); }
  }

  async function unassign(studentId: string) {
    if (!confirm("Remove this student's transport assignment?")) return;
    try {
      await api("DELETE", "/api/transport/assign", { studentId });
      setStudents(ss => ss.map(s => s.id === studentId ? { ...s, transportRoute: null } : s));
    } catch (e: any) { alert(e.message); }
  }

  const TABS = [
    { key: "vehicles" as Tab, label: "Vehicles",       icon: Bus },
    { key: "routes"   as Tab, label: "Routes",         icon: MapPin },
    { key: "points"   as Tab, label: "Pickup Points",  icon: MapPin },
    { key: "students" as Tab, label: "Assignments",    icon: Users },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Vehicles ── */}
      {tab === "vehicles" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Link href="/transport/vehicles/new">
                <Button><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
              </Link>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Reg No.", "Model", "Year", "Driver", "Contact", "Licence"].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.length === 0
                  ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No vehicles yet.</td></tr>
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
            {perm.canAdd && (
              <Link href="/transport/routes/new">
                <Button><Plus className="h-4 w-4 mr-1.5" /> Add Route</Button>
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {routes.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-gray-400">No routes yet.</CardContent></Card>
            )}
            {routes.map((r: any) => {
              const expanded = expandedRouteId === r.id;
              // Pickup points not yet on this route
              const usedIds = new Set(r.routePickupPoints.map((rpp: any) => rpp.pickupPointId));
              const available = pickupPoints.filter(p => !usedIds.has(p.id));
              return (
                <Card key={r.id} className="overflow-hidden">
                  <CardContent className="pt-4">
                    {/* Route header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.vehicle?.vehicleNo ?? "No vehicle"} · {r._count?.studentRoutes ?? r.routePickupPoints.length} students
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setExpandedRouteId(expanded ? null : r.id);
                          setStopForm({ pickupPointId: "", timing: "", fees: "" });
                        }}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Manage stops {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Stop badges (collapsed view) */}
                    {!expanded && r.routePickupPoints.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.routePickupPoints.map((rpp: any) => (
                          <span key={rpp.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            {rpp.pickupPoint.name}{rpp.timing ? ` · ${rpp.timing}` : ""}{rpp.fees ? ` · GHS ${Number(rpp.fees).toFixed(2)}` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expanded stop management */}
                    {expanded && (
                      <div className="mt-4 border-t pt-4 space-y-4">
                        {/* Current stops */}
                        {r.routePickupPoints.length === 0 ? (
                          <p className="text-sm text-gray-400">No stops added yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {r.routePickupPoints.map((rpp: any) => (
                              <div key={rpp.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                <div>
                                  <span className="font-medium text-sm text-gray-800">{rpp.pickupPoint.name}</span>
                                  {rpp.timing && <span className="ml-2 text-xs text-gray-500">{rpp.timing}</span>}
                                  {rpp.fees && <span className="ml-2 text-xs text-green-700 font-medium">GHS {Number(rpp.fees).toFixed(2)}</span>}
                                </div>
                                <button
                                  onClick={() => removeStop(r.id, rpp.id)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                  title="Remove stop"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add stop form */}
                        <div className="bg-blue-50 rounded-lg p-3 space-y-3">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Add Stop</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[13px] font-semibold text-slate-700 mb-1 block">Pickup Point *</label>
                              <select
                                className={SEL}
                                value={stopForm.pickupPointId}
                                onChange={e => setStopForm(f => ({ ...f, pickupPointId: e.target.value }))}
                              >
                                <option value="">— Select —</option>
                                {available.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              {available.length === 0 && (
                                <p className="text-xs text-gray-400 mt-1">All points already added. Create new ones in Pickup Points tab.</p>
                              )}
                            </div>
                            <div>
                              <label className="text-[13px] font-semibold text-slate-700 mb-1 block">Pickup Time</label>
                              <Input
                                type="time"
                                value={stopForm.timing}
                                onChange={e => setStopForm(f => ({ ...f, timing: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-[13px] font-semibold text-slate-700 mb-1 block">Fee (GHS)</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={stopForm.fees}
                                onChange={e => setStopForm(f => ({ ...f, fees: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" disabled={stopLoading || !stopForm.pickupPointId} onClick={() => addStop(r.id)}>
                              {stopLoading ? "Adding…" : "Add Stop"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pickup Points ── */}
      {tab === "points" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{pickupPoints.length} pickup point{pickupPoints.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Button onClick={() => { setPName(""); setShowAddPoint(!showAddPoint); }}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Point
              </Button>
            )}
          </div>

          {showAddPoint && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">New Pickup Point</h3>
                <button onClick={() => setShowAddPoint(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <Input
                value={pName}
                onChange={e => setPName(e.target.value)}
                placeholder="e.g. Legon Interchange"
                onKeyDown={e => e.key === "Enter" && savePoint()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddPoint(false)}>Cancel</Button>
                <Button disabled={pLoad} onClick={savePoint}>{pLoad ? "Saving…" : "Add"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {pickupPoints.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No pickup points yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Used on routes</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pickupPoints.map((p: any) => {
                    const routeCount = routes.filter(r =>
                      r.routePickupPoints.some((rpp: any) => rpp.pickupPointId === p.id)
                    ).length;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500">{routeCount} route{routeCount !== 1 ? "s" : ""}</td>
                        <td className="px-4 py-3 text-right">
                          {perm.canDelete && (
                            <button
                              onClick={() => deletePoint(p.id, p.name)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Student Assignments ── */}
      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{students.filter((s: any) => s.transportRoute).length} students assigned</p>
            {perm.canAdd && (
              <Button onClick={() => { setAssignForm({ studentId: "", routeId: "", pickupPointId: "" }); setShowAssign(!showAssign); }}>
                <Plus className="h-4 w-4 mr-1.5" /> Assign Student
              </Button>
            )}
          </div>

          {showAssign && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Assign Student to Route</h3>
                <button onClick={() => setShowAssign(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Student *", key: "studentId", opts: students.map((s: any) => ({ v: s.id, l: `${s.firstName} ${s.lastName} (${s.admissionNo})` })) },
                  { label: "Route *",   key: "routeId",   opts: routes.map((r: any) => ({ v: r.id, l: r.title })) },
                  { label: "Pickup Point", key: "pickupPointId",
                    opts: (assignForm.routeId
                      ? routes.find(r => r.id === assignForm.routeId)?.routePickupPoints.map((rpp: any) => ({ v: rpp.pickupPointId, l: rpp.pickupPoint.name }))
                      : pickupPoints.map(p => ({ v: p.id, l: p.name }))) ?? [] },
                ].map(({ label, key, opts }) => (
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
                <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
                <Button disabled={assignLoad} onClick={saveAssign}>{assignLoad ? "Saving…" : "Assign"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Student", "Adm No.", "Route", "Pickup Point", ""].map((h, i) =>
                  <th key={i} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y">
                {students.filter((s: any) => s.transportRoute).length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No students assigned yet.</td></tr>
                ) : students.filter((s: any) => s.transportRoute).map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                    <td className="px-4 py-3 text-gray-600">{s.transportRoute?.route?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.transportRoute?.pickupPoint?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {perm.canDelete && (
                        <button onClick={() => unassign(s.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Unassign">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
