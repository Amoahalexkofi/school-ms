"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Search, Plus, Trash2, Send, CheckCircle, Clock, Users, BookOpen,
} from "lucide-react";

type Question = {
  id: string;
  question: string;
  questionType: string;
  level: string;
  correctAnswer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  subject?: { id: string; name: string };
  class?: { id: string; name: string };
};

type ExamQuestion = {
  id: string;
  questionId: string;
  marks: number;
  order: number;
  question: Question;
};

type Attempt = {
  id: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  total?: number;
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  answers: { questionId: string; selectedIndex?: number; textAnswer?: string; isCorrect: boolean }[];
};

type Exam = {
  id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  passingPercentage?: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  instructions?: string;
  class?: { id: string; name: string };
  questions: ExamQuestion[];
  attempts: Attempt[];
};

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

const LEVEL_COLORS: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HARD: "bg-red-500/10 text-red-400",
};
const TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ", TRUE_FALSE: "True/False", SHORT_ANSWER: "Short Answer", DESCRIPTIVE: "Descriptive",
};

export function ExamDetailClient({
  exam: initial,
  allQuestions,
}: {
  exam: Exam;
  allQuestions: Question[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}) {
  const [exam, setExam] = useState<Exam>(initial);
  const [tab, setTab] = useState<"questions" | "results">("questions");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const addedIds = useMemo(() => new Set(exam.questions.map((eq) => eq.questionId)), [exam.questions]);

  const bankFiltered = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchSearch =
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        (q.subject?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchType = filterType === "all" || q.questionType === filterType;
      return matchSearch && matchType;
    });
  }, [allQuestions, search, filterType]);

  async function addQuestion(questionId: string) {
    setAddingId(questionId);
    try {
      const res = await fetch(`/api/online-exams/${exam.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, marks: 1 }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to add question");
        return;
      }
      const eq = await res.json();
      const q = allQuestions.find((q) => q.id === questionId)!;
      setExam((e) => ({
        ...e,
        totalQuestions: e.totalQuestions + 1,
        questions: [...e.questions, { ...eq, question: q }],
      }));
    } catch {
      alert("Failed");
    } finally {
      setAddingId(null);
    }
  }

  async function removeQuestion(questionId: string) {
    setRemovingId(questionId);
    try {
      await fetch(`/api/online-exams/${exam.id}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      setExam((e) => ({
        ...e,
        totalQuestions: e.totalQuestions - 1,
        questions: e.questions.filter((eq) => eq.questionId !== questionId),
      }));
    } catch {
      alert("Failed");
    } finally {
      setRemovingId(null);
    }
  }

  async function togglePublish() {
    try {
      const res = await fetch(`/api/online-exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !exam.isPublished }),
      });
      if (!res.ok) throw new Error();
      setExam((e) => ({ ...e, isPublished: !e.isPublished }));
    } catch {
      alert("Failed");
    }
  }

  const now = new Date();
  const status = !exam.isPublished
    ? "Draft"
    : now < new Date(exam.startTime)
    ? "Upcoming"
    : now > new Date(exam.endTime)
    ? "Ended"
    : "Live";

  const statusColor = {
    Draft: "bg-white/[0.04] text-white/50",
    Upcoming: "bg-blue-500/10 text-blue-400",
    Live: "bg-emerald-500/10 text-emerald-400",
    Ended: "bg-white/[0.04] text-white/50",
  }[status];

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <Link href="/online-exams">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{exam.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{status}</span>
            {exam.class && <span className="text-xs text-white/40">{exam.class.name}</span>}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-white/40 mt-1">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.duration} min</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {exam.totalQuestions} questions</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {exam.attempts.length} attempts</span>
            {exam.passingPercentage && <span>Passing: {String(exam.passingPercentage)}%</span>}
          </div>
          {exam.instructions && <p className="text-sm text-white/40 mt-1">{exam.instructions}</p>}
          <div className="flex gap-2 text-xs text-white/30 mt-1">
            <span>Start: {new Date(exam.startTime).toLocaleString()}</span>
            <span>·</span>
            <span>End: {new Date(exam.endTime).toLocaleString()}</span>
          </div>
        </div>
        <Button onClick={togglePublish} variant={exam.isPublished ? "outline" : "default"} size="sm">
          <Send className="h-4 w-4 mr-1" />
          {exam.isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["questions", "results"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-400"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            {t === "questions"
              ? `Questions (${exam.questions.length})`
              : `Results (${exam.attempts.filter((a) => a.submittedAt).length})`}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current exam questions */}
          <div>
            <h3 className="font-semibold text-sm text-white/60 mb-3">In This Exam</h3>
            {exam.questions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-white/30">
                  No questions added yet. Pick from the bank →
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {exam.questions.map((eq, i) => (
                  <div key={eq.id} className="bg-[#111318] border rounded-lg p-3 flex gap-3 items-start">
                    <span className="text-xs text-white/30 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{eq.question.question}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[eq.question.questionType]}</Badge>
                        <span className={`text-xs px-1.5 rounded ${LEVEL_COLORS[eq.question.level]}`}>{eq.question.level}</span>
                        <span className="text-xs text-white/30">{eq.marks} mark{eq.marks !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removingId === eq.questionId}
                      onClick={() => removeQuestion(eq.questionId)}
                      className="text-red-400 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-white/30 text-right">
                  Total marks: {exam.questions.reduce((s, eq) => s + eq.marks, 0)}
                </p>
              </div>
            )}
          </div>

          {/* Question bank picker */}
          <div>
            <h3 className="font-semibold text-sm text-white/60 mb-3">Question Bank</h3>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                className={SEL + " w-32"}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                {["MCQ", "TRUE_FALSE", "SHORT_ANSWER", "DESCRIPTIVE"].map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {bankFiltered.length === 0 ? (
              <div className="text-center py-8 text-sm text-white/30">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>
                  No questions match.{" "}
                  <Link href="/online-exams/questions" className="text-blue-500 hover:underline">
                    Add to bank
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {bankFiltered.map((q) => {
                  const added = addedIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`bg-[#111318] border rounded-lg p-3 flex gap-3 items-start ${added ? "opacity-50" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{q.question}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{TYPE_LABELS[q.questionType]}</Badge>
                          <span className={`text-xs px-1.5 rounded ${LEVEL_COLORS[q.level]}`}>{q.level}</span>
                          {q.subject && <span className="text-xs text-white/30">{q.subject.name}</span>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={added ? "outline" : "default"}
                        disabled={added || addingId === q.id}
                        onClick={() => !added && addQuestion(q.id)}
                        className="shrink-0"
                      >
                        {added ? <CheckCircle className="h-4 w-4" /> : addingId === q.id ? "…" : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-4">
          {exam.attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-white/30">No attempts yet.</CardContent>
            </Card>
          ) : (
            <>
              <div className="bg-[#111318] border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f1015] border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Student</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Admission No</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Submitted</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">Score</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">%</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {exam.attempts.map((a) => {
                      const pct = a.total ? Math.round(((a.score ?? 0) / a.total) * 100) : null;
                      const passing = exam.passingPercentage ? Number(exam.passingPercentage) : 50;
                      const passed = pct != null && pct >= passing;
                      return (
                        <tr key={a.id} className="hover:bg-[#0f1015]">
                          <td className="px-4 py-3 font-medium">
                            {a.student.firstName} {a.student.lastName}
                          </td>
                          <td className="px-4 py-3 text-white/40">{a.student.admissionNo}</td>
                          <td className="px-4 py-3 text-white/40 text-xs">
                            {a.submittedAt ? (
                              new Date(a.submittedAt).toLocaleString()
                            ) : (
                              <span className="text-yellow-400">In progress</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.submittedAt ? `${a.score ?? 0}/${a.total ?? 0}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {pct != null ? `${pct}%` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.submittedAt && pct != null ? (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {passed ? "Pass" : "Fail"}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {exam.questions.some((eq) =>
                ["DESCRIPTIVE", "SHORT_ANSWER"].includes(eq.question.questionType)
              ) && (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                  This exam contains short answer / descriptive questions that require manual grading.
                  Scores shown are for auto-graded questions only.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
