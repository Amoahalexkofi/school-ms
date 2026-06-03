import { prisma } from "@/lib/prisma";
import {
  generateAdmissionNumber,
  validateStudentAge,
  formatStudentName,
} from "@/lib/domain/students";

export async function getStudentById(id: string) {
  return (prisma as any).student.findUnique({
    where: { id },
    include: { user: { select: { email: true, role: true } }, parent: true },
  });
}

export async function updateStudent(
  id: string,
  data: Partial<{ firstName: string; lastName: string; dateOfBirth: Date; gender: string }>
) {
  if (data.dateOfBirth) validateStudentAge(data.dateOfBirth, new Date());
  const updates: Record<string, unknown> = {};
  if (data.firstName !== undefined || data.lastName !== undefined) {
    const current = await (prisma as any).student.findUnique({ where: { id } });
    if (!current) throw new Error("student not found");
    const formatted = formatStudentName(
      data.firstName ?? current.firstName,
      data.lastName ?? current.lastName
    );
    updates.firstName = formatted.firstName;
    updates.lastName = formatted.lastName;
  }
  if (data.dateOfBirth) updates.dateOfBirth = data.dateOfBirth;
  if (data.gender) updates.gender = data.gender;

  return (prisma as any).student.update({ where: { id }, data: updates });
}

export async function deleteStudent(id: string) {
  const enrollments = await (prisma as any).studentEnrollment.count({ where: { studentId: id } });
  if (enrollments > 0) throw new Error("cannot delete student with active enrollments");
  const student = await (prisma as any).student.findUnique({ where: { id } });
  if (!student) throw new Error("student not found");
  await (prisma as any).student.delete({ where: { id } });
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  sessionYear: number;
  parentId?: string;
}

export async function createStudent(input: CreateStudentInput) {
  // Validate age before any DB calls
  validateStudentAge(input.dateOfBirth, new Date());

  // Check for duplicate email via the linked User record
  const existingUser = await (prisma as any).user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new Error("email already registered");
  }

  const { firstName, lastName } = formatStudentName(
    input.firstName,
    input.lastName
  );

  // Determine next sequence number
  const count = await prisma.student.count();
  const admissionNumber = generateAdmissionNumber({
    sessionYear: input.sessionYear,
    sequenceNumber: count + 1,
  });

  return prisma.$transaction(async (tx) => {
    const user = await (tx as typeof prisma).user.create({
      data: {
        email: input.email,
        password: "", // set via auth flow
        role: "STUDENT",
      },
    });

    const student = await (tx as typeof prisma).student.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        admissionNumber,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        parentId: input.parentId,
      },
    });

    return student;
  });
}
