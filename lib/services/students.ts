import { getDb } from "@/lib/db";
import { generateAdmissionNumber, validateStudentAge, formatStudentName } from "@/lib/domain/students";

export async function getStudentById(id: string) {
  const prisma = await getDb();
  return (prisma as any).student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true } },
      schoolHouse: true,
      sessions: { include: { session: true, classSection: { include: { class: true, section: true } } }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateStudent(id: string, data: Record<string, unknown>) {
  if (data.dateOfBirth) validateStudentAge(data.dateOfBirth as Date, new Date());
  const prisma = await getDb();
  if (data.firstName !== undefined || data.lastName !== undefined) {
    const current = await (prisma as any).student.findUnique({ where: { id } });
    if (!current) throw new Error("student not found");
    const formatted = formatStudentName(
      (data.firstName as string) ?? current.firstName,
      (data.lastName as string) ?? current.lastName
    );
    data.firstName = formatted.firstName;
    data.lastName = formatted.lastName;
  }
  return (prisma as any).student.update({ where: { id }, data });
}

export async function deleteStudent(id: string) {
  const prisma = await getDb();
  const sessions = await (prisma as any).studentSession.count({ where: { studentId: id, isActive: true } });
  if (sessions > 0) throw new Error("Cannot delete student with active session enrollments");
  const student = await (prisma as any).student.findUnique({ where: { id } });
  if (!student) throw new Error("Student not found");
  await (prisma as any).student.delete({ where: { id } });
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  sessionYear: number;
  middleName?: string;
  admissionDate?: Date;
  bloodGroup?: string;
  religion?: string;
  mobileNo?: string;
  currentAddress?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  schoolHouseId?: string;
}

export async function createStudent(input: CreateStudentInput) {
  validateStudentAge(input.dateOfBirth, new Date());

  const prisma = await getDb();
  const existingUser = await (prisma as any).user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new Error("email already registered");

  const { firstName, lastName } = formatStudentName(input.firstName, input.lastName);
  const count = await (prisma as any).student.count();
  const admissionNumber = generateAdmissionNumber({ sessionYear: input.sessionYear, sequenceNumber: count + 1 });
  const username = `student_${admissionNumber.toLowerCase().replace(/\//g, "_")}`;

  return (prisma as any).$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: { email: input.email, username, password: "", role: "STUDENT" },
    });
    const student = await tx.student.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        middleName: input.middleName,
        admissionNo: admissionNumber,
        admissionDate: input.admissionDate ?? new Date(),
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        religion: input.religion,
        mobileNo: input.mobileNo,
        currentAddress: input.currentAddress,
        fatherName: input.fatherName,
        fatherPhone: input.fatherPhone,
        motherName: input.motherName,
        motherPhone: input.motherPhone,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        schoolHouseId: input.schoolHouseId,
      },
    });
    return student;
  });
}
