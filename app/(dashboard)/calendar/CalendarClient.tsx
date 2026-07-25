"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, CheckSquare, Square, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  color: string;
  visibility: "PUBLIC" | "ROLE" | "PRIVATE" | "TASK";
  createdById: string;
  isDone: boolean;
  createdBy: { id: string; username: string; role: string };
};

type HolidayItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
};

const COLORS = ["#4f46e5", "#03a9f4", "#7cb342", "#fb8c00", "#d81b60", "#8e24aa", "#757575", "#fb3b3b"];
const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "10:00",
  color: COLORS[0],
  visibility: "TASK" as EventItem["visibility"],
};

function toLocalDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGrid(monthStart: Date) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function itemCoversDay(startISO: string, endISO: string, day: Date) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
  return start <= dayEnd && end >= dayStart;
}

export function CalendarClient({
  initialEvents,
  initialHolidays,
  initialMonth,
  userId,
  role,
  canBroadcast,
}: {
  initialEvents: EventItem[];
  initialHolidays: HolidayItem[];
  initialMonth: string;
  userId: string;
  role: string;
  canBroadcast: boolean;
}) {
  const [month, setMonth] = useState(new Date(initialMonth));
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const weeks = useMemo(() => buildGrid(month), [month]);
  const today = new Date();

  async function loadMonth(m: Date) {
    setLoading(true);
    const from = new Date(m.getFullYear(), m.getMonth(), 1);
    const to = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    try {
      const res = await fetch(`/api/calendar?from=${from.toISOString()}&to=${to.toISOString()}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setHolidays(data.holidays ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (month.toISOString() === new Date(initialMonth).toISOString()) return;
    loadMonth(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function changeMonth(delta: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  function openNew(day?: Date) {
    const d = day ?? selectedDay;
    setEditing(null);
    setForm({ ...emptyForm, startDate: toLocalDateInput(d), endDate: toLocalDateInput(d) });
    setError("");
    setOpen(true);
  }

  function openEdit(ev: EventItem) {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      startDate: toLocalDateInput(s),
      startTime: `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`,
      endDate: toLocalDateInput(e),
      endTime: `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`,
      color: ev.color,
      visibility: ev.visibility,
    });
    setError("");
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.startDate || !form.endDate) { setError("Start and end dates are required"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        startDate: new Date(`${form.startDate}T${form.startTime}:00`).toISOString(),
        endDate: new Date(`${form.endDate}T${form.endTime}:00`).toISOString(),
        color: form.color,
        visibility: form.visibility,
      };
      const res = await fetch(editing ? `/api/calendar/${editing.id}` : "/api/calendar", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save");
      setOpen(false);
      await loadMonth(month);
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    await loadMonth(month);
  }

  async function toggleDone(ev: EventItem) {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, isDone: !e.isDone } : e)));
    await fetch(`/api/calendar/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: !ev.isDone }),
    });
  }

  const myTasks = events
    .filter((e) => e.visibility === "TASK" && e.createdById === userId)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const selectedDayEvents = events.filter((e) => itemCoversDay(e.startDate, e.endDate, selectedDay));
  const selectedDayHolidays = holidays.filter((h) => itemCoversDay(h.startDate, h.endDate, selectedDay));

  const visibilityOptions: { value: EventItem["visibility"]; label: string }[] = [
    { value: "TASK", label: "My Task" },
    { value: "PRIVATE", label: "Only Me" },
    ...(canBroadcast ? [{ value: "ROLE" as const, label: "My Role" }, { value: "PUBLIC" as const, label: "Everyone" }] : []),
  ];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <h2 className="text-lg font-semibold text-slate-900 min-w-[160px] text-center">
                {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today); }}>
                Today
              </Button>
            </div>
            <Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-1.5" /> Add Event</Button>
          </div>

          <Card className={cn(loading && "opacity-60 pointer-events-none")}>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-slate-100 text-xs font-medium text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="px-2 py-2 text-center">{d}</div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                  {week.map((day, di) => {
                    const inMonth = day.getMonth() === month.getMonth();
                    const isToday = isSameDay(day, today);
                    const isSelected = isSameDay(day, selectedDay);
                    const dayHolidays = holidays.filter((h) => itemCoversDay(h.startDate, h.endDate, day));
                    const dayEvents = events.filter((e) => itemCoversDay(e.startDate, e.endDate, day));
                    const visible = dayEvents.slice(0, 2);
                    const extra = dayEvents.length - visible.length;
                    return (
                      <button
                        key={di}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "min-h-[92px] p-1.5 text-left border-r border-slate-100 last:border-r-0 transition-colors hover:bg-slate-50",
                          !inMonth && "bg-slate-50/50",
                          isSelected && "bg-indigo-50/60 ring-1 ring-inset ring-indigo-200"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                            !inMonth && "text-slate-300",
                            inMonth && !isToday && "text-slate-700",
                            isToday && "bg-indigo-600 text-white font-medium"
                          )}
                        >
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayHolidays.map((h) => (
                            <div key={h.id} className="truncate rounded bg-amber-100 px-1 py-0.5 text-xs font-medium text-amber-800">
                              {h.title}
                            </div>
                          ))}
                          {visible.map((e) => (
                            <div
                              key={e.id}
                              className={cn("truncate rounded px-1 py-0.5 text-xs text-white", e.isDone && "opacity-50 line-through")}
                              style={{ backgroundColor: e.color }}
                            >
                              {e.title}
                            </div>
                          ))}
                          {extra > 0 && <div className="text-xs text-slate-400 px-1">+{extra} more</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => openNew(selectedDay)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              {selectedDayHolidays.length === 0 && selectedDayEvents.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayHolidays.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium">{h.title}</span>
                      <span className="text-xs text-amber-600">Holiday</span>
                    </div>
                  ))}
                  {selectedDayEvents.map((e) => {
                    const canManage = e.createdById === userId || role === "SUPER_ADMIN" || role === "ADMIN";
                    return (
                      <div key={e.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                        <div className="min-w-0 flex-1">
                          <p className={cn("font-medium text-slate-900 truncate", e.isDone && "line-through text-slate-400")}>{e.title}</p>
                          {e.description && <p className="text-xs text-slate-500 truncate">{e.description}</p>}
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{e.visibility === "TASK" ? "Task" : e.visibility === "PRIVATE" ? "Private" : e.visibility === "ROLE" ? "My Role" : "Everyone"}</span>
                        {canManage && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => openEdit(e)} className="text-slate-400 hover:text-slate-600"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => remove(e.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">My Tasks</h3>
              {myTasks.length === 0 ? (
                <p className="text-sm text-slate-400">No personal tasks this month.</p>
              ) : (
                <div className="space-y-2">
                  {myTasks.map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <button onClick={() => toggleDone(t)} className="mt-0.5 text-slate-400 hover:text-indigo-600">
                        {t.isDone ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm text-slate-800 truncate", t.isDone && "line-through text-slate-400")}>{t.title}</p>
                        <p className="text-xs text-slate-400">{new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. PTA Meeting" />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <div className="mt-1 flex gap-1.5">
                  <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                  <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>End</Label>
                <div className="mt-1 flex gap-1.5">
                  <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                  <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <Label>Visible To</Label>
              <select className={cn(SEL, "mt-1")} value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as EventItem["visibility"] }))}>
                {visibilityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Color</Label>
              <div className="mt-1.5 flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={cn("h-6 w-6 rounded-full ring-offset-2 transition-shadow", form.color === c && "ring-2 ring-indigo-500")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving} onClick={save}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
