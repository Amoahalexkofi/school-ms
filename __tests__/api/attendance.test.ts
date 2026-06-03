import {
  markAttendance,
  getStudentAttendanceSummary,
  type MarkAttendanceInput,
} from "@/lib/services/attendance";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    attendanceDay: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    studentAttendance: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    studentEnrollment: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const today = new Date("2026-06-03");

const validInput: MarkAttendanceInput = {
  sectionId: "sec-1",
  sessionId: "sess-1",
  date: today,
  records: [
    { studentId: "stu-1", status: "PRESENT" },
    { studentId: "stu-2", status: "ABSENT" },
    { studentId: "stu-3", status: "LATE" },
  ],
};

describe("markAttendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("upserts an AttendanceDay and saves each student record", async () => {
    (mockPrisma.attendanceDay.upsert as jest.Mock).mockResolvedValue({
      id: "day-1",
    });
    (mockPrisma.studentAttendance.upsert as jest.Mock).mockResolvedValue({});

    await markAttendance(validInput);

    expect(mockPrisma.attendanceDay.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.studentAttendance.upsert).toHaveBeenCalledTimes(3);
  });

  it("passes correct status for each student to the upsert", async () => {
    (mockPrisma.attendanceDay.upsert as jest.Mock).mockResolvedValue({
      id: "day-1",
    });
    (mockPrisma.studentAttendance.upsert as jest.Mock).mockResolvedValue({});

    await markAttendance(validInput);

    const calls = (mockPrisma.studentAttendance.upsert as jest.Mock).mock.calls;
    const statuses = calls.map((c) => c[0].create.status);
    expect(statuses).toContain("PRESENT");
    expect(statuses).toContain("ABSENT");
    expect(statuses).toContain("LATE");
  });

  it("throws when records array is empty", async () => {
    await expect(
      markAttendance({ ...validInput, records: [] })
    ).rejects.toThrow("attendance records cannot be empty");
  });

  it("throws when sectionId is missing", async () => {
    await expect(
      markAttendance({ ...validInput, sectionId: "" })
    ).rejects.toThrow("sectionId is required");
  });

  it("throws when date is in the future", async () => {
    const future = new Date("2030-01-01");
    await expect(
      markAttendance({ ...validInput, date: future })
    ).rejects.toThrow("cannot mark attendance for a future date");
  });
});

describe("getStudentAttendanceSummary", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns summary with correct percentage", async () => {
    const day = { date: new Date("2026-06-01"), sectionId: "sec-1", sessionId: "sess-1" };
    (mockPrisma.studentAttendance.findMany as jest.Mock).mockResolvedValue([
      { status: "PRESENT", attendanceDay: day },
      { status: "PRESENT", attendanceDay: day },
      { status: "ABSENT",  attendanceDay: day },
      { status: "LATE",    attendanceDay: day },
    ]);

    const summary = await getStudentAttendanceSummary("stu-1", "sess-1");

    expect(summary.totalSchoolDays).toBe(4);
    expect(summary.present).toBe(2);
    expect(summary.absent).toBe(1);
    expect(summary.late).toBe(1);
    // (2 + 1) / 4 = 75%
    expect(summary.percentage).toBe(75);
  });

  it("returns zero summary when student has no attendance records", async () => {
    (mockPrisma.studentAttendance.findMany as jest.Mock).mockResolvedValue([] as never[]);

    const summary = await getStudentAttendanceSummary("stu-99", "sess-1");
    expect(summary.percentage).toBe(0);
    expect(summary.totalSchoolDays).toBe(0);
  });
});
