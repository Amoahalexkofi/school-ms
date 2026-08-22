import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/lib/db";
import { ProfileDoc, type ProfileSection } from "@/lib/pdf/profile";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const [student, profile] = await Promise.all([
    (db as any).student.findUnique({
      where: { id },
      include: {
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        schoolHouse: { select: { name: true } },
        user: { select: { email: true } },
      },
    }),
    (db as any).schoolProfile.findFirst({ select: { name: true, address: true, logo: true } }),
  ]);
  if (!student) return new Response("Student not found", { status: 404 });

  const cs = student.sessions[0];
  const className = cs ? `${cs.classSection.class.name} – ${cs.classSection.section.name}` : "Not enrolled";
  const dateStr = (v: any) => (v ? new Date(v).toLocaleDateString() : "");

  const sections: ProfileSection[] = [
    {
      title: "Personal Details",
      fields: [
        { label: "Date of Birth", value: dateStr(student.dateOfBirth) },
        { label: "Gender", value: student.gender ?? "" },
        { label: "Blood Group", value: student.bloodGroup ?? "" },
        { label: "Religion", value: student.religion ?? "" },
        { label: "Caste / Category", value: student.caste ?? "" },
        { label: "Nationality", value: student.nationality ?? "" },
        { label: "Admission Date", value: dateStr(student.admissionDate) },
        { label: "School House", value: student.schoolHouse?.name ?? "" },
      ],
    },
    {
      title: "Contact & Address",
      fields: [
        { label: "Mobile No.", value: student.mobileNo ?? "" },
        { label: "Email", value: student.email ?? student.user?.email ?? "" },
        { label: "Current Address", value: student.currentAddress ?? "" },
        { label: "Permanent Address", value: student.permanentAddress ?? "" },
        { label: "City", value: student.city ?? "" },
        { label: "State / Region", value: student.state ?? "" },
        { label: "Country", value: student.country ?? "" },
        { label: "Pincode", value: student.pincode ?? "" },
      ],
    },
    {
      title: "Guardian Information",
      fields: [
        { label: "Father's Name", value: student.fatherName ?? "" },
        { label: "Father's Phone", value: student.fatherPhone ?? "" },
        { label: "Father's Occupation", value: student.fatherOccupation ?? "" },
        { label: "Mother's Name", value: student.motherName ?? "" },
        { label: "Mother's Phone", value: student.motherPhone ?? "" },
        { label: "Mother's Occupation", value: student.motherOccupation ?? "" },
        { label: "Guardian Name", value: student.guardianName ?? "" },
        { label: "Guardian Relation", value: student.guardianRelation ?? "" },
        { label: "Guardian Phone", value: student.guardianPhone ?? "" },
        { label: "Guardian Email", value: student.guardianEmail ?? "" },
        { label: "Guardian Occupation", value: student.guardianOccupation ?? "" },
        { label: "Guardian Address", value: student.guardianAddress ?? "" },
      ],
    },
    {
      title: "Previous School",
      fields: [
        { label: "Previous School", value: student.previousSchool ?? "" },
        { label: "Previous Class", value: student.previousClass ?? "" },
        { label: "Previous %", value: student.previousPercent ?? "" },
        { label: "Transfer Cert. No", value: student.previousTcNo ?? "" },
      ],
    },
  ];

  const buffer = await renderToBuffer(
    ProfileDoc({
      schoolName: profile?.name ?? "School",
      address: profile?.address ?? null,
      logo: profile?.logo ?? null,
      docTitle: "Student Profile",
      photo: student.image ?? null,
      name: `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName ?? ""}`.trim(),
      idLabel: "Admission No",
      idValue: student.admissionNo,
      subLabel: "Class",
      subValue: className,
      status: student.isActive ? "Active" : "Inactive",
      sections,
      printDate: new Date().toLocaleDateString(),
    })
  );

  return new Response(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${`student-profile-${student.admissionNo}.pdf`.replace(/[^a-z0-9.\-]/gi, "_")}"`,
    },
  });
}
