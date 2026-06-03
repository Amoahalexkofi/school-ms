/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/homework/route";
import { PATCH } from "@/app/api/homework/[id]/acknowledge/route";

jest.mock("@/lib/services/homework", () => ({
  createHomework: jest.fn(),
  listHomework: jest.fn(),
  acknowledgeHomework: jest.fn(),
}));

import { createHomework, listHomework, acknowledgeHomework } from "@/lib/services/homework";
const mockCreate = createHomework as jest.Mock;
const mockList = listHomework as jest.Mock;
const mockAck = acknowledgeHomework as jest.Mock;

const makeGet = (params: Record<string, string>) => {
  const url = new URL("http://localhost/api/homework");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
};

const makePost = (body: unknown) =>
  new Request("http://localhost/api/homework", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makePatch = (body: unknown) =>
  new Request("http://localhost/api/homework/hw-1/acknowledge", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  title: "Chapter 5 Exercises",
  subjectId: "subj-1",
  sectionId: "sec-1",
  assignedById: "teacher-1",
  dueDate: "2026-07-15",
};

describe("GET /api/homework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with homework list for a section", async () => {
    mockList.mockResolvedValue([
      { id: "hw-1", title: "Chapter 5 Exercises" },
      { id: "hw-2", title: "Essay Draft" },
    ]);
    const res = await GET(makeGet({ sectionId: "sec-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it("returns 400 when sectionId is missing", async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
  });

  it("passes subjectId filter when provided", async () => {
    mockList.mockResolvedValue([]);
    await GET(makeGet({ sectionId: "sec-1", subjectId: "subj-1" }));
    expect(mockList).toHaveBeenCalledWith({
      sectionId: "sec-1",
      subjectId: "subj-1",
    });
  });

  it("returns 500 on unexpected errors", async () => {
    mockList.mockRejectedValue(new Error("db error"));
    const res = await GET(makeGet({ sectionId: "sec-1" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/homework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created homework", async () => {
    mockCreate.mockResolvedValue({ id: "hw-1", title: "Chapter 5 Exercises" });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("hw-1");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makePost({ title: "Incomplete" }));
    expect(res.status).toBe(400);
  });

  it("returns 422 when dueDate is in the past", async () => {
    mockCreate.mockRejectedValue(new Error("dueDate cannot be in the past"));
    const res = await POST(makePost({ ...validBody, dueDate: "2020-01-01" }));
    expect(res.status).toBe(422);
  });

  it("returns 400 when title is empty (caught at route level)", async () => {
    const res = await POST(makePost({ ...validBody, title: "" }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected errors", async () => {
    mockCreate.mockRejectedValue(new Error("db error"));
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/homework/[id]/acknowledge", () => {
  beforeEach(() => jest.clearAllMocks());

  const params = Promise.resolve({ id: "hw-1" });

  it("returns 200 on successful acknowledgement", async () => {
    mockAck.mockResolvedValue({
      homeworkId: "hw-1",
      studentId: "stu-1",
      acknowledgedAt: new Date(),
    });
    const res = await PATCH(makePatch({ studentId: "stu-1" }), { params });
    expect(res.status).toBe(200);
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await PATCH(makePatch({}), { params });
    expect(res.status).toBe(400);
  });

  it("returns 404 when homework does not exist", async () => {
    mockAck.mockRejectedValue(new Error("homework not found"));
    const res = await PATCH(makePatch({ studentId: "stu-1" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 500 on unexpected errors", async () => {
    mockAck.mockRejectedValue(new Error("db error"));
    const res = await PATCH(makePatch({ studentId: "stu-1" }), { params });
    expect(res.status).toBe(500);
  });
});
