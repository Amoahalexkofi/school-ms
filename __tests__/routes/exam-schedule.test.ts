/**
 * @jest-environment node
 */
import { POST as createGroup } from "@/app/api/exam-groups/route";
import { POST as addSchedule, GET as getGroup } from "@/app/api/exam-groups/[id]/schedules/route";
import { PATCH as publishGroup } from "@/app/api/exam-groups/[id]/publish/route";

jest.mock("@/lib/services/exam-schedule", () => ({
  createExamGroup: jest.fn(),
  addExamSchedule: jest.fn(),
  publishExamGroup: jest.fn(),
  getExamGroupWithSchedules: jest.fn(),
}));

import {
  createExamGroup,
  addExamSchedule,
  publishExamGroup,
  getExamGroupWithSchedules,
} from "@/lib/services/exam-schedule";

const mockCreate = createExamGroup as jest.Mock;
const mockAdd = addExamSchedule as jest.Mock;
const mockPublish = publishExamGroup as jest.Mock;
const mockGet = getExamGroupWithSchedules as jest.Mock;

const params = Promise.resolve({ id: "grp-1" });

const makePost = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makePatch = (url: string) =>
  new Request(url, { method: "PATCH" });

const makeGet = (url: string) =>
  new Request(url, { method: "GET" });

const groupBody = {
  name: "Term 1 Exams",
  sessionId: "sess-1",
  startDate: "2026-10-01",
  endDate: "2026-10-10",
};

const scheduleBody = {
  subjectId: "subj-1",
  date: "2026-10-02",
  startTime: "2026-10-02T09:00:00",
  endTime: "2026-10-02T11:00:00",
  maxMarks: 100,
  passingMarks: 40,
};

describe("POST /api/exam-groups", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created exam group", async () => {
    mockCreate.mockResolvedValue({ id: "grp-1", name: "Term 1 Exams", published: false });
    const res = await createGroup(makePost("http://localhost/api/exam-groups", groupBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.published).toBe(false);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await createGroup(makePost("http://localhost/api/exam-groups", { name: "X" }));
    expect(res.status).toBe(400);
  });

  it("returns 422 when endDate is before startDate", async () => {
    mockCreate.mockRejectedValue(new Error("endDate must be after startDate"));
    const res = await createGroup(
      makePost("http://localhost/api/exam-groups", {
        ...groupBody,
        startDate: "2026-10-10",
        endDate: "2026-10-01",
      })
    );
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockCreate.mockRejectedValue(new Error("db error"));
    const res = await createGroup(makePost("http://localhost/api/exam-groups", groupBody));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/exam-groups/[id]/schedules", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created schedule", async () => {
    mockAdd.mockResolvedValue({ id: "sched-1", maxMarks: 100 });
    const res = await addSchedule(
      makePost("http://localhost/api/exam-groups/grp-1/schedules", scheduleBody),
      { params }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("sched-1");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await addSchedule(
      makePost("http://localhost/api/exam-groups/grp-1/schedules", { subjectId: "s1" }),
      { params }
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when exam group is not found", async () => {
    mockAdd.mockRejectedValue(new Error("exam group not found"));
    const res = await addSchedule(
      makePost("http://localhost/api/exam-groups/grp-1/schedules", scheduleBody),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when exam group is already published", async () => {
    mockAdd.mockRejectedValue(new Error("cannot modify a published exam group"));
    const res = await addSchedule(
      makePost("http://localhost/api/exam-groups/grp-1/schedules", scheduleBody),
      { params }
    );
    expect(res.status).toBe(409);
  });

  it("returns 422 for validation failures", async () => {
    mockAdd.mockRejectedValue(new Error("passingMarks cannot exceed maxMarks"));
    const res = await addSchedule(
      makePost("http://localhost/api/exam-groups/grp-1/schedules", {
        ...scheduleBody,
        passingMarks: 110,
      }),
      { params }
    );
    expect(res.status).toBe(422);
  });
});

describe("GET /api/exam-groups/[id]/schedules", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the exam group and schedules", async () => {
    mockGet.mockResolvedValue({
      id: "grp-1",
      name: "Term 1 Exams",
      schedules: [{ id: "sched-1" }],
    });
    const res = await getGroup(
      makeGet("http://localhost/api/exam-groups/grp-1/schedules"),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.schedules).toHaveLength(1);
  });

  it("returns 404 when exam group is not found", async () => {
    mockGet.mockResolvedValue(null);
    const res = await getGroup(
      makeGet("http://localhost/api/exam-groups/grp-1/schedules"),
      { params }
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/exam-groups/[id]/publish", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the published exam group", async () => {
    mockPublish.mockResolvedValue({ id: "grp-1", published: true });
    const res = await publishGroup(
      makePatch("http://localhost/api/exam-groups/grp-1/publish"),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.published).toBe(true);
  });

  it("returns 404 when exam group is not found", async () => {
    mockPublish.mockRejectedValue(new Error("exam group not found"));
    const res = await publishGroup(
      makePatch("http://localhost/api/exam-groups/grp-1/publish"),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when already published", async () => {
    mockPublish.mockRejectedValue(new Error("exam group is already published"));
    const res = await publishGroup(
      makePatch("http://localhost/api/exam-groups/grp-1/publish"),
      { params }
    );
    expect(res.status).toBe(409);
  });

  it("returns 422 when group has no schedules", async () => {
    mockPublish.mockRejectedValue(
      new Error("cannot publish an exam group with no schedules")
    );
    const res = await publishGroup(
      makePatch("http://localhost/api/exam-groups/grp-1/publish"),
      { params }
    );
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockPublish.mockRejectedValue(new Error("db error"));
    const res = await publishGroup(
      makePatch("http://localhost/api/exam-groups/grp-1/publish"),
      { params }
    );
    expect(res.status).toBe(500);
  });
});
