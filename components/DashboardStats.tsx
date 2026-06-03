interface Stats {
  totalStudents: number;
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  collectedFees: number;
  pendingFees: number;
  upcomingExams: number;
}

interface Props {
  stats: Stats;
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function DashboardStats({ stats }: Props) {
  const total = stats.presentToday + stats.absentToday;
  const attendancePct = total > 0 ? Math.round((stats.presentToday / total) * 100) : 0;
  const absenceRate = total > 0 ? stats.absentToday / total : 0;
  const highAbsence = absenceRate > 0.2;

  return (
    <div>
      <dl>
        <div>
          <dt>Students</dt>
          <dd>{stats.totalStudents}</dd>
        </div>

        <div>
          <dt>Staff</dt>
          <dd>{stats.totalStaff}</dd>
        </div>

        <div>
          <dt>Attendance Today</dt>
          <dd>
            <span>{stats.presentToday}</span>
            {" present / "}
            <span>{stats.absentToday}</span>
            {" absent — "}
            <span>{attendancePct}%</span>
          </dd>
          {highAbsence && (
            <span data-testid="attendance-warning" role="status">
              High absence rate today
            </span>
          )}
        </div>

        <div>
          <dt>Fees Collected</dt>
          <dd>{fmt(stats.collectedFees)}</dd>
          <dt>Fees Pending</dt>
          <dd>{fmt(stats.pendingFees)}</dd>
        </div>

        <div>
          <dt>Upcoming Exams</dt>
          <dd>{stats.upcomingExams}</dd>
        </div>
      </dl>
    </div>
  );
}
