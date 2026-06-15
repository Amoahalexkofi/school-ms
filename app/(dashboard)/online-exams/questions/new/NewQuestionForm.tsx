"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

const TYPES = ["MCQ", "TRUE_FALSE", "SHORT_ANSWER", "DESCRIPTIVE"] as const;
type QType = typeof TYPES[number];
const LEVELS = ["EASY", "MEDIUM", "HARD"] as const;
const TYPE_LABELS: Record<QType, string> = {
  MCQ: "Multiple Choice (MCQ)",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short Answer",
  DESCRIPTIVE: "Descriptive",
};

type Props = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
};

export function NewQuestionForm({ classes, subjects }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    questionType: "MCQ" as QType,
    level: "MEDIUM",
    classId: "",
    subjectId: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "A",
    wordLimit: "",
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const isMCQ = form.questionType === "MCQ";
  const isTF = form.questionType === "TRUE_FALSE";
  const hasOptions = isMCQ || isTF;
  const isDescriptive = ["SHORT_ANSWER", "DESCRIPTIVE"].includes(form.questionType);

  async function handleSubmit() {
    if (!form.question.trim()) { setError("Question text is required"); return; }
    setSaving(true);
    setError("");
    try {
      const payload: any = {
        questionType: form.questionType,
        level: form.level,
        question: form.question.trim(),
        correctAnswer: hasOptions ? form.correctAnswer : null,
        wordLimit: isDescriptive && form.wordLimit ? parseInt(form.wordLimit) : null,
        subjectId: form.subjectId || null,
        classId: form.classId || null,
      };
      if (isMCQ) {
        payload.optionA = form.optionA || null;
        payload.optionB = form.optionB || null;
        payload.optionC = form.optionC || null;
        payload.optionD = form.optionD || null;
        payload.optionE = form.optionE || null;
      }
      if (isTF) {
        payload.optionA = "True";
        payload.optionB = "False";
        payload.optionC = null;
        payload.optionD = null;
        payload.optionE = null;
      }

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save question");
      router.push("/online-exams/questions");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/online-exams/questions"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Question Bank
        </Link>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Question Type & Meta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-bold text-slate-900">Question Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Question Type</Label>
                <select className={SEL} value={form.questionType} onChange={set("questionType")}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Difficulty Level</Label>
                <select className={SEL} value={form.level} onChange={set("level")}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Class (optional)</Label>
                <select className={SEL} value={form.classId} onChange={set("classId")}>
                  <option value="">Any class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Subject (optional)</Label>
                <select className={SEL} value={form.subjectId} onChange={set("subjectId")}>
                  <option value="">Any subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] font-bold text-slate-900">Question Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Question Text *</Label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                placeholder="Enter the question text here…"
                value={form.question}
                onChange={set("question")}
              />
            </div>

            {/* MCQ Options */}
            {isMCQ && (
              <div>
                <Label className="text-xs mb-2 block">Answer Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D", "E"] as const).map((opt) => (
                    <div key={opt}>
                      <Label className="text-xs mb-1 block text-gray-500">Option {opt}</Label>
                      <Input
                        value={(form as any)[`option${opt}`]}
                        onChange={set(`option${opt}`)}
                        placeholder={`Option ${opt}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False display */}
            {isTF && (
              <div>
                <Label className="text-xs mb-2 block">Answer Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">A. True</div>
                  <div className="border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">B. False</div>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            {hasOptions && (
              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Correct Answer</Label>
                <select className={SEL} value={form.correctAnswer} onChange={set("correctAnswer")}>
                  {isTF
                    ? [["A", "True"], ["B", "False"]].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))
                    : ["A", "B", "C", "D", "E"].map((v) => (
                        <option key={v} value={v}>Option {v}</option>
                      ))}
                </select>
              </div>
            )}

            {/* Word Limit for descriptive/short answer */}
            {isDescriptive && (
              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Word Limit (optional)</Label>
                <Input
                  type="number"
                  value={form.wordLimit}
                  onChange={set("wordLimit")}
                  placeholder="e.g. 200"
                  className="max-w-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Link href="/online-exams/questions">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="button" disabled={saving} onClick={handleSubmit}>
            {saving ? "Saving…" : "Add Question"}
          </Button>
        </div>
      </div>
    </main>
  );
}
