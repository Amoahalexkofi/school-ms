/**
 * @jest-environment node
 *
 * Tests for app/api/students/route.ts
 * Calls exported handler functions directly — no HTTP server needed.
 */
import { POST } from "@/app/api/students/route";

jest.mock("@/lib/services/students", () => ({
  createStudent: jest.fn(),
}));

import { createStudent } from "@/lib/services/students";
const mockCreate = createStudent as jest.Mock;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/students", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created student on success", async () => {
    mockCreate.mockResolvedValue({
      id: "stu-1",
      admissionNumber: "ADM-2026-0001",
      firstName: "John",
      lastName: "Doe",
    });

    const res = await POST(
      makeRequest({
        firstName: "John",
        lastName: "Doe",
        email: "john@school.edu",
        dateOfBirth: "2010-05-15",
        gender: "MALE",
        sessionYear: 2026,
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.admissionNumber).toBe("ADM-2026-0001");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({ firstName: "John" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 409 when email is already registered", async () => {
    mockCreate.mockRejectedValue(new Error("email already registered"));

    const res = await POST(
      makeRequest({
        firstName: "John",
        lastName: "Doe",
        email: "existing@school.edu",
        dateOfBirth: "2010-05-15",
        gender: "MALE",
        sessionYear: 2026,
      })
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/email already registered/);
  });

  it("returns 422 when student age validation fails", async () => {
    mockCreate.mockRejectedValue(new Error("student must be at least 3 years old"));

    const res = await POST(
      makeRequest({
        firstName: "Baby",
        lastName: "Doe",
        email: "baby@school.edu",
        dateOfBirth: new Date().toISOString(),
        gender: "FEMALE",
        sessionYear: 2026,
      })
    );

    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockCreate.mockRejectedValue(new Error("database connection lost"));

    const res = await POST(
      makeRequest({
        firstName: "John",
        lastName: "Doe",
        email: "john2@school.edu",
        dateOfBirth: "2010-05-15",
        gender: "MALE",
        sessionYear: 2026,
      })
    );

    expect(res.status).toBe(500);
  });
});
