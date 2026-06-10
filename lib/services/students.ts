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

const STUDENT_ALLOWED_FIELDS = [
  "firstName","middleName","lastName","admissionDate","dateOfBirth","gender",
  "bloodGroup","religion","caste","category","nationality","rte","mobileNo",
  "currentAddress","permanentAddress","city","state","country","pincode",
  "guardianIs","fatherName","fatherPhone","fatherEmail","fatherOccupation",
  "motherName","motherPhone","motherEmail","motherOccupation",
  "guardianName","guardianRelation","guardianPhone","guardianEmail","guardianOccupation","guardianAddress",
  "previousSchool","previousClass","previousPercent","previousTcNo","samagraId",
  "schoolHouseId","height","weight","bankAccountNo","bankName","bankBranch","ifscCode",
  "aadharNo","note","about","image","isActive","disabledAt",
  "email","parentId","designation",
  "fatherPic","motherPic","guardianPic","fatherEmail","motherEmail",
  "disableReason","disableNote",
] as const;

export async function updateStudent(id: string, rawData: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const f of STUDENT_ALLOWED_FIELDS) {
    if (f in rawData) data[f] = rawData[f];
  }

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
  parentId?: string;
  designation?: string;
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
        email:        input.email,
        parentId:     input.parentId,
        designation:  input.designation,
      },
    });
    return student;
  });
}
