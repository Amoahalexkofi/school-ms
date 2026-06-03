import { render, screen } from "@testing-library/react";
import { AttendanceSummaryCard } from "@/components/AttendanceSummaryCard";

const goodSummary = {
  present: 18,
  absent: 1,
  late: 1,
  halfDay: 0,
  holiday: 2,
  totalSchoolDays: 20,
  percentage: 95,
};

const lowSummary = {
  present: 10,
  absent: 8,
  late: 2,
  halfDay: 0,
  holiday: 0,
  totalSchoolDays: 20,
  percentage: 60,
};

describe("AttendanceSummaryCard", () => {
  it("renders the percentage prominently", () => {
    render(<AttendanceSummaryCard summary={goodSummary} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("renders present, absent, and late counts", () => {
    render(<AttendanceSummaryCard summary={goodSummary} />);
    expect(screen.getByText("18")).toBeInTheDocument(); // present
    // absent and late are both 1 — verify two elements with that value exist
    expect(screen.getAllByText("1")).toHaveLength(2);
  });

  it("shows a warning when attendance is below 75%", () => {
    render(<AttendanceSummaryCard summary={lowSummary} threshold={75} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/below.*threshold/i);
  });

  it("does not show a warning when attendance meets threshold", () => {
    render(<AttendanceSummaryCard summary={goodSummary} threshold={75} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders totalSchoolDays label", () => {
    render(<AttendanceSummaryCard summary={goodSummary} />);
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it("applies a green colour class for high attendance", () => {
    const { container } = render(
      <AttendanceSummaryCard summary={goodSummary} threshold={75} />
    );
    expect(container.firstChild).toHaveClass("attendance-good");
  });

  it("applies a red colour class for low attendance", () => {
    const { container } = render(
      <AttendanceSummaryCard summary={lowSummary} threshold={75} />
    );
    expect(container.firstChild).toHaveClass("attendance-low");
  });
});
