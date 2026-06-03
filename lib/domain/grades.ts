export interface GradeRange {
  gradeLetter: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
}

export interface GradeResult {
  gradeLetter: string;
  gradePoint: number;
}

export function calculatePercentage(marks: number, maxMarks: number): number {
  if (maxMarks <= 0) throw new Error("maxMarks must be greater than 0");
  if (marks < 0) throw new Error("marks cannot be negative");
  if (marks > maxMarks) throw new Error("marks cannot exceed maxMarks");
  return Math.round((marks / maxMarks) * 100 * 100) / 100;
}

export function calculateGrade(
  percentage: number,
  scale: GradeRange[]
): GradeResult {
  if (scale.length === 0) throw new Error("grading scale cannot be empty");
  if (percentage < 0 || percentage > 100)
    throw new Error("percentage must be between 0 and 100");

  const range = scale.find(
    (r) => percentage >= r.minPercentage && percentage <= r.maxPercentage
  );

  if (!range) throw new Error(`no grade found for percentage: ${percentage}`);

  return { gradeLetter: range.gradeLetter, gradePoint: range.gradePoint };
}

export function calculateTotalMarks(
  theoryMarks: number,
  practicalMarks: number | null | undefined
): number {
  if (theoryMarks < 0) throw new Error("marks cannot be negative");
  if (practicalMarks != null && practicalMarks < 0)
    throw new Error("marks cannot be negative");
  return theoryMarks + (practicalMarks ?? 0);
}

export function isPassingGrade(
  totalMarks: number,
  passingMarks: number,
  maxMarks: number,
  percentageThreshold?: number
): boolean {
  if (totalMarks < passingMarks) return false;
  if (percentageThreshold != null) {
    const pct = calculatePercentage(totalMarks, maxMarks);
    if (pct < percentageThreshold) return false;
  }
  return true;
}
