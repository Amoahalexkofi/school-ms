"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";
type ActiveTab = "hostel" | "room" | "roomtype";

type Props = {
  roomTypes: any[];
  hostels: any[];
};

export function AddHostelForm({ roomTypes, hostels }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("hostel");
  const [saving, setSaving] = useState(false);

  // Hostel form
  const [hostelForm, setHostelForm] = useState({ name: "", type: "" });

  // Room form
  const [roomForm, setRoomForm] = useState({ hostelId: "", roomNo: "", roomTypeId: "", capacity: "1", floor: "", description: "" });

  // Room Type form
  const [rtName, setRtName] = useState("");

  async function submitHostel(e: React.FormEvent) {
    e.preventDefault();
    if (!hostelForm.name.trim()) { alert("Hostel name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/hostel/hostels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hostelForm),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save hostel"); return; }
      router.push("/hostel");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomForm.hostelId || !roomForm.roomNo.trim()) { alert("Hostel and room number are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/hostel/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save room"); return; }
      router.push("/hostel");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRoomType(e: React.FormEvent) {
    e.preventDefault();
    if (!rtName.trim()) { alert("Room type name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/hostel/room-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rtName }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save room type"); return; }
      router.push("/hostel");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "hostel", label: "Hostel" },
    { key: "room", label: "Room" },
    { key: "roomtype", label: "Room Type" },
  ];

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hostel Tab */}
      {activeTab === "hostel" && (
        <form onSubmit={submitHostel} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Add Hostel</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hostel Name *</Label>
                <Input value={hostelForm.name} onChange={e => setHostelForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Boys Hostel A" />
              </div>
              <div>
                <Label>Type</Label>
                <select className={SEL} value={hostelForm.type} onChange={e => setHostelForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Hostel"}</Button>
          </div>
        </form>
      )}

      {/* Room Tab */}
      {activeTab === "room" && (
        <form onSubmit={submitRoom} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Add Room</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hostel *</Label>
                <select className={SEL} value={roomForm.hostelId} onChange={e => setRoomForm(f => ({ ...f, hostelId: e.target.value }))}>
                  <option value="">— Select Hostel —</option>
                  {hostels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Room Type</Label>
                <select className={SEL} value={roomForm.roomTypeId} onChange={e => setRoomForm(f => ({ ...f, roomTypeId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {roomTypes.map((rt: any) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Room Number *</Label>
                <Input value={roomForm.roomNo} onChange={e => setRoomForm(f => ({ ...f, roomNo: e.target.value }))} required placeholder="e.g. 101" />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div>
                <Label>Floor</Label>
                <Input value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. Ground, 1st" />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-[60px]"
                  value={roomForm.description}
                  onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Room"}</Button>
          </div>
        </form>
      )}

      {/* Room Type Tab */}
      {activeTab === "roomtype" && (
        <form onSubmit={submitRoomType} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Add Room Type</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label>Room Type Name *</Label>
                <Input value={rtName} onChange={e => setRtName(e.target.value)} required placeholder="e.g. Single, Double, Dormitory" />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Room Type"}</Button>
          </div>
        </form>
      )}
    </main>
  );
}
