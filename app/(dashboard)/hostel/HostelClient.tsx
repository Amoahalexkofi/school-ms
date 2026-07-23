"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePermission } from "@/components/PermissionsProvider";import { Plus, X, Pencil, Trash2 } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Props = { roomTypes: any[]; hostels: any[]; students: any[] };
type Tab = "roomtypes" | "hostels" | "allocate";

export function HostelClient({ roomTypes, hostels, students }: Props) {
  const perm = usePermission("hostel");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hostels");
  const [allocPanelOpen, setAllocPanelOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({ studentId: "", roomId: "" });
  const [allocLoad, setAllocLoad] = useState(false);

  async function saveAlloc() {
    if (!allocForm.studentId || !allocForm.roomId) { alert("Student and room required"); return; }
    setAllocLoad(true);
    try {
      const res = await fetch("/api/hostel/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allocForm),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to allocate"); return; }
      setAllocForm({ studentId: "", roomId: "" });
      setAllocPanelOpen(false);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setAllocLoad(false); }
  }

  // All rooms flat list for allocation
  const allRooms = hostels.flatMap((h: any) => h.rooms.map((r: any) => ({ ...r, hostelName: h.name })));

  const [editHostel, setEditHostel] = useState<any | null>(null);
  const [hostelForm, setHostelForm] = useState({ name: "", type: "", address: "", intake: "", description: "" });
  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [roomForm, setRoomForm] = useState({ roomNo: "", roomTypeId: "", capacity: "1", costPerBed: "" });
  const [savingEntity, setSavingEntity] = useState(false);
  const [entityError, setEntityError] = useState("");

  function openEditHostel(h: any) {
    setEditHostel(h);
    setHostelForm({ name: h.name ?? "", type: h.type ?? "", address: h.address ?? "", intake: h.intake ? String(h.intake) : "", description: h.description ?? "" });
    setEntityError("");
  }
  async function saveHostel() {
    if (!editHostel) return;
    if (!hostelForm.name.trim()) { setEntityError("Hostel name is required"); return; }
    setSavingEntity(true); setEntityError("");
    try {
      const res = await fetch(`/api/hostel/hostels/${editHostel.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hostelForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setEditHostel(null);
      router.refresh();
    } catch (e: any) { setEntityError(e.message || "Failed"); }
    finally { setSavingEntity(false); }
  }
  async function deleteHostel(id: string) {
    if (!confirm("Delete this hostel and all its rooms?")) return;
    const res = await fetch(`/api/hostel/hostels/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); return; }
    router.refresh();
  }

  function openEditRoom(r: any) {
    setEditRoom(r);
    setRoomForm({ roomNo: r.roomNo ?? "", roomTypeId: r.roomTypeId ?? "", capacity: String(r.capacity ?? 1), costPerBed: r.costPerBed ? String(r.costPerBed) : "" });
    setEntityError("");
  }
  async function saveRoom() {
    if (!editRoom) return;
    if (!roomForm.roomNo.trim()) { setEntityError("Room number is required"); return; }
    setSavingEntity(true); setEntityError("");
    try {
      const res = await fetch(`/api/hostel/rooms/${editRoom.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roomForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setEditRoom(null);
      router.refresh();
    } catch (e: any) { setEntityError(e.message || "Failed"); }
    finally { setSavingEntity(false); }
  }
  async function deleteRoom(id: string) {
    if (!confirm("Delete this room?")) return;
    const res = await fetch(`/api/hostel/rooms/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); return; }
    router.refresh();
  }

  const TABS = [
    { key: "roomtypes" as Tab, label: "Room Types" },
    { key: "hostels"   as Tab, label: "Hostels & Rooms" },
    { key: "allocate"  as Tab, label: "Allocations" },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Room Types */}
      {tab === "roomtypes" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{roomTypes.length} type{roomTypes.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Link href="/hostel/new">
                <Button><Plus className="h-4 w-4 mr-1.5" />Add Type</Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {roomTypes.map((rt: any) => <Card key={rt.id}><CardContent className="pt-4 text-sm font-medium">{rt.name}</CardContent></Card>)}
            {roomTypes.length === 0 && <p className="text-sm text-gray-400 col-span-full py-6 text-center">No room types yet.</p>}
          </div>
        </div>
      )}

      {/* Hostels & Rooms */}
      {tab === "hostels" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{hostels.length} hostel{hostels.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Link href="/hostel/new">
                <Button><Plus className="h-4 w-4 mr-1.5" />Add Hostel / Room</Button>
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {hostels.map((h: any) => (
              <Card key={h.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{h.name}</p>
                      {h.type && <p className="text-xs text-gray-400">{h.type}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">{h.rooms.length} room{h.rooms.length !== 1 ? "s" : ""}</p>
                      <button onClick={() => openEditHostel(h)} className="text-gray-400 hover:text-gray-600" title="Edit hostel">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteHostel(h.id)} className="text-gray-400 hover:text-red-600" title="Delete hostel">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {h.rooms.length > 0 && (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr>{["Room No.","Type","Capacity","Occupied",""].map(c => <th key={c} className="text-left px-3 py-2 text-xs font-medium text-gray-500">{c}</th>)}</tr></thead>
                      <tbody className="divide-y">
                        {h.rooms.map((r: any) => (
                          <tr key={r.id}>
                            <td className="px-3 py-2 font-mono font-medium">{r.roomNo}</td>
                            <td className="px-3 py-2 text-gray-600">{r.roomType?.name ?? "—"}</td>
                            <td className="px-3 py-2 text-gray-500">{r.capacity}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${r._count.allocations >= r.capacity ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {r._count.allocations}/{r.capacity}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button onClick={() => openEditRoom(r)} className="text-gray-400 hover:text-gray-600" title="Edit room">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteRoom(r.id)} className="text-gray-400 hover:text-red-600" title="Delete room">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            ))}
            {hostels.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-gray-400">No hostels yet.</CardContent></Card>}
          </div>
        </div>
      )}

      {/* Allocations */}
      {tab === "allocate" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{students.filter((s: any) => s.hostelAllocation).length} students allocated</p>
            {perm.canAdd && (
              <Button onClick={() => { setAllocForm({ studentId: "", roomId: "" }); setAllocPanelOpen(!allocPanelOpen); }}>
                <Plus className="h-4 w-4 mr-1.5" />Allocate Room
              </Button>
            )}
          </div>

          {/* Inline Allocation Panel */}
          {allocPanelOpen && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Allocate Room</h3>
                <button onClick={() => setAllocPanelOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Student *", "studentId", students.map((s: any) => ({ v: s.id, l: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))],
                  ["Room *", "roomId", allRooms.map((r: any) => ({ v: r.id, l: `${r.hostelName} — Room ${r.roomNo} (${r._count.allocations}/${r.capacity})` }))],
                ].map(([label, key, opts]: any) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select className={SEL} value={(allocForm as any)[key]} onChange={e => setAllocForm(f => ({ ...f, [key]: e.target.value }))}>
                      <option value="">— Select —</option>
                      {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAllocPanelOpen(false)}>Cancel</Button>
                <Button disabled={allocLoad} onClick={saveAlloc}>{allocLoad ? "Saving…" : "Allocate"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>{["Student","Adm No.","Hostel","Room"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {students.filter((s: any) => s.hostelAllocation).map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                    <td className="px-4 py-3 text-gray-600">{s.hostelAllocation?.room?.hostel?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{s.hostelAllocation?.room?.roomNo ?? "—"}</td>
                  </tr>
                ))}
                {!students.some((s: any) => s.hostelAllocation) && <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">No allocations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!editHostel} onOpenChange={o => !o && setEditHostel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Hostel</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input className="mt-1" value={hostelForm.name} onChange={e => setHostelForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Type</Label><Input className="mt-1" value={hostelForm.type} onChange={e => setHostelForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Boys, Girls" /></div>
            <div><Label>Address</Label><Input className="mt-1" value={hostelForm.address} onChange={e => setHostelForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Intake</Label><Input className="mt-1" type="number" min="0" value={hostelForm.intake} onChange={e => setHostelForm(f => ({ ...f, intake: e.target.value }))} /></div>
            {entityError && <p className="text-sm text-red-600">{entityError}</p>}
            <Button className="w-full" disabled={savingEntity} onClick={saveHostel}>{savingEntity ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRoom} onOpenChange={o => !o && setEditRoom(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Room</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Room No. *</Label><Input className="mt-1" value={roomForm.roomNo} onChange={e => setRoomForm(f => ({ ...f, roomNo: e.target.value }))} /></div>
            <div>
              <Label>Room Type</Label>
              <select className={`${SEL} mt-1`} value={roomForm.roomTypeId} onChange={e => setRoomForm(f => ({ ...f, roomTypeId: e.target.value }))}>
                <option value="">— none —</option>
                {roomTypes.map((rt: any) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity</Label><Input className="mt-1" type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} /></div>
              <div><Label>Cost / Bed</Label><Input className="mt-1" type="number" min="0" value={roomForm.costPerBed} onChange={e => setRoomForm(f => ({ ...f, costPerBed: e.target.value }))} /></div>
            </div>
            {entityError && <p className="text-sm text-red-600">{entityError}</p>}
            <Button className="w-full" disabled={savingEntity} onClick={saveRoom}>{savingEntity ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
