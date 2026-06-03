import { prisma } from "@/lib/prisma";
import { calculateGrade, calculatePercentage, calculateTotalMarks, isPassingGrade, type GradeRange } from "@/lib/domain/grades";

export interface SubmitMarksInput {
  examScheduleId: string;
  studentId: string;
  theoryMarks: number;
  practicalMarks?: number;
}

export async function submitMarks(input: SubmitMarksInput) {
  const schedule = await (prisma as any).examSchedule.findUnique({
    where: { id: input.examScheduleId },
  });
  if (!schedule) throw new Error("exam schedule not found");

  const total = calculateTotalMarks(input.theoryMarks, input.practicalMarks);

  // validates marks <= maxMarks
  calculatePercentage(total, schedule.maxMarks);

  const scale = await (prisma as any).gradingScale.findFirst({
    where: { isDefault: true },
    include: { grades: true },
  });

  const gradeRanges: GradeRange[] = (scale?.grades ?? []).map((g: any) => ({
    gradeLetter: g.gradeLetter,
    minPercentage: Number(g.minPercentage),
    maxPercentage: Number(g.maxPercentage),
    gradePoint: Number(g.gradePoint),
  }));

  const percentage = calculatePercentage(total, schedule.maxMarks);
  const { gradeLetter } = gradeRanges.length
    ? calculateGrade(percentage, gradeRanges)
    : { gradeLetter: null };

  const passed = isPassingGrade(total, schedule.passingMarks, schedule.maxMarks);

  return (prisma as any).markEntry.upsert({
    where: {
      examScheduleId_studentId: {
        examScheduleId: input.examScheduleId,
        studentId: input.studentId,
      },
    },
    create: {
      examScheduleId: input.examScheduleId,
      studentId: input.studentId,
      subjectId: schedule.subjectId,
      theoryMarks: input.theoryMarks,
      practicalMarks: input.practicalMarks ?? null,
      totalMarks: total,
      grade: gradeLetter,
      isPassed: passed,
    },
    update: {
      theoryMarks: input.theoryMarks,
      practicalMarks: input.practicalMarks ?? null,
      totalMarks: total,
      grade: gradeLetter,
      isPassed: passed,
    },
  });
}

export async function getStudentResults(studentId: string, examGroupId: string) {
  return (prisma as any).markEntry.findMany({
    where: {
      studentId,
      examSchedule: { examGroupId },
    },
    include: {
      subject: { select: { name: true, code: true } },
      examSchedule: { select: { maxMarks: true, passingMarks: true } },
    },
  });
}
