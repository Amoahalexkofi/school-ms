"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bus, MapPin, Users, Plus, X, ChevronDown, ChevronUp, Trash2, Pencil, Banknote } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
import { usePermission } from "@/components/PermissionsProvider";

type Props = { vehicles: any[]; routes: any[]; pickupPoints: any[]; students: any[]; sessions: any[]; feemasters: any[] };
type Tab = "vehicles" | "routes" | "points" | "students" | "fees";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

export function TransportClient({ vehicles, routes: initialRoutes, pickupPoints: initialPoints, students: initialStudents, sessions, feemasters: initialFees }: Props) {
  const router = useRouter();
  const perm = usePermission("transport");

  // Transport fee schedule (TransportFeemaster) state
  const [fees, setFees] = useState(initialFees);
  const [showAddFee, setShowAddFee] = useState(false);
  const [feeForm, setFeeForm] = useState({ sessionId: sessions[0]?.id ?? "", month: "January", dueDate: "", fineType: "none", fineAmount: "", finePercentage: "" });
  const [feeLoad, setFeeLoad] = useState(false);

  async function saveFeemaster() {
    if (!feeForm.sessionId || !feeForm.month) { alert("Session and month required"); return; }
    setFeeLoad(true);
    try {
      const res = await fetch("/api/transport/feemaster", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(feeForm) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error);
      setFees(f => [d, ...f]); setShowAddFee(false);
      setFeeForm({ sessionId: sessions[0]?.id ?? "", month: "January", dueDate: "", fineType: "none", fineAmount: "", finePercentage: "" });
    } catch (e: any) { alert(e.message); } finally { setFeeLoad(false); }
  }
  async function deleteFeemaster(id: string) {
    if (!confirm("Remove this fee-schedule month?")) return;
    try { await fetch(`/api/transport/feemaster/${id}`, { method: "DELETE" }); setFees(f => f.filter(x => x.id !== id)); }
    catch { alert("Failed"); }
  }
  const [tab, setTab] = useState<Tab>("vehicles");

  // Local copies so we can optimistically update without full page refresh
  const [routes, setRoutes] = useState(initialRoutes);
  const [pickupPoints, setPickupPoints] = useState(initialPoints);
  const [students, setStudents] = useState(initialStudents);
  const [vehicleList, setVehicleList] = useState(vehicles);
  const [editVehicle, setEditVehicle] = useState<any | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ vehicleNo: "", vehicleModel: "", manufactureYear: "", driverName: "", driverContact: "", driverLicence: "" });
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleError, setVehicleError] = useState("");

  function openEditVehicle(v: any) {
    setEditVehicle(v);
    setVehicleForm({
      vehicleNo: v.vehicleNo ?? "", vehicleModel: v.vehicleModel ?? "", manufactureYear: v.manufactureYear ?? "",
      driverName: v.driverName ?? "", driverContact: v.driverContact ?? "", driverLicence: v.driverLicence ?? "",
    });
    setVehicleError("");
  }

  async function saveVehicle() {
    if (!editVehicle) return;
    if (!vehicleForm.vehicleNo.trim()) { setVehicleError("Vehicle registration number is required"); return; }
    setVehicleSaving(true); setVehicleError("");
    try {
      const res = await fetch(`/api/transport/vehicles/${editVehicle.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vehicleForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setVehicleList(list => list.map(v => v.id === editVehicle.id ? d : v));
      setEditVehicle(null);
    } catch (e: any) {
      setVehicleError(e.message || "Failed");
    } finally {
      setVehicleSaving(false);
    }
  }

  async function deleteVehicle(id: string) {
    if (!confirm("Delete this vehicle? Routes using it will show \"No vehicle\".")) return;
    const res = await fetch(`/api/transport/vehicles/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); return; }
    setVehicleList(list => list.filter(v => v.id !== id));
  }

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
    { key: "fees"     as Tab, label: "Fee Schedule",   icon: Banknote },
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
            <p className="text-sm text-gray-500">{vehicleList.length} vehicle{vehicleList.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Link href="/transport/vehicles/new">
                <Button><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
              </Link>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Reg No.", "Model", "Year", "Driver", "Contact", "Licence", ""].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y">
                {vehicleList.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No vehicles yet.</td></tr>
                  : vehicleList.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium">{v.vehicleNo}</td>
                      <td className="px-4 py-3 text-gray-600">{v.vehicleModel ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{v.manufactureYear ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{v.driverName ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{v.driverContact ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{v.driverLicence ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => openEditVehicle(v)} className="text-gray-400 hover:text-gray-600" title="Edit vehicle">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteVehicle(v.id)} className="text-gray-400 hover:text-red-600" title="Delete vehicle">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
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

      {/* ── Transport Fee Schedule ── */}
      {tab === "fees" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Monthly fee schedule. The fee amount comes from each route&apos;s pickup-point fee; this sets which months are billed and any late fine.</p>
            {perm.canAdd && (
              <Button onClick={() => setShowAddFee(!showAddFee)}><Plus className="h-4 w-4 mr-1.5" /> Add Month</Button>
            )}
          </div>

          {showAddFee && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">New Fee-Schedule Month</h3>
                <button onClick={() => setShowAddFee(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Session *</label>
                  <select className={SEL} value={feeForm.sessionId} onChange={e => setFeeForm(f => ({ ...f, sessionId: e.target.value }))}>
                    {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month *</label>
                  <select className={SEL} value={feeForm.month} onChange={e => setFeeForm(f => ({ ...f, month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" className={SEL} value={feeForm.dueDate} onChange={e => setFeeForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Late Fine Type</label>
                  <select className={SEL} value={feeForm.fineType} onChange={e => setFeeForm(f => ({ ...f, fineType: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="fixed">Fixed (₵)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                {feeForm.fineType === "fixed" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fine Amount (₵)</label>
                    <Input type="number" value={feeForm.fineAmount} onChange={e => setFeeForm(f => ({ ...f, fineAmount: e.target.value }))} />
                  </div>
                )}
                {feeForm.fineType === "percentage" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fine %</label>
                    <Input type="number" value={feeForm.finePercentage} onChange={e => setFeeForm(f => ({ ...f, finePercentage: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddFee(false)}>Cancel</Button>
                <Button disabled={feeLoad} onClick={saveFeemaster}>{feeLoad ? "Saving…" : "Add"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {fees.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No fee-schedule months yet. Add the months you bill transport for.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{["Month", "Due Date", "Late Fine", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {fees.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{m.month}</td>
                      <td className="px-4 py-3 text-gray-500">{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{m.fineType === "fixed" ? `₵${Number(m.fineAmount)}` : m.fineType === "percentage" ? `${Number(m.finePercentage)}%` : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {perm.canDelete && <button onClick={() => deleteFeemaster(m.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!editVehicle} onOpenChange={o => !o && setEditVehicle(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Registration No. *</Label>
              <Input className="mt-1" value={vehicleForm.vehicleNo} onChange={e => setVehicleForm(f => ({ ...f, vehicleNo: e.target.value }))} />
            </div>
            <div>
              <Label>Model</Label>
              <Input className="mt-1" value={vehicleForm.vehicleModel} onChange={e => setVehicleForm(f => ({ ...f, vehicleModel: e.target.value }))} />
            </div>
            <div>
              <Label>Manufacture Year</Label>
              <Input className="mt-1" value={vehicleForm.manufactureYear} onChange={e => setVehicleForm(f => ({ ...f, manufactureYear: e.target.value }))} />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input className="mt-1" value={vehicleForm.driverName} onChange={e => setVehicleForm(f => ({ ...f, driverName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Driver Contact</Label>
                <Input className="mt-1" value={vehicleForm.driverContact} onChange={e => setVehicleForm(f => ({ ...f, driverContact: e.target.value }))} />
              </div>
              <div>
                <Label>Licence No.</Label>
                <Input className="mt-1" value={vehicleForm.driverLicence} onChange={e => setVehicleForm(f => ({ ...f, driverLicence: e.target.value }))} />
              </div>
            </div>
            {vehicleError && <p className="text-sm text-red-600">{vehicleError}</p>}
            <Button className="w-full" disabled={vehicleSaving} onClick={saveVehicle}>
              {vehicleSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
