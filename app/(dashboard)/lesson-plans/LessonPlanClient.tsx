"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ScrollText, ListTree, BookOpen, Copy, Plus, X, Pencil, Trash2,
  CheckCircle2, Circle, Save, Loader2,
} from "lucide-react";

type Lookup = { id: string; name: string };
type Session = { id: string; session: string; isActive: boolean };
type ClassSection = { id: string; class: { name: string }; section: { name: string } };
type Subject = { id: string; name: string; code?: string | null };
type Topic = { id: string; name: string; status: boolean; completeDate: string | null };
type Lesson = { id: string; name: string; topics: Topic[] };

type Props = { classes: Lookup[]; sessions: Session[]; currentSessionId: string };

type Tab = "manage" | "lessons" | "topics" | "copy";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "manage",  label: "Manage Lesson Plan", icon: <ScrollText className="h-4 w-4" /> },
  { key: "lessons", label: "Lessons",            icon: <BookOpen className="h-4 w-4" /> },
  { key: "topics",  label: "Topics",             icon: <ListTree className="h-4 w-4" /> },
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

export function LessonPlanClient({ classes, sessions, currentSessionId }: Props) {
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
