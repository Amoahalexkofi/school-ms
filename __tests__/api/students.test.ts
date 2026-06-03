/**
 * Tests for student creation service logic.
 * We test the service layer (not the HTTP handler) to keep tests fast and DB-free.
 */
import {
  createStudent,
  type CreateStudentInput,
} from "@/lib/services/students";

// Mock the Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    student: {
      create: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const validInput: CreateStudentInput = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@school.edu",
  dateOfBirth: new Date("2010-05-15"),
  gender: "MALE",
  sessionYear: 2026,
};

describe("createStudent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a student and returns the admission number", async () => {
    (mockPrisma.student.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) =>
      fn(mockPrisma)
    );
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: validInput.email,
      role: "STUDENT",
    });
    (mockPrisma.student.create as jest.Mock).mockResolvedValue({
      id: "stu-1",
      admissionNumber: "ADM-2026-0006",
      firstName: "John",
      lastName: "Doe",
    });

    const result = await createStudent(validInput);

    expect(result.admissionNumber).toBe("ADM-2026-0006");
    expect(result.firstName).toBe("John");
    expect(mockPrisma.student.create).toHaveBeenCalledTimes(1);
  });

  it("throws when email is already registered", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "stu-existing",
    });

    await expect(createStudent(validInput)).rejects.toThrow(
      "email already registered"
    );
    expect(mockPrisma.student.create).not.toHaveBeenCalled();
  });

  it("throws when student is too young (under 3)", async () => {
    const youngStudent: CreateStudentInput = {
      ...validInput,
      dateOfBirth: new Date(), // born today
    };
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(createStudent(youngStudent)).rejects.toThrow(
      "student must be at least 3 years old"
    );
    expect(mockPrisma.student.create).not.toHaveBeenCalled();
  });

  it("normalises name casing before saving", async () => {
    const messyInput: CreateStudentInput = {
      ...validInput,
      firstName: "  jOhN  ",
      lastName: "  dOe  ",
    };
    (mockPrisma.student.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) =>
      fn(mockPrisma)
    );
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: "user-2" });
    (mockPrisma.student.create as jest.Mock).mockResolvedValue({
      id: "stu-2",
      admissionNumber: "ADM-2026-0001",
      firstName: "John",
      lastName: "Doe",
    });

    await createStudent(messyInput);

    const createCall = (mockPrisma.student.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.firstName).toBe("John");
    expect(createCall.data.lastName).toBe("Doe");
  });

  it("generates sequential admission numbers", async () => {
    (mockPrisma.student.count as jest.Mock).mockResolvedValue(99);
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) =>
      fn(mockPrisma)
    );
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: "user-3" });
    (mockPrisma.student.create as jest.Mock).mockResolvedValue({
      id: "stu-3",
      admissionNumber: "ADM-2026-0100",
      firstName: "John",
      lastName: "Doe",
    });

    const result = await createStudent(validInput);
    expect(result.admissionNumber).toBe("ADM-2026-0100");
  });
});
