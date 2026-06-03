import {
  createHomework,
  listHomework,
  acknowledgeHomework,
  type CreateHomeworkInput,
} from "@/lib/services/homework";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    homework: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    homeworkAcknowledgement: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

const validInput: CreateHomeworkInput = {
  title: "Chapter 5 Exercises",
  description: "Complete exercises 1–10",
  subjectId: "subj-1",
  sectionId: "sec-1",
  assignedById: "teacher-1",
  dueDate: new Date("2026-07-15"),
};

describe("createHomework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a homework assignment", async () => {
    (mock.homework.create as jest.Mock).mockResolvedValue({
      id: "hw-1",
      title: "Chapter 5 Exercises",
      dueDate: new Date("2026-07-15"),
    });

    const result = await createHomework(validInput);
    expect(result.id).toBe("hw-1");
    expect(mock.homework.create).toHaveBeenCalledTimes(1);
  });

  it("throws when title is empty", async () => {
    await expect(createHomework({ ...validInput, title: "" })).rejects.toThrow(
      "title is required"
    );
    expect(mock.homework.create).not.toHaveBeenCalled();
  });

  it("throws when dueDate is in the past", async () => {
    await expect(
      createHomework({ ...validInput, dueDate: new Date("2020-01-01") })
    ).rejects.toThrow("dueDate cannot be in the past");
    expect(mock.homework.create).not.toHaveBeenCalled();
  });

  it("throws when subjectId is missing", async () => {
    await expect(
      createHomework({ ...validInput, subjectId: "" })
    ).rejects.toThrow("subjectId is required");
  });

  it("throws when sectionId is missing", async () => {
    await expect(
      createHomework({ ...validInput, sectionId: "" })
    ).rejects.toThrow("sectionId is required");
  });

  it("passes correct data to the database", async () => {
    (mock.homework.create as jest.Mock).mockResolvedValue({ id: "hw-1" });

    await createHomework(validInput);

    const call = (mock.homework.create as jest.Mock).mock.calls[0][0];
    expect(call.data.title).toBe("Chapter 5 Exercises");
    expect(call.data.subjectId).toBe("subj-1");
    expect(call.data.sectionId).toBe("sec-1");
    expect(call.data.assignedById).toBe("teacher-1");
  });
});

describe("listHomework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns homework for a section ordered by dueDate", async () => {
    (mock.homework.findMany as jest.Mock).mockResolvedValue([
      { id: "hw-1", title: "Chapter 5", dueDate: new Date("2026-07-10") },
      { id: "hw-2", title: "Essay Draft", dueDate: new Date("2026-07-15") },
    ]);

    const result = await listHomework({ sectionId: "sec-1" });
    expect(result).toHaveLength(2);
    expect(mock.homework.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sectionId: "sec-1" }),
        orderBy: { dueDate: "asc" },
      })
    );
  });

  it("filters by subjectId when provided", async () => {
    (mock.homework.findMany as jest.Mock).mockResolvedValue([]);

    await listHomework({ sectionId: "sec-1", subjectId: "subj-1" });

    const call = (mock.homework.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.subjectId).toBe("subj-1");
  });

  it("returns empty array when section has no homework", async () => {
    (mock.homework.findMany as jest.Mock).mockResolvedValue([]);
    const result = await listHomework({ sectionId: "sec-99" });
    expect(result).toHaveLength(0);
  });
});

describe("acknowledgeHomework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("upserts an acknowledgement for a student", async () => {
    (mock.homework.findUnique as jest.Mock).mockResolvedValue({ id: "hw-1" });
    (mock.homeworkAcknowledgement.upsert as jest.Mock).mockResolvedValue({
      homeworkId: "hw-1",
      studentId: "stu-1",
      acknowledgedAt: new Date(),
    });

    const result = await acknowledgeHomework("hw-1", "stu-1");
    expect(result.studentId).toBe("stu-1");
    expect(mock.homeworkAcknowledgement.upsert).toHaveBeenCalledTimes(1);
  });

  it("throws when homework does not exist", async () => {
    (mock.homework.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(acknowledgeHomework("bad-id", "stu-1")).rejects.toThrow(
      "homework not found"
    );
    expect(mock.homeworkAcknowledgement.upsert).not.toHaveBeenCalled();
  });
});
