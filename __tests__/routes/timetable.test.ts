/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/timetable/route";

jest.mock("@/lib/services/timetable", () => ({
  getSectionTimetable: jest.fn(),
  addTimetableSlot: jest.fn(),
}));

import { getSectionTimetable, addTimetableSlot } from "@/lib/services/timetable";
const mockGet = getSectionTimetable as jest.Mock;
const mockAdd = addTimetableSlot as jest.Mock;

const makeGet = (params: Record<string, string>) => {
  const url = new URL("http://localhost/api/timetable");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
};

const makePost = (body: unknown) =>
  new Request("http://localhost/api/timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validSlot = {
  sectionId: "sec-1",
  day: "MONDAY",
  period: 1,
  startTime: "08:00",
  endTime: "08:45",
  staffId: "teacher-1",
  subjectId: "subj-1",
};

describe("GET /api/timetable", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the section timetable", async () => {
    mockGet.mockResolvedValue([
      { id: "slot-1", day: "MONDAY", period: 1 },
      { id: "slot-2", day: "MONDAY", period: 2 },
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

  it("returns 500 on unexpected errors", async () => {
    mockGet.mockRejectedValue(new Error("db error"));
    const res = await GET(makeGet({ sectionId: "sec-1" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/timetable", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created slot", async () => {
    mockAdd.mockResolvedValue({ id: "slot-1", ...validSlot });
    const res = await POST(makePost(validSlot));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("slot-1");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makePost({ sectionId: "sec-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when a teacher conflict is detected", async () => {
    mockAdd.mockRejectedValue(
      new Error("teacher is double-booked on MONDAY period 1")
    );
    const res = await POST(makePost(validSlot));
    expect(res.status).toBe(409);
  });

  it("returns 409 when a duplicate section/day/period exists", async () => {
    mockAdd.mockRejectedValue(
      new Error("duplicate period 1 on MONDAY for section sec-1")
    );
    const res = await POST(makePost(validSlot));
    expect(res.status).toBe(409);
  });

  it("returns 422 for slot validation failures", async () => {
    mockAdd.mockRejectedValue(new Error("period must be at least 1"));
    const res = await POST(makePost({ ...validSlot, period: 0 }));
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockAdd.mockRejectedValue(new Error("db error"));
    const res = await POST(makePost(validSlot));
    expect(res.status).toBe(500);
  });
});
