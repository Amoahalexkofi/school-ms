import {
  submitMarks,
  getStudentResults,
  type SubmitMarksInput,
} from "@/lib/services/marks";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    markEntry: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    examSchedule: {
      findUnique: jest.fn(),
    },
    gradingScale: {
      findFirst: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

const schedule = {
  id: "sched-1",
  maxMarks: 100,
  passingMarks: 40,
  subjectId: "subj-1",
};

const scale = {
  grades: [
    { gradeLetter: "A+", minPercentage: 90, maxPercentage: 100, gradePoint: 4.0 },
    { gradeLetter: "A",  minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7 },
    { gradeLetter: "B",  minPercentage: 60, maxPercentage: 79.99, gradePoint: 3.0 },
    { gradeLetter: "F",  minPercentage: 0,  maxPercentage: 59.99, gradePoint: 0.0 },
  ],
};

const validInput: SubmitMarksInput = {
  examScheduleId: "sched-1",
  studentId: "stu-1",
  theoryMarks: 72,
};

describe("submitMarks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("upserts a mark entry with auto-calculated grade and pass status", async () => {
    (mock.examSchedule.findUnique as jest.Mock).mockResolvedValue(schedule);
    (mock.gradingScale.findFirst as jest.Mock).mockResolvedValue(scale);
    (mock.markEntry.upsert as jest.Mock).mockResolvedValue({
      id: "me-1",
      totalMarks: 72,
      grade: "B",
      isPassed: true,
    });

    const result = await submitMarks(validInput);

    expect(result.grade).toBe("B");
    expect(result.isPassed).toBe(true);
    expect(mock.markEntry.upsert).toHaveBeenCalledTimes(1);

    const upsertArg = (mock.markEntry.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertArg.create.grade).toBe("B");
    expect(upsertArg.create.isPassed).toBe(true);
    expect(upsertArg.create.totalMarks.toString()).toBe("72");
  });

  it("sums theory and practical marks for total", async () => {
    (mock.examSchedule.findUnique as jest.Mock).mockResolvedValue({
      ...schedule,
      maxMarks: 100,
      passingMarks: 40,
    });
    (mock.gradingScale.findFirst as jest.Mock).mockResolvedValue(scale);
    (mock.markEntry.upsert as jest.Mock).mockResolvedValue({
      totalMarks: 85,
      grade: "A",
      isPassed: true,
    });

    await submitMarks({ ...validInput, theoryMarks: 60, practicalMarks: 25 });

    const upsertArg = (mock.markEntry.upsert as jest.Mock).mock.calls[0][0];
    expect(Number(upsertArg.create.totalMarks)).toBe(85);
  });

  it("marks as failed when below passing marks", async () => {
    (mock.examSchedule.findUnique as jest.Mock).mockResolvedValue(schedule);
    (mock.gradingScale.findFirst as jest.Mock).mockResolvedValue(scale);
    (mock.markEntry.upsert as jest.Mock).mockResolvedValue({
      totalMarks: 30,
      grade: "F",
      isPassed: false,
    });

    await submitMarks({ ...validInput, theoryMarks: 30 });

    const upsertArg = (mock.markEntry.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertArg.create.isPassed).toBe(false);
    expect(upsertArg.create.grade).toBe("F");
  });

  it("throws when marks exceed maxMarks", async () => {
    (mock.examSchedule.findUnique as jest.Mock).mockResolvedValue(schedule);

    await expect(
      submitMarks({ ...validInput, theoryMarks: 110 })
    ).rejects.toThrow("marks cannot exceed maxMarks");
  });

  it("throws when exam schedule is not found", async () => {
    (mock.examSchedule.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(submitMarks(validInput)).rejects.toThrow("exam schedule not found");
  });
});

describe("getStudentResults", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all mark entries for a student in an exam group", async () => {
    (mock.markEntry.findMany as jest.Mock).mockResolvedValue([
      {
        id: "me-1",
        totalMarks: 85,
        grade: "A",
        isPassed: true,
        subject: { name: "Mathematics", code: "MATH" },
        examSchedule: { maxMarks: 100, passingMarks: 40 },
      },
      {
        id: "me-2",
        totalMarks: 55,
        grade: "F",
        isPassed: false,
        subject: { name: "English", code: "ENG" },
        examSchedule: { maxMarks: 100, passingMarks: 40 },
      },
    ]);

    const results = await getStudentResults("stu-1", "group-1");

    expect(results).toHaveLength(2);
    expect(results[0].grade).toBe("A");
    expect(results[1].isPassed).toBe(false);
  });

  it("returns empty array when student has no results", async () => {
    (mock.markEntry.findMany as jest.Mock).mockResolvedValue([]);
    const results = await getStudentResults("stu-99", "group-1");
    expect(results).toHaveLength(0);
  });
});
