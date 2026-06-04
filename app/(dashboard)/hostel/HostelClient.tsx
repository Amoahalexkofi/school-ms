"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, BedDouble, Users, Plus } from "lucide-react";

type Props = { roomTypes: any[]; hostels: any[]; students: any[] };
type Tab = "roomtypes" | "hostels" | "allocate";

export function HostelClient({ roomTypes, hostels, students }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hostels");

  const [rtOpen, setRtOpen] = useState(false); const [rtName, setRtName] = useState(""); const [rtErr, setRtErr] = useState(""); const [rtLoad, setRtLoad] = useState(false);
  const [hOpen, setHOpen] = useState(false); const [hForm, setHForm] = useState({ name: "", type: "" }); const [hErr, setHErr] = useState(""); const [hLoad, setHLoad] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false); const [roomForm, setRoomForm] = useState({ hostelId: "", roomNo: "", roomTypeId: "", capacity: "1" }); const [roomErr, setRoomErr] = useState(""); const [roomLoad, setRoomLoad] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false); const [allocForm, setAllocForm] = useState({ studentId: "", roomId: "" }); const [allocErr, setAllocErr] = useState(""); const [allocLoad, setAllocLoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }

  async function saveRoomType() {
    if (!rtName.trim()) { setRtErr("Name required"); return; }
    setRtLoad(true); setRtErr("");
    try { await post("/api/hostel/room-types", { name: rtName }); setRtOpen(false); router.refresh(); }
    catch (e: any) { setRtErr(e.message); } finally { setRtLoad(false); }
  }
  async function saveHostel() {
    if (!hForm.name.trim()) { setHErr("Name required"); return; }
    setHLoad(true); setHErr("");
    try { await post("/api/hostel/hostels", hForm); setHOpen(false); router.refresh(); }
    catch (e: any) { setHErr(e.message); } finally { setHLoad(false); }
  }
  async function saveRoom() {
    if (!roomForm.hostelId || !roomForm.roomNo.trim()) { setRoomErr("Hostel and room number required"); return; }
    setRoomLoad(true); setRoomErr("");
    try { await post("/api/hostel/rooms", roomForm); setRoomOpen(false); router.refresh(); }
    catch (e: any) { setRoomErr(e.message); } finally { setRoomLoad(false); }
  }
  async function saveAlloc() {
    if (!allocForm.studentId || !allocForm.roomId) { setAllocErr("Student and room required"); return; }
    setAllocLoad(true); setAllocErr("");
    try { await post("/api/hostel/allocate", allocForm); setAllocOpen(false); router.refresh(); }
    catch (e: any) { setAllocErr(e.message); } finally { setAllocLoad(false); }
  }

  // All rooms flat list for allocation
  const allRooms = hostels.flatMap((h: any) => h.rooms.map((r: any) => ({ ...r, hostelName: h.name })));

  const TABS = [
    { key: "roomtypes" as Tab, label: "Room Types" },
    { key: "hostels"   as Tab, label: "Hostels & Rooms" },
    { key: "allocate"  as Tab, label: "Allocations" },
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

      {/* Room Types */}
      {tab === "roomtypes" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{roomTypes.length} type{roomTypes.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setRtName(""); setRtErr(""); setRtOpen(true); }}><Plus className="h-4 w-4 mr-1.5" />Add Type</Button>
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setRoomForm({ hostelId: "", roomNo: "", roomTypeId: "", capacity: "1" }); setRoomErr(""); setRoomOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" />Add Room
              </Button>
              <Button onClick={() => { setHForm({ name: "", type: "" }); setHErr(""); setHOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" />Add Hostel
              </Button>
            </div>
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
                    <p className="text-xs text-gray-500">{h.rooms.length} room{h.rooms.length !== 1 ? "s" : ""}</p>
                  </div>
                  {h.rooms.length > 0 && (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr>{["Room No.","Type","Capacity","Occupied"].map(c => <th key={c} className="text-left px-3 py-2 text-xs font-medium text-gray-500">{c}</th>)}</tr></thead>
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
            <Button onClick={() => { setAllocForm({ studentId: "", roomId: "" }); setAllocErr(""); setAllocOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Allocate Room
            </Button>
          </div>
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

      {/* Dialogs */}
      <Dialog open={rtOpen} onOpenChange={o => !o && setRtOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add Room Type</DialogTitle></DialogHeader>
        <Input value={rtName} onChange={e => setRtName(e.target.value)} placeholder="e.g. Single, Double, Dormitory" onKeyDown={e => e.key === "Enter" && saveRoomType()} />
        {rtErr && <p className="text-sm text-red-600">{rtErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRtOpen(false)}>Cancel</Button><Button disabled={rtLoad} onClick={saveRoomType}>{rtLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={hOpen} onOpenChange={o => !o && setHOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add Hostel</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><Input value={hForm.name} onChange={e => setHForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type (Boys/Girls)</label><Input value={hForm.type} onChange={e => setHForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Boys, Girls, Mixed" /></div>
        </div>
        {hErr && <p className="text-sm text-red-600">{hErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setHOpen(false)}>Cancel</Button><Button disabled={hLoad} onClick={saveHostel}>{hLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={roomOpen} onOpenChange={o => !o && setRoomOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {[["Hostel *","hostelId", hostels.map((h: any) => ({ v: h.id, l: h.name }))],
            ["Room Type","roomTypeId", roomTypes.map((rt: any) => ({ v: rt.id, l: rt.name }))],
          ].map(([label, key, opts]: any) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(roomForm as any)[key]} onChange={e => setRoomForm(f => ({ ...f, [key]: e.target.value }))}>
                <option value="">— Select —</option>
                {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Room No. *</label><Input value={roomForm.roomNo} onChange={e => setRoomForm(f => ({ ...f, roomNo: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label><Input type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} /></div>
          </div>
        </div>
        {roomErr && <p className="text-sm text-red-600">{roomErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRoomOpen(false)}>Cancel</Button><Button disabled={roomLoad} onClick={saveRoom}>{roomLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={allocOpen} onOpenChange={o => !o && setAllocOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Allocate Room</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {[["Student *","studentId", students.map((s: any) => ({ v: s.id, l: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))],
            ["Room *","roomId", allRooms.map((r: any) => ({ v: r.id, l: `${r.hostelName} — Room ${r.roomNo} (${r._count.allocations}/${r.capacity})` }))],
          ].map(([label, key, opts]: any) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(allocForm as any)[key]} onChange={e => setAllocForm(f => ({ ...f, [key]: e.target.value }))}>
                <option value="">— Select —</option>
                {opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
        </div>
        {allocErr && <p className="text-sm text-red-600">{allocErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAllocOpen(false)}>Cancel</Button><Button disabled={allocLoad} onClick={saveAlloc}>{allocLoad ? "Saving…" : "Allocate"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
