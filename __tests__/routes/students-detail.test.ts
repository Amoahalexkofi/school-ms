/**
 * @jest-environment node
 */
import { GET, PATCH, DELETE } from "@/app/api/students/[id]/route";

jest.mock("@/lib/services/students", () => ({
  getStudentById: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
}));

import {
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/services/students";

const mockGet = getStudentById as jest.Mock;
const mockUpdate = updateStudent as jest.Mock;
const mockDelete = deleteStudent as jest.Mock;

const params = Promise.resolve({ id: "stu-1" });

const makeRequest = (method: string, body?: unknown) =>
  new Request(`http://localhost/api/students/stu-1`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const student = {
  id: "stu-1",
  firstName: "John",
  lastName: "Doe",
  admissionNumber: "ADM-2026-0001",
  dateOfBirth: "2010-05-15",
  gender: "MALE",
};

describe("GET /api/students/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the student", async () => {
    mockGet.mockResolvedValue(student);
    const res = await GET(makeRequest("GET"), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.admissionNumber).toBe("ADM-2026-0001");
  });

  it("returns 404 when student does not exist", async () => {
    mockGet.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), { params });
    expect(res.status).toBe(404);
  });

  it("returns 500 on unexpected errors", async () => {
    mockGet.mockRejectedValue(new Error("db error"));
    const res = await GET(makeRequest("GET"), { params });
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/students/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the updated student", async () => {
    mockUpdate.mockResolvedValue({ ...student, firstName: "Johnny" });
    const res = await PATCH(
      makeRequest("PATCH", { firstName: "Johnny" }),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.firstName).toBe("Johnny");
  });

  it("returns 404 when student does not exist", async () => {
    mockUpdate.mockRejectedValue(new Error("student not found"));
    const res = await PATCH(
      makeRequest("PATCH", { firstName: "Johnny" }),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/students/stu-1", {
      method: "PATCH",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params });
    expect(res.status).toBe(400);
  });

  it("returns 422 for domain validation failures", async () => {
    mockUpdate.mockRejectedValue(new Error("student cannot be older than 25"));
    const res = await PATCH(
      makeRequest("PATCH", { dateOfBirth: "1990-01-01" }),
      { params }
    );
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockUpdate.mockRejectedValue(new Error("db error"));
    const res = await PATCH(makeRequest("PATCH", { firstName: "X" }), { params });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/students/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 204 on successful deletion", async () => {
    mockDelete.mockResolvedValue(undefined);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(204);
  });

  it("returns 404 when student does not exist", async () => {
    mockDelete.mockRejectedValue(new Error("student not found"));
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(404);
  });

  it("returns 409 when student has active enrollments", async () => {
    mockDelete.mockRejectedValue(
      new Error("cannot delete student with active enrollments")
    );
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(409);
  });

  it("returns 500 on unexpected errors", async () => {
    mockDelete.mockRejectedValue(new Error("db error"));
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(500);
  });
});
