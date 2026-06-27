"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ScrollText, ListTree, BookOpen, Copy, Plus, X, Pencil, Trash2,
  CheckCircle2, Circle, Save, Loader2, CalendarDays, ChevronLeft, ChevronRight,
  Video, Paperclip, Clock, User as UserIcon, ChevronDown,
} from "lucide-react";

type Lookup = { id: string; name: string };
type Teacher = { id: string; name: string; employeeId: string };
type Session = { id: string; session: string; isActive: boolean };
type ClassSection = { id: string; class: { name: string }; section: { name: string } };
type Subject = { id: string; name: string; code?: string | null };
type Topic = { id: string; name: string; status: boolean; completeDate: string | null };
type Lesson = { id: string; name: string; topics: Topic[] };

type Props = { classes: Lookup[]; sessions: Session[]; teachers: Teacher[]; currentSessionId: string };

type Tab = "manage" | "lessons" | "topics" | "weekly" | "copy";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "manage",  label: "Manage Lesson Plan", icon: <ScrollText className="h-4 w-4" /> },
  { key: "lessons", label: "Lessons",            icon: <BookOpen className="h-4 w-4" /> },
  { key: "topics",  label: "Topics",             icon: <ListTree className="h-4 w-4" /> },
  { key: "weekly",  label: "Weekly Plan",        icon: <CalendarDays className="h-4 w-4" /> },
  { key: "copy",    label: "Copy Old Lesson",    icon: <Copy className="h-4 w-4" /> },
];

const selCls = "border rounded-md px-3 py-2 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400 w-full";
const lblCls = "text-xs font-medium text-gray-500 mb-1 block";

// ── Class → Section → Subject selector ────────────────────────────────────────
function SubjectSelector({
  classes, sessionId, value, onChange,
}: {
  classes: Lookup[];
  sessionId: string;
  value: { classId: string; classSectionId: string; subjectId: string };
  onChange: (v: { classId: string; classSectionId: string; subjectId: string }) => void;
}) {
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [noGroup, setNoGroup] = useState(false);

  useEffect(() => {
    if (!value.classId) { setSections([]); return; }
    fetch(`/api/class-sections?classId=${value.classId}${sessionId ? `&sessionId=${sessionId}` : ""}`)
      .then((r) => r.json())
      .then((d) => setSections(Array.isArray(d) ? d : []))
      .catch(() => setSections([]));
  }, [value.classId, sessionId]);

  useEffect(() => {
    if (!value.classSectionId) { setSubjects([]); setNoGroup(false); return; }
    fetch(`/api/subject-groups/subjects?classSectionId=${value.classSectionId}`)
      .then((r) => r.json())
      .then((d) => { setSubjects(d.subjects ?? []); setNoGroup(d.hasGroup === false); })
      .catch(() => setSubjects([]));
  }, [value.classSectionId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className={lblCls}>Class *</label>
        <select className={selCls} value={value.classId}
          onChange={(e) => onChange({ classId: e.target.value, classSectionId: "", subjectId: "" })}>
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className={lblCls}>Section *</label>
        <select className={selCls} value={value.classSectionId} disabled={!value.classId}
          onChange={(e) => onChange({ ...value, classSectionId: e.target.value, subjectId: "" })}>
          <option value="">Select Section</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.section.name}</option>)}
        </select>
      </div>
      <div>
        <label className={lblCls}>Subject *</label>
        <select className={selCls} value={value.subjectId} disabled={!value.classSectionId}
          onChange={(e) => onChange({ ...value, subjectId: e.target.value })}>
          <option value="">Select Subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ""}</option>)}
        </select>
        {noGroup && <p className="text-[11px] text-amber-600 mt-1">No subject group assigned to this section.</p>}
      </div>
    </div>
  );
}

export function LessonPlanClient({ classes, sessions, teachers, currentSessionId }: Props) {
  const [tab, setTab] = useState<Tab>("manage");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "manage"  && <ManageTab  classes={classes} sessionId={currentSessionId} />}
      {tab === "lessons" && <LessonsTab classes={classes} sessionId={currentSessionId} />}
      {tab === "topics"  && <TopicsTab  classes={classes} sessionId={currentSessionId} />}
      {tab === "weekly"  && <WeeklyTab  classes={classes} teachers={teachers} sessionId={currentSessionId} />}
      {tab === "copy"    && <CopyTab    classes={classes} sessions={sessions} currentSessionId={currentSessionId} />}
    </div>
  );
}

