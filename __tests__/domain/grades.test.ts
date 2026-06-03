import {
  calculateGrade,
  calculatePercentage,
  calculateTotalMarks,
  isPassingGrade,
  type GradeRange,
} from "@/lib/domain/grades";

const STANDARD_SCALE: GradeRange[] = [
  { gradeLetter: "A+", minPercentage: 90, maxPercentage: 100, gradePoint: 4.0 },
  { gradeLetter: "A",  minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7 },
  { gradeLetter: "B+", minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.3 },
  { gradeLetter: "B",  minPercentage: 60, maxPercentage: 69.99, gradePoint: 3.0 },
  { gradeLetter: "C",  minPercentage: 50, maxPercentage: 59.99, gradePoint: 2.0 },
  { gradeLetter: "F",  minPercentage: 0,  maxPercentage: 49.99, gradePoint: 0.0 },
];

describe("calculatePercentage", () => {
  it("returns the correct percentage of marks obtained", () => {
    expect(calculatePercentage(85, 100)).toBe(85);
  });

  it("rounds to two decimal places", () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it("returns 100 when marks equal maxMarks", () => {
    expect(calculatePercentage(50, 50)).toBe(100);
  });

  it("returns 0 when marks are 0", () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it("throws when maxMarks is 0 or negative", () => {
    expect(() => calculatePercentage(10, 0)).toThrow("maxMarks must be greater than 0");
    expect(() => calculatePercentage(10, -5)).toThrow("maxMarks must be greater than 0");
  });

  it("throws when marks exceed maxMarks", () => {
    expect(() => calculatePercentage(110, 100)).toThrow("marks cannot exceed maxMarks");
  });

  it("throws when marks are negative", () => {
    expect(() => calculatePercentage(-5, 100)).toThrow("marks cannot be negative");
  });
});

describe("calculateGrade", () => {
  it("returns A+ for 95%", () => {
    expect(calculateGrade(95, STANDARD_SCALE)).toEqual({
      gradeLetter: "A+",
      gradePoint: 4.0,
    });
  });

  it("returns A for 85%", () => {
    expect(calculateGrade(85, STANDARD_SCALE)).toEqual({
      gradeLetter: "A",
      gradePoint: 3.7,
    });
  });

  it("returns F for 40%", () => {
    expect(calculateGrade(40, STANDARD_SCALE)).toEqual({
      gradeLetter: "F",
      gradePoint: 0.0,
    });
  });

  it("returns A+ for exactly 90%", () => {
    expect(calculateGrade(90, STANDARD_SCALE)).toEqual({
      gradeLetter: "A+",
      gradePoint: 4.0,
    });
  });

  it("returns A for exactly 89.99%", () => {
    expect(calculateGrade(89.99, STANDARD_SCALE)).toEqual({
      gradeLetter: "A",
      gradePoint: 3.7,
    });
  });

  it("throws when scale is empty", () => {
    expect(() => calculateGrade(75, [])).toThrow("grading scale cannot be empty");
  });

  it("throws for percentage out of range 0-100", () => {
    expect(() => calculateGrade(-1, STANDARD_SCALE)).toThrow();
    expect(() => calculateGrade(101, STANDARD_SCALE)).toThrow();
  });
});

describe("calculateTotalMarks", () => {
  it("sums theory and practical marks", () => {
    expect(calculateTotalMarks(60, 30)).toBe(90);
  });

  it("returns theory marks when practical is undefined", () => {
    expect(calculateTotalMarks(75, undefined)).toBe(75);
  });

  it("returns theory marks when practical is null", () => {
    expect(calculateTotalMarks(75, null)).toBe(75);
  });

  it("throws when theory marks are negative", () => {
    expect(() => calculateTotalMarks(-1, 0)).toThrow("marks cannot be negative");
  });

  it("throws when practical marks are negative", () => {
    expect(() => calculateTotalMarks(70, -5)).toThrow("marks cannot be negative");
  });
});

describe("isPassingGrade", () => {
  it("returns true when totalMarks >= passingMarks", () => {
    expect(isPassingGrade(40, 40, 100)).toBe(true);
    expect(isPassingGrade(55, 40, 100)).toBe(true);
  });

  it("returns false when totalMarks < passingMarks", () => {
    expect(isPassingGrade(39, 40, 100)).toBe(false);
  });

  it("also checks percentage threshold when provided", () => {
    // 30/100 = 30%, below 33% threshold
    expect(isPassingGrade(30, 33, 100, 33)).toBe(false);
    // 50/100 = 50%, above 33% threshold — but marks < passing marks
    expect(isPassingGrade(50, 60, 100, 33)).toBe(false);
  });
});
