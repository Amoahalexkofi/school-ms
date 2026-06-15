"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";

type Question = {
  id: string;
  questionType: string;
  level: string;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctAnswer?: string;
  wordLimit?: number;
  subject?: { id: string; name: string };
  class?: { id: string; name: string };
  isActive: boolean;
};

const TYPES = ["MCQ", "TRUE_FALSE", "SHORT_ANSWER", "DESCRIPTIVE"];
const LEVELS = ["EASY", "MEDIUM", "HARD"];
const LEVEL_COLORS: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HARD: "bg-red-500/10 text-red-400",
};
const TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ",
  TRUE_FALSE: "True/False",
  SHORT_ANSWER: "Short Answer",
  DESCRIPTIVE: "Descriptive",
};

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

const emptyEdit = {
  questionType: "MCQ",
  level: "MEDIUM",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  optionE: "",
  correctAnswer: "A",
  wordLimit: "",
  subjectId: "",
  classId: "",
};

export function QuestionsClient({
  questions: initial,
  classes,
  subjects,
}: {
  questions: Question[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState<any>(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || q.questionType === filterType;
      const matchLevel = filterLevel === "all" || q.level === filterLevel;
      return matchSearch && matchType && matchLevel;
    });
  }, [questions, search, filterType, filterLevel]);

  function openEdit(q: Question) {
    setEditing(q);
    setForm({
      questionType: q.questionType,
      level: q.level,
      question: q.question,
      optionA: q.optionA ?? "",
      optionB: q.optionB ?? "",
      optionC: q.optionC ?? "",
      optionD: q.optionD ?? "",
      optionE: q.optionE ?? "",
      correctAnswer: q.correctAnswer ?? "A",
      wordLimit: q.wordLimit ?? "",
      subjectId: q.subject?.id ?? "",
      classId: q.class?.id ?? "",
    });
    setEditOpen(true);
  }

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function saveEdit() {
    if (!form.question.trim()) return alert("Question text is required");
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = {
        questionType: form.questionType,
        level: form.level,
        question: form.question.trim(),
        correctAnswer: form.correctAnswer || null,
        wordLimit: form.wordLimit ? parseInt(form.wordLimit) : null,
        subjectId: form.subjectId || null,
        classId: form.classId || null,
      };
      if (["MCQ", "TRUE_FALSE"].includes(form.questionType)) {
        payload.optionA = form.optionA || null;
        payload.optionB = form.optionB || null;
        payload.optionC = form.optionC || null;
        payload.optionD = form.optionD || null;
        payload.optionE = form.optionE || null;
      }

      const res = await fetch(`/api/questions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setQuestions((qs) => qs.map((q) => (q.id === editing.id ? { ...q, ...updated } : q)));
      setEditOpen(false);
    } catch {
      alert("Failed to save question");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await fetch(`/api/questions/${id}`, { method: "DELETE" });
      setQuestions((qs) => qs.filter((q) => q.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  const isMCQ = form.questionType === "MCQ";
  const isTF = form.questionType === "TRUE_FALSE";
  const hasOptions = isMCQ || isTF;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
          <select className={SEL + " w-36"} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <select className={SEL + " w-32"} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <Link href="/online-exams/questions/new" className="shrink-0">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        </Link>
      </div>

      <p className="text-sm text-white/40">
        {filtered.length} question{filtered.length !== 1 ? "s" : ""} (total: {questions.length})
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No questions yet. Click "Add Question" to start building your bank.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div key={q.id} className="bg-[#111318] rounded-lg border p-4 flex gap-4 items-start">
              <span className="text-xs font-medium text-white/30 mt-1 w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 leading-snug">{q.question}</p>
                {["MCQ", "TRUE_FALSE"].includes(q.questionType) && (
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      ["A", q.optionA],
                      ["B", q.optionB],
                      ["C", q.optionC],
                      ["D", q.optionD],
                      ["E", q.optionE],
                    ]
                      .filter(([, v]) => v)
                      .map(([label, val]) => (
                        <p
                          key={label as string}
                          className={`text-xs ${q.correctAnswer?.toUpperCase() === label ? "text-emerald-400 font-semibold" : "text-white/40"}`}
                        >
                          {label}. {val}
                          {q.correctAnswer?.toUpperCase() === label && " ✓"}
                        </p>
                      ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[q.questionType]}</Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[q.level]}`}>{q.level}</span>
                  {q.subject && <span className="text-xs text-white/30">{q.subject.name}</span>}
                  {q.class && <span className="text-xs text-white/30">· {q.class.name}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(q)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(q.id)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog (kept for editing existing questions) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Question Type</Label>
              <select className={SEL} value={form.questionType} onChange={(e) => set("questionType", e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <Label>Difficulty Level</Label>
              <select className={SEL} value={form.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>Class (optional)</Label>
              <select className={SEL} value={form.classId} onChange={(e) => set("classId", e.target.value)}>
                <option value="">Any class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Subject (optional)</Label>
              <select className={SEL} value={form.subjectId} onChange={(e) => set("subjectId", e.target.value)}>
                <option value="">Any subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label>Question Text *</Label>
            <textarea
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              rows={3}
              placeholder="Enter the question…"
              className="w-full rounded-lg border border-white/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {hasOptions && !isTF && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="grid grid-cols-2 gap-2">
                {["A", "B", "C", "D", "E"].map((opt) => (
                  <div key={opt}>
                    <Label className="text-xs">Option {opt}</Label>
                    <Input
                      value={form[`option${opt}`]}
                      onChange={(e) => set(`option${opt}`, e.target.value)}
                      placeholder={`Option ${opt}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTF && (
            <div className="grid grid-cols-2 gap-2 text-sm text-white/40">
              <p className="border rounded p-2">A. True</p>
              <p className="border rounded p-2">B. False</p>
            </div>
          )}

          {hasOptions && (
            <div>
              <Label>Correct Answer</Label>
              <select className={SEL} value={form.correctAnswer} onChange={(e) => set("correctAnswer", e.target.value)}>
                {isTF
                  ? [["A", "True"], ["B", "False"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)
                  : ["A", "B", "C", "D", "E"].map((v) => <option key={v} value={v}>Option {v}</option>)
                }
              </select>
            </div>
          )}

          {["SHORT_ANSWER", "DESCRIPTIVE"].includes(form.questionType) && (
            <div>
              <Label>Word Limit (optional)</Label>
              <Input
                type="number"
                value={form.wordLimit}
                onChange={(e) => set("wordLimit", e.target.value)}
                placeholder="e.g. 200"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