// ── Manage Lesson Plan: status view + mark complete ───────────────────────────
function ManageTab({ classes, sessionId }: { classes: Lookup[]; sessionId: string }) {
  const [sel, setSel] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!sel.classSectionId || !sel.subjectId) { setLessons([]); return; }
    setLoading(true);
    fetch(`/api/lessons?classSectionId=${sel.classSectionId}&subjectId=${sel.subjectId}&sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((d) => setLessons(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [sel.classSectionId, sel.subjectId, sessionId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (t: Topic, completeDate?: string) => {
    await fetch(`/api/topics/${t.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !t.status, completeDate }),
    });
    load();
  };

  const totalTopics = lessons.reduce((a, l) => a + l.topics.length, 0);
  const doneTopics = lessons.reduce((a, l) => a + l.topics.filter((t) => t.status).length, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <SubjectSelector classes={classes} sessionId={sessionId} value={sel} onChange={setSel} />
      </div>

      {!sel.subjectId ? (
        <p className="text-sm text-gray-500 text-center py-10">Select a class, section and subject to view lesson progress.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500 text-center py-10"><Loader2 className="h-4 w-4 animate-spin inline" /> Loading…</p>
      ) : lessons.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">No lessons yet. Add lessons under the <b>Lessons</b> tab.</p>
      ) : (
        <>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm">
            <span className="font-semibold text-indigo-700">{doneTopics}</span> of{" "}
            <span className="font-semibold">{totalTopics}</span> topics completed
            {totalTopics > 0 && <span className="text-gray-500"> ({Math.round((doneTopics / totalTopics) * 100)}%)</span>}
          </div>
          {lessons.map((l) => {
            const done = l.topics.filter((t) => t.status).length;
            return (
              <div key={l.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
                  <p className="font-semibold text-sm">{l.name}</p>
                  <span className="text-xs text-gray-500">{done}/{l.topics.length} complete</span>
                </div>
                {l.topics.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-3">No topics for this lesson.</p>
                ) : (
                  <ul className="divide-y">
                    {l.topics.map((t) => <ManageTopicRow key={t.id} topic={t} onToggle={toggle} />)}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ManageTopicRow({ topic, onToggle }: { topic: Topic; onToggle: (t: Topic, d?: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {topic.status
          ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          : <Circle className="h-4 w-4 text-gray-300 shrink-0" />}
        <span className={`text-sm truncate ${topic.status ? "text-gray-700" : ""}`}>{topic.name}</span>
        {topic.status && topic.completeDate && (
          <span className="text-[11px] text-gray-400 shrink-0">on {new Date(topic.completeDate).toLocaleDateString()}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {topic.status ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Complete</span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Incomplete</span>
        )}
        {!topic.status && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border rounded px-1.5 py-0.5 text-xs" />
        )}
        <button onClick={() => onToggle(topic, topic.status ? undefined : date)}
          className={`text-xs px-2 py-1 rounded ${topic.status ? "text-gray-500 hover:bg-gray-100" : "text-white bg-green-600 hover:bg-green-700"}`}>
          {topic.status ? "Undo" : "Mark Complete"}
        </button>
      </div>
    </li>
  );
}

// ── Lessons CRUD ──────────────────────────────────────────────────────────────
function LessonsTab({ classes, sessionId }: { classes: Lookup[]; sessionId: string }) {
  const [sel, setSel] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [names, setNames] = useState<string[]>([""]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!sel.classSectionId || !sel.subjectId) { setLessons([]); return; }
    fetch(`/api/lessons?classSectionId=${sel.classSectionId}&subjectId=${sel.subjectId}&sessionId=${sessionId}`)
      .then((r) => r.json()).then((d) => setLessons(Array.isArray(d) ? d : []));
  }, [sel.classSectionId, sel.subjectId, sessionId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setMsg("");
    if (!sel.subjectId) return setMsg("Select class, section and subject first.");
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (!clean.length) return setMsg("Enter at least one lesson name.");
    setSaving(true);
    const res = await fetch("/api/lessons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sel, sessionId, names: clean }),
    });
    setSaving(false);
    if (res.ok) { setNames([""]); load(); setMsg("Lessons saved."); }
    else setMsg((await res.json()).error || "Failed to save.");
  };

  const rename = async (id: string, name: string) => {
    await fetch(`/api/lessons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this lesson and all its topics?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <SubjectSelector classes={classes} sessionId={sessionId} value={sel} onChange={setSel} />
        <div className="border-t pt-4">
          <label className={lblCls}>Lesson Name(s) *</label>
          <div className="space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex gap-2">
                <input className={selCls} placeholder="e.g. Introduction to Algebra" value={n}
                  onChange={(e) => setNames(names.map((x, j) => j === i ? e.target.value : x))} />
                {names.length > 1 && (
                  <button onClick={() => setNames(names.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 px-2"><X className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setNames([...names, ""])} className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-2">
            <Plus className="h-3.5 w-3.5" /> Add another lesson
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Lessons</Button>
          {msg && <span className="text-xs text-gray-600">{msg}</span>}
        </div>
      </div>

      {sel.subjectId && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-semibold mb-3">Existing Lessons</p>
          {lessons.length === 0 ? <p className="text-sm text-gray-500">No lessons yet.</p> : (
            <ul className="divide-y">
              {lessons.map((l) => <EditableRow key={l.id} value={l.name} subtitle={`${l.topics.length} topic(s)`} onSave={(v) => rename(l.id, v)} onDelete={() => remove(l.id)} />)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Topics CRUD + status ──────────────────────────────────────────────────────
function TopicsTab({ classes, sessionId }: { classes: Lookup[]; sessionId: string }) {
  const [sel, setSel] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [names, setNames] = useState<string[]>([""]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sel.classSectionId || !sel.subjectId) { setLessons([]); setLessonId(""); return; }
    fetch(`/api/lessons?classSectionId=${sel.classSectionId}&subjectId=${sel.subjectId}&sessionId=${sessionId}`)
      .then((r) => r.json()).then((d) => setLessons(Array.isArray(d) ? d : []));
  }, [sel.classSectionId, sel.subjectId, sessionId]);

  const loadTopics = useCallback(() => {
    if (!lessonId) { setTopics([]); return; }
    fetch(`/api/topics?lessonId=${lessonId}`).then((r) => r.json()).then((d) => setTopics(Array.isArray(d) ? d : []));
  }, [lessonId]);
  useEffect(() => { loadTopics(); }, [loadTopics]);

  const save = async () => {
    setMsg("");
    if (!lessonId) return setMsg("Select a lesson first.");
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (!clean.length) return setMsg("Enter at least one topic name.");
    setSaving(true);
    const res = await fetch("/api/topics", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, sessionId, names: clean }),
    });
    setSaving(false);
    if (res.ok) { setNames([""]); loadTopics(); setMsg("Topics saved."); }
    else setMsg((await res.json()).error || "Failed to save.");
  };

  const rename = async (id: string, name: string) => {
    await fetch(`/api/topics/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    loadTopics();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this topic?")) return;
    await fetch(`/api/topics/${id}`, { method: "DELETE" });
    loadTopics();
  };
  const toggle = async (t: Topic) => {
    await fetch(`/api/topics/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: !t.status }) });
    loadTopics();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <SubjectSelector classes={classes} sessionId={sessionId} value={sel} onChange={setSel} />
        <div>
          <label className={lblCls}>Lesson *</label>
          <select className={selCls} value={lessonId} disabled={!lessons.length} onChange={(e) => setLessonId(e.target.value)}>
            <option value="">Select Lesson</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          {sel.subjectId && !lessons.length && <p className="text-[11px] text-amber-600 mt-1">No lessons yet — add one under the Lessons tab.</p>}
        </div>
        <div className="border-t pt-4">
          <label className={lblCls}>Topic Name(s) *</label>
          <div className="space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex gap-2">
                <input className={selCls} placeholder="e.g. Linear equations" value={n}
                  onChange={(e) => setNames(names.map((x, j) => j === i ? e.target.value : x))} />
                {names.length > 1 && (
                  <button onClick={() => setNames(names.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 px-2"><X className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setNames([...names, ""])} className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-2">
            <Plus className="h-3.5 w-3.5" /> Add another topic
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || !lessonId}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Topics</Button>
          {msg && <span className="text-xs text-gray-600">{msg}</span>}
        </div>
      </div>

      {lessonId && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-semibold mb-3">Topics in this Lesson</p>
          {topics.length === 0 ? <p className="text-sm text-gray-500">No topics yet.</p> : (
            <ul className="divide-y">
              {topics.map((t) => (
                <EditableRow key={t.id} value={t.name}
                  badge={t.status
                    ? <button onClick={() => toggle(t)} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Complete</button>
                    : <button onClick={() => toggle(t)} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Incomplete</button>}
                  onSave={(v) => rename(t.id, v)} onDelete={() => remove(t.id)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Copy Old Lesson ───────────────────────────────────────────────────────────
function CopyTab({ classes, sessions, currentSessionId }: { classes: Lookup[]; sessions: Session[]; currentSessionId: string }) {
  const [srcSession, setSrcSession] = useState(currentSessionId);
  const [src, setSrc] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [tgt, setTgt] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!src.classSectionId || !src.subjectId) { setLessons([]); setChecked(new Set()); return; }
    fetch(`/api/lessons?classSectionId=${src.classSectionId}&subjectId=${src.subjectId}&sessionId=${srcSession}`)
      .then((r) => r.json()).then((d) => { setLessons(Array.isArray(d) ? d : []); setChecked(new Set()); });
  }, [src.classSectionId, src.subjectId, srcSession]);

  const toggleTopic = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };
  const toggleLesson = (l: Lesson) => {
    const next = new Set(checked);
    const all = l.topics.every((t) => next.has(t.id));
    l.topics.forEach((t) => all ? next.delete(t.id) : next.add(t.id));
    setChecked(next);
  };

  const copy = async () => {
    setMsg("");
    if (!tgt.classSectionId || !tgt.subjectId) return setMsg("Choose the target class, section and subject.");
    if (!checked.size) return setMsg("Select at least one topic to copy.");
    setSaving(true);
    const res = await fetch("/api/lessons/copy", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetClassSectionId: tgt.classSectionId, targetSubjectId: tgt.subjectId,
        sessionId: currentSessionId, topicIds: [...checked],
      }),
    });
    setSaving(false);
    const d = await res.json();
    if (res.ok) { setMsg(`Copied ${d.lessonsCreated} lesson(s), ${d.topicsCreated} topic(s).`); setChecked(new Set()); }
    else setMsg(d.error || "Failed to copy.");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <p className="text-sm font-semibold">1. Source — copy from</p>
        <div>
          <label className={lblCls}>Session</label>
          <select className={`${selCls} sm:w-64`} value={srcSession} onChange={(e) => setSrcSession(e.target.value)}>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.session}</option>)}
          </select>
        </div>
        <SubjectSelector classes={classes} sessionId={srcSession} value={src} onChange={setSrc} />
      </div>

      {src.subjectId && (
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm font-semibold mb-3">2. Select lessons / topics to copy</p>
          {lessons.length === 0 ? <p className="text-sm text-gray-500">No lessons found for the source selection.</p> : (
            <div className="space-y-3">
              {lessons.map((l) => {
                const allChecked = l.topics.length > 0 && l.topics.every((t) => checked.has(t.id));
                return (
                  <div key={l.id} className="border rounded-md overflow-hidden">
                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b cursor-pointer">
                      <input type="checkbox" checked={allChecked} onChange={() => toggleLesson(l)} disabled={!l.topics.length} />
                      <span className="font-semibold text-sm">{l.name}</span>
                      <span className="text-xs text-gray-400">{l.topics.length} topic(s)</span>
                    </label>
                    {l.topics.length > 0 && (
                      <ul className="px-3 py-2 space-y-1.5">
                        {l.topics.map((t) => (
                          <li key={t.id}>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggleTopic(t.id)} />
                              {t.name}
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <p className="text-sm font-semibold">3. Target — copy to <span className="font-normal text-gray-500">(current session)</span></p>
        <SubjectSelector classes={classes} sessionId={currentSessionId} value={tgt} onChange={setTgt} />
        <div className="flex items-center gap-3">
          <Button onClick={copy} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />} Copy {checked.size > 0 ? `${checked.size} Topic(s)` : "Lessons"}</Button>
          {msg && <span className="text-xs text-gray-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Weekly Plan (Smart School subject_syllabus scheduler) ─────────────────────
type SyllabusEntry = {
  id: string; date: string; timeFrom: string; timeTo: string; createdForId: string | null;
  subTopic: string | null; presentation: string | null; teachingMethod: string | null;
  generalObjectives: string | null; previousKnowledge: string | null;
  comprehensiveQuestions: string | null; lectureYoutubeUrl: string | null; attachment: string | null;
  topic: { id: string; name: string; lesson: { name: string; subject: { name: string; code?: string | null } } };
  createdFor: { firstName: string; lastName: string; employeeId: string } | null;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ymd = (d: Date) => d.toISOString().slice(0, 10);
function weekStart(d: Date) { const x = new Date(d); const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow); x.setHours(0, 0, 0, 0); return x; } // Monday
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

function WeeklyTab({ classes, teachers, sessionId }: { classes: Lookup[]; teachers: Teacher[]; sessionId: string }) {
  const [sel, setSel] = useState({ classId: "", classSectionId: "", subjectId: "" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [entries, setEntries] = useState<SyllabusEntry[]>([]);
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SyllabusEntry | null>(null);

  const start = anchor;
  const end = addDays(anchor, 6);

  useEffect(() => {
    if (!sel.classSectionId || !sel.subjectId) { setLessons([]); return; }
    fetch(`/api/lessons?classSectionId=${sel.classSectionId}&subjectId=${sel.subjectId}&sessionId=${sessionId}`)
      .then((r) => r.json()).then((d) => setLessons(Array.isArray(d) ? d : []));
  }, [sel.classSectionId, sel.subjectId, sessionId]);

  const loadEntries = useCallback(() => {
    if (!sel.classSectionId || !sel.subjectId) { setEntries([]); return; }
    fetch(`/api/syllabus?classSectionId=${sel.classSectionId}&subjectId=${sel.subjectId}&sessionId=${sessionId}&from=${ymd(start)}&to=${ymd(end)}`)
      .then((r) => r.json()).then((d) => setEntries(Array.isArray(d) ? d : []));
  }, [sel.classSectionId, sel.subjectId, sessionId, start, end]);
  useEffect(() => { loadEntries(); }, [loadEntries]);

  const remove = async (id: string) => {
    if (!confirm("Delete this lesson-plan entry?")) return;
    await fetch(`/api/syllabus/${id}`, { method: "DELETE" });
    loadEntries();
  };

  const byDay = (d: Date) => entries.filter((e) => e.date.slice(0, 10) === ymd(d));
  const canAdd = sel.classSectionId && sel.subjectId && lessons.some((l) => l.topics.length);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <SubjectSelector classes={classes} sessionId={sessionId} value={sel} onChange={setSel} />
      </div>

      {!sel.subjectId ? (
        <p className="text-sm text-gray-500 text-center py-10">Select a class, section and subject to plan the week.</p>
      ) : (
        <>
          {/* Week navigation */}
          <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2.5">
            <button onClick={() => setAnchor(addDays(anchor, -7))} className="text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1 text-sm"><ChevronLeft className="h-4 w-4" /> Prev</button>
            <div className="text-center">
              <p className="text-sm font-semibold">{start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
              <button onClick={() => setAnchor(weekStart(new Date()))} className="text-[11px] text-indigo-600 hover:underline">This week</button>
            </div>
            <button onClick={() => setAnchor(addDays(anchor, 7))} className="text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1 text-sm">Next <ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => { setEditing(null); setShowForm(true); }} disabled={!canAdd}><Plus className="h-4 w-4" /> Add to Plan</Button>
          </div>
          {!canAdd && <p className="text-[11px] text-amber-600 text-right -mt-2">Add lessons &amp; topics first (Lessons / Topics tabs).</p>}

          {(showForm || editing) && (
            <SyllabusForm
              lessons={lessons} teachers={teachers} sessionId={sessionId}
              weekStart={start} weekEnd={end} editing={editing}
              onClose={() => { setShowForm(false); setEditing(null); }}
              onSaved={() => { setShowForm(false); setEditing(null); loadEntries(); }}
            />
          )}

          {/* Week grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((d) => {
              const items = byDay(d);
              const isToday = ymd(d) === ymd(new Date());
              return (
                <div key={ymd(d)} className={`bg-white border rounded-lg ${isToday ? "ring-2 ring-indigo-200" : ""}`}>
                  <div className={`px-3 py-2 border-b flex items-center justify-between ${isToday ? "bg-indigo-50" : "bg-gray-50"}`}>
                    <span className="text-sm font-semibold">{DAY_NAMES[d.getDay()]}</span>
                    <span className="text-xs text-gray-400">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="p-2 space-y-2 min-h-[60px]">
                    {items.length === 0 ? (
                      <p className="text-[11px] text-gray-300 text-center py-3">No entries</p>
                    ) : items.map((e) => (
                      <SyllabusCard key={e.id} entry={e} onEdit={() => { setShowForm(false); setEditing(e); }} onDelete={() => remove(e.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SyllabusCard({ entry, onEdit, onDelete }: { entry: SyllabusEntry; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const details: [string, string | null][] = [
    ["Sub-topic", entry.subTopic], ["General objectives", entry.generalObjectives],
    ["Previous knowledge", entry.previousKnowledge], ["Teaching method", entry.teachingMethod],
    ["Presentation", entry.presentation], ["Comprehensive questions", entry.comprehensiveQuestions],
  ];
  const hasDetails = details.some(([, v]) => v);
  return (
    <div className="border rounded-md text-xs">
      <div className="p-2">
        <div className="flex items-start justify-between gap-1">
          <p className="font-semibold text-gray-800 leading-tight">{entry.topic.name}</p>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={onEdit} className="text-gray-400 hover:text-indigo-600 p-0.5"><Pencil className="h-3 w-3" /></button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 className="h-3 w-3" /></button>
          </div>
        </div>
        <p className="text-gray-400">{entry.topic.lesson.name} · {entry.topic.lesson.subject.name}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-gray-500">
          <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" />{entry.timeFrom}–{entry.timeTo}</span>
          {entry.createdFor && <span className="inline-flex items-center gap-0.5"><UserIcon className="h-3 w-3" />{entry.createdFor.firstName} {entry.createdFor.lastName}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {entry.lectureYoutubeUrl && <a href={entry.lectureYoutubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-red-600 hover:underline"><Video className="h-3 w-3" />Video</a>}
          {entry.attachment && <a href={entry.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline"><Paperclip className="h-3 w-3" />Attachment</a>}
          {hasDetails && <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 text-gray-500 hover:text-gray-700"><ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />Details</button>}
        </div>
      </div>
      {open && hasDetails && (
        <div className="border-t bg-gray-50 p-2 space-y-1.5">
          {details.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><span className="text-gray-400">{k}: </span><span className="text-gray-700 whitespace-pre-wrap">{v}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function SyllabusForm({
  lessons, teachers, sessionId, weekStart, weekEnd, editing, onClose, onSaved,
}: {
  lessons: Lesson[]; teachers: Teacher[]; sessionId: string; weekStart: Date; weekEnd: Date;
  editing: SyllabusEntry | null; onClose: () => void; onSaved: () => void;
}) {
  const initLessonId = editing ? lessons.find((l) => l.topics.some((t) => t.id === editing.topic.id))?.id ?? "" : "";
  const [lessonId, setLessonId] = useState(initLessonId);
  const [f, setF] = useState({
    topicId: editing?.topic.id ?? "",
    date: editing ? editing.date.slice(0, 10) : ymd(weekStart),
    timeFrom: editing?.timeFrom ?? "08:00",
    timeTo: editing?.timeTo ?? "09:00",
    createdForId: editing?.createdForId ?? "",
    subTopic: editing?.subTopic ?? "",
    generalObjectives: editing?.generalObjectives ?? "",
    previousKnowledge: editing?.previousKnowledge ?? "",
    teachingMethod: editing?.teachingMethod ?? "",
    presentation: editing?.presentation ?? "",
    comprehensiveQuestions: editing?.comprehensiveQuestions ?? "",
    lectureYoutubeUrl: editing?.lectureYoutubeUrl ?? "",
    attachment: editing?.attachment ?? "",
  });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const topics = lessons.find((l) => l.id === lessonId)?.topics ?? [];

  const upload = async (file: File) => {
    setUploading(true); setMsg("");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload?type=document", { method: "POST", body: fd });
    const d = await res.json();
    setUploading(false);
    if (res.ok && d.url) set("attachment", d.url);
    else setMsg(d.error || "Upload failed.");
  };

  const save = async () => {
    setMsg("");
    if (!f.topicId) return setMsg("Pick a lesson and topic.");
    if (!f.date || !f.timeFrom || !f.timeTo) return setMsg("Date and time are required.");
    setSaving(true);
    const res = editing
      ? await fetch(`/api/syllabus/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) })
      : await fetch("/api/syllabus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, sessionId }) });
    setSaving(false);
    if (res.ok) onSaved();
    else setMsg((await res.json()).error || "Failed to save.");
  };

  const ta = "border rounded-md px-3 py-2 text-sm w-full";
  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{editing ? "Edit Lesson-Plan Entry" : "Add Lesson-Plan Entry"}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={lblCls}>Lesson *</label>
          <select className={selCls} value={lessonId} onChange={(e) => { setLessonId(e.target.value); set("topicId", ""); }}>
            <option value="">Select Lesson</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={lblCls}>Topic *</label>
          <select className={selCls} value={f.topicId} disabled={!topics.length} onChange={(e) => set("topicId", e.target.value)}>
            <option value="">Select Topic</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={lblCls}>Date *</label>
          <input type="date" className={selCls} value={f.date} min={ymd(weekStart)} max={ymd(weekEnd)} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label className={lblCls}>From *</label>
          <input type="time" className={selCls} value={f.timeFrom} onChange={(e) => set("timeFrom", e.target.value)} />
        </div>
        <div>
          <label className={lblCls}>To *</label>
          <input type="time" className={selCls} value={f.timeTo} onChange={(e) => set("timeTo", e.target.value)} />
        </div>
        <div>
          <label className={lblCls}>Teacher</label>
          <select className={selCls} value={f.createdForId} onChange={(e) => set("createdForId", e.target.value)}>
            <option value="">— None —</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={lblCls}>Sub-topic</label><input className={ta} value={f.subTopic} onChange={(e) => set("subTopic", e.target.value)} /></div>
        <div><label className={lblCls}>Teaching method</label><input className={ta} value={f.teachingMethod} onChange={(e) => set("teachingMethod", e.target.value)} /></div>
        <div><label className={lblCls}>General objectives</label><textarea className={ta} rows={2} value={f.generalObjectives} onChange={(e) => set("generalObjectives", e.target.value)} /></div>
        <div><label className={lblCls}>Previous knowledge</label><textarea className={ta} rows={2} value={f.previousKnowledge} onChange={(e) => set("previousKnowledge", e.target.value)} /></div>
        <div><label className={lblCls}>Presentation</label><textarea className={ta} rows={2} value={f.presentation} onChange={(e) => set("presentation", e.target.value)} /></div>
        <div><label className={lblCls}>Comprehensive questions</label><textarea className={ta} rows={2} value={f.comprehensiveQuestions} onChange={(e) => set("comprehensiveQuestions", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={lblCls}>Lecture YouTube URL</label>
          <input className={ta} placeholder="https://youtube.com/…" value={f.lectureYoutubeUrl} onChange={(e) => set("lectureYoutubeUrl", e.target.value)} />
        </div>
        <div>
          <label className={lblCls}>Attachment</label>
          <div className="flex items-center gap-2">
            <input type="file" className="text-xs flex-1" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {uploading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
          {f.attachment && <a href={f.attachment} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-0.5 mt-1"><Paperclip className="h-3 w-3" />Uploaded file</a>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || uploading}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editing ? "Update Entry" : "Save Entry"}</Button>
        {msg && <span className="text-xs text-gray-600">{msg}</span>}
      </div>
    </div>
  );
}

// ── Shared editable list row ──────────────────────────────────────────────────
function EditableRow({
  value, subtitle, badge, onSave, onDelete,
}: {
  value: string; subtitle?: string; badge?: React.ReactNode;
  onSave: (v: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      {editing ? (
        <div className="flex gap-2 flex-1">
          <input className="border rounded px-2 py-1 text-sm flex-1" value={v} onChange={(e) => setV(e.target.value)} autoFocus />
          <button onClick={() => { onSave(v); setEditing(false); }} className="text-green-600 hover:bg-green-50 px-2 rounded"><Save className="h-4 w-4" /></button>
          <button onClick={() => { setV(value); setEditing(false); }} className="text-gray-400 hover:bg-gray-100 px-2 rounded"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm truncate">{value}</span>
            {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
            {badge}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-indigo-600 p-1"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </>
      )}
    </li>
  );
}
