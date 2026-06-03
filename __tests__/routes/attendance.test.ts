/**
 * @jest-environment node
 */
import { POST, GET } from "@/app/api/attendance/route";

jest.mock("@/lib/services/attendance", () => ({
  markAttendance: jest.fn(),
  getStudentAttendanceSummary: jest.fn(),
}));

import { markAttendance, getStudentAttendanceSummary } from "@/lib/services/attendance";
const mockMark = markAttendance as jest.Mock;
const mockSummary = getStudentAttendanceSummary as jest.Mock;

function makePostRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/attendance");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

const validMarkBody = {
  sectionId: "sec-1",
  sessionId: "sess-1",
  date: "2026-06-03",
  records: [
    { studentId: "stu-1", status: "PRESENT" },
    { studentId: "stu-2", status: "ABSENT" },
  ],
};

describe("POST /api/attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 on successful attendance marking", async () => {
    mockMark.mockResolvedValue(undefined);

    const res = await POST(makePostRequest(validMarkBody));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/success/i);
  });

  it("returns 400 when records array is missing", async () => {
    const res = await POST(makePostRequest({ sectionId: "sec-1", sessionId: "sess-1", date: "2026-06-03" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when sectionId is missing", async () => {
    const res = await POST(makePostRequest({ ...validMarkBody, sectionId: undefined }));
    expect(res.status).toBe(400);
  });

  it("returns 422 when service rejects future date", async () => {
    mockMark.mockRejectedValue(new Error("cannot mark attendance for a future date"));
    const res = await POST(makePostRequest(validMarkBody));
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockMark.mockRejectedValue(new Error("db error"));
    const res = await POST(makePostRequest(validMarkBody));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/attendance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the attendance summary", async () => {
    mockSummary.mockResolvedValue({
      present: 18,
      absent: 2,
      late: 0,
      halfDay: 0,
      holiday: 0,
      totalSchoolDays: 20,
      percentage: 90,
    });

    const res = await GET(makeGetRequest({ studentId: "stu-1", sessionId: "sess-1" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.percentage).toBe(90);
    expect(body.totalSchoolDays).toBe(20);
  });

  it("returns 400 when studentId or sessionId is missing", async () => {
    const res = await GET(makeGetRequest({ studentId: "stu-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected errors", async () => {
    mockSummary.mockRejectedValue(new Error("db error"));
    const res = await GET(makeGetRequest({ studentId: "stu-1", sessionId: "sess-1" }));
    expect(res.status).toBe(500);
  });
});
