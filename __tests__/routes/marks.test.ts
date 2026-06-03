/**
 * @jest-environment node
 */
import { POST } from "@/app/api/marks/route";
import { GET } from "@/app/api/marks/route";

jest.mock("@/lib/services/marks", () => ({
  submitMarks: jest.fn(),
  getStudentResults: jest.fn(),
}));

import { submitMarks, getStudentResults } from "@/lib/services/marks";
const mockSubmit = submitMarks as jest.Mock;
const mockResults = getStudentResults as jest.Mock;

const makePost = (body: unknown) =>
  new Request("http://localhost/api/marks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeGet = (params: Record<string, string>) => {
  const url = new URL("http://localhost/api/marks");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
};

const validBody = {
  examScheduleId: "sched-1",
  studentId: "stu-1",
  theoryMarks: 75,
};

describe("POST /api/marks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the mark entry on success", async () => {
    mockSubmit.mockResolvedValue({
      id: "me-1",
      totalMarks: 75,
      grade: "B+",
      isPassed: true,
    });

    const res = await POST(makePost(validBody));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.grade).toBe("B+");
    expect(body.isPassed).toBe(true);
  });

  it("returns 400 when examScheduleId is missing", async () => {
    const res = await POST(makePost({ studentId: "stu-1", theoryMarks: 75 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await POST(makePost({ examScheduleId: "sched-1", theoryMarks: 75 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when theoryMarks is missing", async () => {
    const res = await POST(makePost({ examScheduleId: "sched-1", studentId: "stu-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when exam schedule is not found", async () => {
    mockSubmit.mockRejectedValue(new Error("exam schedule not found"));
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 422 when marks exceed maxMarks", async () => {
    mockSubmit.mockRejectedValue(new Error("marks cannot exceed maxMarks"));
    const res = await POST(makePost({ ...validBody, theoryMarks: 999 }));
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockSubmit.mockRejectedValue(new Error("db error"));
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/marks", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with results for a student", async () => {
    mockResults.mockResolvedValue([
      { id: "me-1", totalMarks: 85, grade: "A", isPassed: true },
      { id: "me-2", totalMarks: 35, grade: "F", isPassed: false },
    ]);

    const res = await GET(makeGet({ studentId: "stu-1", examGroupId: "group-1" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].grade).toBe("A");
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await GET(makeGet({ examGroupId: "group-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when examGroupId is missing", async () => {
    const res = await GET(makeGet({ studentId: "stu-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected errors", async () => {
    mockResults.mockRejectedValue(new Error("db error"));
    const res = await GET(makeGet({ studentId: "stu-1", examGroupId: "group-1" }));
    expect(res.status).toBe(500);
  });
});
