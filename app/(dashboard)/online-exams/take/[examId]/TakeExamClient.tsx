"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Question = {
  id: string;
  question: string;
  questionType: string;
  level: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  wordLimit?: number;
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
  submittedAt?: string;
  score?: number;
  total?: number;
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
  class?: { name: string };
  questions: ExamQuestion[];
};

const TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ", TRUE_FALSE: "True/False", SHORT_ANSWER: "Short Answer", DESCRIPTIVE: "Descriptive",
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TakeExamClient({
  exam,
  studentId,
  existingAttempt,
}: {
  exam: Exam;
  studentId: string | null;
  existingAttempt: Attempt | null;
}) {
  const now = new Date();
  const submitted = !!existingAttempt?.submittedAt;
  const started = existingAttempt && !existingAttempt.submittedAt;

  const examNotPublished = !exam.isPublished;
  const examNotStarted = now < new Date(exam.startTime);
  const examEnded = now > new Date(exam.endTime);

  const [phase, setPhase] = useState<"intro" | "exam" | "result">(
    submitted ? "result" : started ? "exam" : "intro"
  );
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (existingAttempt) {
      const map: Record<string, any> = {};
      for (const a of existingAttempt.answers) {
        if (a.selectedIndex != null) map[a.questionId] = String(a.selectedIndex);
        else if (a.textAnswer) map[a.questionId] = a.textAnswer;
      }
      return map;
    }
    return {};
  });
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    submitted && existingAttempt.score != null
      ? { score: existingAttempt.score, total: existingAttempt.total! }
      : null
  );
  const autoSubmitRef = useRef(false);

  const questions = exam.questions;

  const submit = useCallback(
    async (isAuto = false) => {
      if (autoSubmitRef.current) return;
      autoSubmitRef.current = true;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/online-exams/${exam.id}/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit", answers }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResult({ score: data.score, total: data.total });
        setPhase("result");
        if (isAuto) alert("Time's up! Your exam has been auto-submitted.");
      } catch {
        alert("Failed to submit. Please try again.");
        autoSubmitRef.current = false;
      } finally {
        setSubmitting(false);
      }
    },
    [exam.id, answers]
  );

  // Countdown timer
  useEffect(() => {
    if (phase !== "exam") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          submit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, submit]);

  async function startExam() {
    if (!studentId) return alert("Only enrolled students can take exams");
    try {
      const res = await fetch(`/api/online-exams/${exam.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) throw new Error();
      setPhase("exam");
    } catch {
      alert("Failed to start exam");
    }
  }

  function setAnswer(questionId: string, value: any) {
    setAnswers((a) => ({ ...a, [questionId]: value }));
  }

  const answered = questions.filter(
    (eq) => answers[eq.questionId] != null && answers[eq.questionId] !== ""
  ).length;
  const timerRed = timeLeft < 60;

  // === INTRO SCREEN ===
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 space-y-4">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            {exam.class && <p className="text-sm text-gray-500">Class: {exam.class.name}</p>}

            {examNotPublished && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" /> Exam not published yet.
              </div>
            )}
            {examNotStarted && !examNotPublished && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <Clock className="h-4 w-4 shrink-0" />
                Exam starts: {new Date(exam.startTime).toLocaleString()}
              </div>
            )}
            {examEnded && (
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border rounded p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" /> This exam has ended.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold">{exam.duration} minutes</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500">Questions</p>
                <p className="font-semibold">{questions.length}</p>
              </div>
              {exam.passingPercentage && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Passing Mark</p>
                  <p className="font-semibold">{String(exam.passingPercentage)}%</p>
                </div>
              )}
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500">Ends</p>
                <p className="font-semibold text-xs">{new Date(exam.endTime).toLocaleString()}</p>
              </div>
            </div>

            {exam.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Instructions</p>
                <p>{exam.instructions}</p>
              </div>
            )}

            {!studentId && (
              <p className="text-sm text-red-500">You must be a registered student to take this exam.</p>
            )}

            <div className="flex gap-2">
              <Link href="/online-exams">
                <Button variant="outline">Back</Button>
              </Link>
              <Button
                className="flex-1"
                disabled={
                  !studentId || examNotPublished || examNotStarted || examEnded || questions.length === 0
                }
                onClick={startExam}
              >
                {questions.length === 0 ? "No questions yet" : "Start Exam"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === EXAM SCREEN ===
  if (phase === "exam") {
    const eq = questions[current];
    const q = eq.question;
    const options = [
      q.optionA && ["A", q.optionA, 0],
      q.optionB && ["B", q.optionB, 1],
      q.optionC && ["C", q.optionC, 2],
      q.optionD && ["D", q.optionD, 3],
      q.optionE && ["E", q.optionE, 4],
    ].filter(Boolean) as [string, string, number][];

    const isMCQ = q.questionType === "MCQ" || q.questionType === "TRUE_FALSE";
    const isText = q.questionType === "SHORT_ANSWER" || q.questionType === "DESCRIPTIVE";
    const currentAnswer = answers[q.id];

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top bar */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b shadow-sm ${
            timerRed ? "bg-red-50" : "bg-white"
          }`}
        >
          <div className="text-sm font-medium text-gray-700">{exam.title}</div>
          <div
            className={`flex items-center gap-2 font-mono text-lg font-bold ${
              timerRed ? "text-red-600" : "text-gray-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500">
            {answered}/{questions.length} answered
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-0">
          {/* Question navigator sidebar */}
          <div className="lg:w-48 p-4 bg-white border-r shrink-0">
            <p className="text-xs font-medium text-gray-500 mb-2">Questions</p>
            <div className="flex flex-wrap gap-1.5 lg:flex-col">
              {questions.map((eq, i) => {
                const ans = answers[eq.questionId];
                const done = ans != null && ans !== "";
                return (
                  <button
                    key={eq.questionId}
                    onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      i === current
                        ? "bg-blue-600 text-white"
                        : done
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main question area */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-gray-400">
                  Question {current + 1} of {questions.length}
                </span>
                <Badge variant="outline" className="text-xs">{TYPE_LABELS[q.questionType]}</Badge>
                <span className="text-xs text-gray-400">{eq.marks} mark{eq.marks !== 1 ? "s" : ""}</span>
              </div>

              <p className="text-base font-medium text-gray-900 mb-6 leading-relaxed">{q.question}</p>

              {isMCQ && (
                <div className="space-y-2">
                  {options.map(([label, text, idx]) => {
                    const selected = currentAnswer === String(idx);
                    return (
                      <button
                        key={label}
                        onClick={() => setAnswer(q.id, String(idx))}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-800"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <span className="font-medium">{label}.</span> {text}
                      </button>
                    );
                  })}
                </div>
              )}

              {isText && (
                <textarea
                  value={currentAnswer ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  rows={q.questionType === "DESCRIPTIVE" ? 8 : 4}
                  placeholder={
                    q.questionType === "SHORT_ANSWER"
                      ? "Enter your short answer…"
                      : "Write your answer here…"
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              )}
              {isText && q.wordLimit && (
                <p className="text-xs text-gray-400 mt-1">Word limit: {q.wordLimit}</p>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between mt-8">
                <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {current < questions.length - 1 ? (
                  <Button onClick={() => setCurrent((c) => c + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (
                        !confirm(
                          `Submit exam? You've answered ${answered} of ${questions.length} questions.`
                        )
                      )
                        return;
                      submit(false);
                    }}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? "Submitting…" : "Submit Exam"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === RESULT SCREEN ===
  const pct = result && result.total ? Math.round((result.score / result.total) * 100) : null;
  const passing = exam.passingPercentage ? Number(exam.passingPercentage) : 50;
  const passed = pct != null && pct >= passing;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <CheckCircle className="h-10 w-10 text-green-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-red-500" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-1">
              {passed ? "Congratulations!" : "Better luck next time"}
            </h2>
            <p className="text-gray-500 text-sm">{exam.title}</p>
          </div>

          {result && (
            <div className="space-y-2">
              <p className="text-5xl font-bold text-gray-900">{pct}%</p>
              <p className="text-gray-500">
                Score: {result.score} / {result.total}
              </p>
              <span
                className={`inline-block text-sm px-4 py-1 rounded-full font-medium ${
                  passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {passed ? "PASSED" : "FAILED"}
              </span>
              {exam.passingPercentage && (
                <p className="text-xs text-gray-400">
                  Passing mark: {String(exam.passingPercentage)}%
                </p>
              )}
            </div>
          )}

          {exam.questions.some((eq) =>
            ["DESCRIPTIVE", "SHORT_ANSWER"].includes(eq.question.questionType)
          ) && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
              Descriptive / short-answer questions require manual grading. Your final score may change.
            </p>
          )}

          <Link href="/online-exams">
            <Button className="w-full">Back to Exams</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
