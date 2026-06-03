"use client";

import { useState } from "react";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "HOLIDAY";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

interface MarkAttendancePayload {
  sectionId: string;
  sessionId: string;
  date: Date;
  records: AttendanceRecord[];
}

interface Props {
  students: Student[];
  sectionId: string;
  sessionId: string;
  date: Date;
  onSubmit: (payload: MarkAttendancePayload) => Promise<void>;
}

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "HALF_DAY"];

export function AttendanceForm({ students, sectionId, sessionId, date, onSubmit }: Props) {
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>(
    () => Object.fromEntries(students.map((s) => [s.id, "PRESENT"]))
  );
  const [submitting, setSubmitting] = useState(false);

  function markAll(status: AttendanceStatus) {
    setStatusMap(Object.fromEntries(students.map((s) => [s.id, status])));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        sectionId,
        sessionId,
        date,
        records: students.map((s) => ({ studentId: s.id, status: statusMap[s.id] })),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={() => markAll("PRESENT")}>
        Mark All Present
      </button>

      <table>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{`${student.firstName} ${student.lastName}`}</td>
              {STATUSES.map((status) => (
                <td key={status}>
                  <label>
                    <input
                      type="radio"
                      name={`status-${student.id}`}
                      value={status}
                      checked={statusMap[student.id] === status}
                      onChange={() =>
                        setStatusMap((prev) => ({ ...prev, [student.id]: status }))
                      }
                      aria-label={status.charAt(0) + status.slice(1).toLowerCase()}
                    />
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save Attendance"}
      </button>
    </form>
  );
}
