"use client";

import { useState } from "react";

interface ExamSchedule {
  id: string;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  hasPractical: boolean;
}

interface SubmitMarksPayload {
  examScheduleId: string;
  studentId: string;
  theoryMarks: number;
  practicalMarks?: number;
}

interface Props {
  examSchedule: ExamSchedule;
  studentId: string;
  onSubmit: (payload: SubmitMarksPayload) => Promise<void>;
}

export function MarkEntryForm({ examSchedule, studentId, onSubmit }: Props) {
  const [theory, setTheory] = useState("");
  const [practical, setPractical] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const theoryVal = parseFloat(theory);
    const practicalVal = practical !== "" ? parseFloat(practical) : undefined;

    if (theoryVal < 0 || (practicalVal !== undefined && practicalVal < 0)) {
      setError("Marks cannot be negative");
      return;
    }

    const total = theoryVal + (practicalVal ?? 0);
    if (total > examSchedule.maxMarks) {
      setError(`Total marks cannot exceed ${examSchedule.maxMarks}`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        examScheduleId: examSchedule.id,
        studentId,
        theoryMarks: theoryVal,
        practicalMarks: practicalVal,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{examSchedule.subjectName}</h3>
      <p>Max {examSchedule.maxMarks} | Pass {examSchedule.passingMarks}</p>

      {error && <div role="alert">{error}</div>}

      <div>
        <label htmlFor="theory-marks">Theory Marks</label>
        <input
          id="theory-marks"
          type="number"
          value={theory}
          onChange={(e) => setTheory(e.target.value)}
          required
        />
      </div>

      {examSchedule.hasPractical && (
        <div>
          <label htmlFor="practical-marks">Practical Marks</label>
          <input
            id="practical-marks"
            type="number"
            min={0}
            value={practical}
            onChange={(e) => setPractical(e.target.value)}
          />
        </div>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save Marks"}
      </button>
    </form>
  );
}
