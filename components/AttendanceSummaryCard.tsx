interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
  totalSchoolDays: number;
  percentage: number;
}

interface Props {
  summary: AttendanceSummary;
  threshold?: number;
}

export function AttendanceSummaryCard({ summary, threshold }: Props) {
  const isBelowThreshold = threshold !== undefined && summary.percentage < threshold;
  const colorClass = isBelowThreshold ? "attendance-low" : "attendance-good";

  return (
    <div className={colorClass}>
      <span>{summary.percentage}%</span>

      <dl>
        <dt>Present</dt>
        <dd>{summary.present}</dd>

        <dt>Absent</dt>
        <dd>{summary.absent}</dd>

        <dt>Late</dt>
        <dd>{summary.late}</dd>

        <dt>Total School Days</dt>
        <dd>{summary.totalSchoolDays}</dd>
      </dl>

      {isBelowThreshold && (
        <div role="alert">
          Attendance is below the {threshold}% threshold
        </div>
      )}
    </div>
  );
}
