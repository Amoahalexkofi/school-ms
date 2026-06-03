import { render, screen } from "@testing-library/react";
import { ResultsTable } from "@/components/ResultsTable";

const results = [
  {
    id: "me-1",
    subject: { name: "Mathematics", code: "MATH" },
    theoryMarks: 72,
    practicalMarks: null,
    totalMarks: 72,
    grade: "B+",
    isPassed: true,
    examSchedule: { maxMarks: 100, passingMarks: 40 },
  },
  {
    id: "me-2",
    subject: { name: "English", code: "ENG" },
    theoryMarks: 35,
    practicalMarks: null,
    totalMarks: 35,
    grade: "F",
    isPassed: false,
    examSchedule: { maxMarks: 100, passingMarks: 40 },
  },
  {
    id: "me-3",
    subject: { name: "Science", code: "SCI" },
    theoryMarks: 55,
    practicalMarks: 20,
    totalMarks: 75,
    grade: "B+",
    isPassed: true,
    examSchedule: { maxMarks: 100, passingMarks: 40 },
  },
];

describe("ResultsTable", () => {
  it("renders a row for each result", () => {
    render(<ResultsTable results={results} />);
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("renders grade for each subject", () => {
    render(<ResultsTable results={results} />);
    const bPlusGrades = screen.getAllByText("B+");
    expect(bPlusGrades).toHaveLength(2);
    expect(screen.getByText("F")).toBeInTheDocument();
  });

  it("renders total marks for each subject", () => {
    render(<ResultsTable results={results} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("shows a PASS badge for passing subjects", () => {
    render(<ResultsTable results={results} />);
    const passBadges = screen.getAllByText("PASS");
    expect(passBadges).toHaveLength(2);
  });

  it("shows a FAIL badge for failing subjects", () => {
    render(<ResultsTable results={results} />);
    expect(screen.getByText("FAIL")).toBeInTheDocument();
  });

  it("renders percentage for each subject", () => {
    render(<ResultsTable results={results} />);
    expect(screen.getByText("72%")).toBeInTheDocument(); // 72/100
    expect(screen.getByText("35%")).toBeInTheDocument(); // 35/100
    expect(screen.getByText("75%")).toBeInTheDocument(); // 75/100
  });

  it("shows an empty state message when there are no results", () => {
    render(<ResultsTable results={[]} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("shows both theory and practical marks when practical is present", () => {
    render(<ResultsTable results={results} />);
    // Science: 55 theory + 20 practical
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<ResultsTable results={results} />);
    expect(screen.getByRole("columnheader", { name: /subject/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /marks/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /grade/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument();
  });
});
