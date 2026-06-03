import {
  createExamGroup,
  addExamSchedule,
  publishExamGroup,
  getExamGroupWithSchedules,
  type CreateExamGroupInput,
  type AddExamScheduleInput,
} from "@/lib/services/exam-schedule";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    examGroup: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    examSchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

const groupInput: CreateExamGroupInput = {
  name: "Term 1 Exams",
  sessionId: "sess-1",
  startDate: new Date("2026-10-01"),
  endDate: new Date("2026-10-10"),
};

const scheduleInput: AddExamScheduleInput = {
  examGroupId: "grp-1",
  subjectId: "subj-1",
  date: new Date("2026-10-02"),
  startTime: new Date("2026-10-02T09:00:00"),
  endTime: new Date("2026-10-02T11:00:00"),
  maxMarks: 100,
  passingMarks: 40,
};

describe("createExamGroup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an exam group", async () => {
    (mock.examGroup.create as jest.Mock).mockResolvedValue({
      id: "grp-1",
      name: "Term 1 Exams",
      published: false,
    });

    const result = await createExamGroup(groupInput);
    expect(result.id).toBe("grp-1");
    expect(result.published).toBe(false);
  });

  it("throws when name is empty", async () => {
    await expect(
      createExamGroup({ ...groupInput, name: "" })
    ).rejects.toThrow("name is required");
  });

  it("throws when endDate is before startDate", async () => {
    await expect(
      createExamGroup({
        ...groupInput,
        startDate: new Date("2026-10-10"),
        endDate: new Date("2026-10-01"),
      })
    ).rejects.toThrow("endDate must be after startDate");
  });

  it("throws when sessionId is missing", async () => {
    await expect(
      createExamGroup({ ...groupInput, sessionId: "" })
    ).rejects.toThrow("sessionId is required");
  });
});

describe("addExamSchedule", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adds a schedule to an exam group", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    (mock.examSchedule.create as jest.Mock).mockResolvedValue({
      id: "sched-1",
      maxMarks: 100,
      passingMarks: 40,
    });

    const result = await addExamSchedule(scheduleInput);
    expect(result.id).toBe("sched-1");
  });

  it("throws when exam group is not found", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(addExamSchedule(scheduleInput)).rejects.toThrow(
      "exam group not found"
    );
  });

  it("throws when exam group is already published", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: true,
    });
    await expect(addExamSchedule(scheduleInput)).rejects.toThrow(
      "cannot modify a published exam group"
    );
  });

  it("throws when maxMarks is zero or negative", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    await expect(
      addExamSchedule({ ...scheduleInput, maxMarks: 0 })
    ).rejects.toThrow("maxMarks must be greater than 0");
  });

  it("throws when passingMarks exceeds maxMarks", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    await expect(
      addExamSchedule({ ...scheduleInput, passingMarks: 110, maxMarks: 100 })
    ).rejects.toThrow("passingMarks cannot exceed maxMarks");
  });

  it("throws when endTime is before startTime", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    await expect(
      addExamSchedule({
        ...scheduleInput,
        startTime: new Date("2026-10-02T11:00:00"),
        endTime: new Date("2026-10-02T09:00:00"),
      })
    ).rejects.toThrow("endTime must be after startTime");
  });
});

describe("publishExamGroup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sets published to true", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    (mock.examSchedule.findMany as jest.Mock).mockResolvedValue([
      { id: "sched-1" },
    ]);
    (mock.examGroup.update as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: true,
    });

    const result = await publishExamGroup("grp-1");
    expect(result.published).toBe(true);
    expect(mock.examGroup.update).toHaveBeenCalledWith({
      where: { id: "grp-1" },
      data: { published: true },
    });
  });

  it("throws when exam group is not found", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(publishExamGroup("bad-id")).rejects.toThrow(
      "exam group not found"
    );
  });

  it("throws when exam group is already published", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: true,
    });
    await expect(publishExamGroup("grp-1")).rejects.toThrow(
      "exam group is already published"
    );
  });

  it("throws when exam group has no schedules", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      published: false,
    });
    (mock.examSchedule.findMany as jest.Mock).mockResolvedValue([]);
    await expect(publishExamGroup("grp-1")).rejects.toThrow(
      "cannot publish an exam group with no schedules"
    );
  });
});

describe("getExamGroupWithSchedules", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the exam group with its schedules", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue({
      id: "grp-1",
      name: "Term 1 Exams",
      published: true,
      schedules: [{ id: "sched-1" }, { id: "sched-2" }],
    });

    const result = await getExamGroupWithSchedules("grp-1");
    expect(result?.schedules).toHaveLength(2);
  });

  it("returns null when exam group does not exist", async () => {
    (mock.examGroup.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getExamGroupWithSchedules("bad-id");
    expect(result).toBeNull();
  });
});
