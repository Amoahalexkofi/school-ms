interface Result {
  id: string;
  subject: { name: string; code: string };
  theoryMarks: number;
  practicalMarks: number | null;
  totalMarks: number;
  grade: string;
  isPassed: boolean;
  examSchedule: { maxMarks: number; passingMarks: number };
}

interface Props {
  results: Result[];
}

export function ResultsTable({ results }: Props) {
  if (results.length === 0) {
    return <p>No results available</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Subject</th>
          <th scope="col">Marks</th>
          <th scope="col">Grade</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => {
          const percentage = Math.round(
            (r.totalMarks / r.examSchedule.maxMarks) * 100
          );
          return (
            <tr key={r.id}>
              <td>{r.subject.name}</td>
              <td>
                <span>{r.totalMarks}</span>
                {" / "}
                {r.examSchedule.maxMarks}
                {r.practicalMarks !== null && r.practicalMarks !== undefined && (
                  <>
                    {" ("}
                    <span>{r.theoryMarks}</span>
                    {" + "}
                    <span>{r.practicalMarks}</span>
                    {")"}
                  </>
                )}
                {" — "}
                <span>{percentage}%</span>
              </td>
              <td>{r.grade}</td>
              <td>
                <span>{r.isPassed ? "PASS" : "FAIL"}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
