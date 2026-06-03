import { render, screen } from "@testing-library/react";
import { DashboardStats } from "@/components/DashboardStats";

const stats = {
  totalStudents: 320,
  totalStaff: 28,
  presentToday: 295,
  absentToday: 25,
  collectedFees: 48500,
  pendingFees: 12000,
  upcomingExams: 3,
};

describe("DashboardStats", () => {
  it("renders total student count", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText("320")).toBeInTheDocument();
  });

  it("renders total staff count", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText("28")).toBeInTheDocument();
  });

  it("renders present and absent counts for today", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText("295")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders today attendance percentage", () => {
    render(<DashboardStats stats={stats} />);
    // 295 / 320 = 92.19%
    expect(screen.getByText(/92/)).toBeInTheDocument();
  });

  it("renders collected and pending fees", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText(/48,500/)).toBeInTheDocument();
    expect(screen.getByText(/12,000/)).toBeInTheDocument();
  });

  it("renders upcoming exams count", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.getByText(/students/i)).toBeInTheDocument();
    expect(screen.getByText(/staff/i)).toBeInTheDocument();
    expect(screen.getByText(/attendance/i)).toBeInTheDocument();
    expect(screen.getByText(/fees collected/i)).toBeInTheDocument();
    expect(screen.getByText(/exams/i)).toBeInTheDocument();
  });

  it("shows a warning indicator when absent count is high (>20% absent)", () => {
    const highAbsent = { ...stats, presentToday: 200, absentToday: 120 };
    render(<DashboardStats stats={highAbsent} />);
    expect(screen.getByTestId("attendance-warning")).toBeInTheDocument();
  });

  it("does not show attendance warning when absence is within normal range", () => {
    render(<DashboardStats stats={stats} />);
    expect(screen.queryByTestId("attendance-warning")).not.toBeInTheDocument();
  });
});
