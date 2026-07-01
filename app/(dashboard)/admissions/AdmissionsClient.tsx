"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Eye, UserPlus, MessageSquarePlus, RotateCcw } from "lucide-react";

type App = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  classAppliedFor: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
  enrolledStudentId?: string | null;
  createdAt: string;
};

const STATUS_CHIP: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

function StatusIcon({ status, enrolled }: { status: string; enrolled: boolean }) {
  if (enrolled) return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  if (status === "APPROVED") return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  if (status === "REJECTED") return <XCircle className="h-5 w-5 text-rose-500" />;
  if (status === "REVIEWED") return <Eye className="h-5 w-5 text-blue-500" />;
  return <Clock className="h-5 w-5 text-amber-500" />;
}

export function AdmissionsClient({ applications }: { applications: App[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function review(id: string, status: "REVIEWED" | "APPROVED" | "REJECTED" | "PENDING", reviewNote?: string) {
    setBusyId(id); setError("");
    try {
      const res = await fetch("/api/admissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reviewNote: reviewNote || undefined }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to update");
      setNoteFor(null); setNote("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (applications.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-10">No applications received yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>
      )}
      {applications.map((app) => {
        const enrolled = !!app.enrolledStudentId;
        const busy = busyId === app.id;
        const fullName = `${app.firstName} ${app.lastName}`.trim();
        return (
          <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <p className="font-semibold text-slate-900">{fullName}</p>
                  {enrolled ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3 w-3" /> Enrolled
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CHIP[app.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {app.status}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-slate-500 tabular-nums">
                  <span>DOB: {new Date(app.dateOfBirth).toLocaleDateString()}</span>
                  <span>Gender: {app.gender}</span>
                  <span>Class: {app.classAppliedFor}</span>
                  <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-1.5 text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Parent:</span> {app.parentName} · {app.parentPhone}
                  {app.parentEmail && <span> · {app.parentEmail}</span>}
                </div>
                {app.address && <p className="text-xs text-slate-500 mt-0.5">Address: {app.address}</p>}
                {app.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{app.notes}</p>}
                {app.reviewNote && (
                  <p className={`text-xs mt-1.5 px-2 py-1 rounded ${
                    app.status === "REJECTED" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"
                  }`}>
                    Review note: {app.reviewNote}
                  </p>
                )}
              </div>
              <div className="shrink-0"><StatusIcon status={app.status} enrolled={enrolled} /></div>
            </div>

            {/* Optional review note input */}
            {noteFor === app.id && (
              <textarea
                autoFocus
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (shown with the decision)…"
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 transition-all resize-none"
              />
            )}

            {/* Actions */}
            {!enrolled && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                {app.status === "APPROVED" && (
                  <Link
                    href={`/students/new?applicationId=${app.id}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-semibold transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Enroll as student
                  </Link>
                )}
                {(app.status === "PENDING" || app.status === "REVIEWED") && (
                  <button
                    disabled={busy}
                    onClick={() => review(app.id, "APPROVED", noteFor === app.id ? note : undefined)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {app.status === "PENDING" && (
                  <button
                    disabled={busy}
                    onClick={() => review(app.id, "REVIEWED", noteFor === app.id ? note : undefined)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> Mark reviewed
                  </button>
                )}
                {app.status !== "REJECTED" && (
                  <button
                    disabled={busy}
                    onClick={() => review(app.id, "REJECTED", noteFor === app.id ? note : undefined)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                {app.status === "REJECTED" && (
                  <button
                    disabled={busy}
                    onClick={() => review(app.id, "PENDING")}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Re-open
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setNoteFor(noteFor === app.id ? null : app.id); setNote(app.reviewNote ?? ""); }}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[12.5px] font-medium transition-colors ml-auto"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" /> {noteFor === app.id ? "Hide note" : "Note"}
                </button>
              </div>
            )}

            {enrolled && app.enrolledStudentId && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  href={`/students/${app.enrolledStudentId}`}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View student <UserPlus className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
