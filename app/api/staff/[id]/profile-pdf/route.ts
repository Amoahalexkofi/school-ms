import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/lib/db";
import { ProfileDoc, type ProfileSection } from "@/lib/pdf/profile";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();

  const [staff, profile] = await Promise.all([
    (db as any).staff.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        designation: { select: { name: true } },
        user: { select: { email: true } },
      },
    }),
    (db as any).schoolProfile.findFirst({ select: { name: true, address: true, logo: true } }),
  ]);
  if (!staff) return new Response("Staff not found", { status: 404 });

  const dateStr = (v: any) => (v ? new Date(v).toLocaleDateString() : "");

  const sections: ProfileSection[] = [
    {
      title: "Personal Details",
      fields: [
        { label: "Father's Name", value: staff.fatherName ?? "" },
        { label: "Mother's Name", value: staff.motherName ?? "" },
        { label: "Date of Birth", value: dateStr(staff.dob) },
        { label: "Gender", value: staff.gender ?? "" },
        { label: "Marital Status", value: staff.maritalStatus ?? "" },
        { label: "Religion", value: staff.religion ?? "" },
        { label: "Qualification", value: staff.qualification ?? "" },
        { label: "Work Experience", value: staff.workExperience ?? "" },
      ],
    },
    {
      title: "Employment",
      fields: [
        { label: "Department", value: staff.department?.name ?? "" },
        { label: "Designation", value: staff.designation?.name ?? "" },
        { label: "Date of Joining", value: dateStr(staff.dateOfJoining) },
        { label: "Contract Type", value: staff.contractType ?? "" },
        { label: "Payscale", value: staff.payscale ?? "" },
        { label: "Shift", value: staff.shift ?? "" },
        { label: "Location", value: staff.location ?? "" },
        { label: "Login Email", value: staff.user?.email ?? "" },
      ],
    },
    {
      title: "Contact & Address",
      fields: [
        { label: "Contact No.", value: staff.contactNo ?? "" },
        { label: "Emergency Contact", value: staff.emergencyContact ?? "" },
        { label: "Local Address", value: staff.localAddress ?? "" },
        { label: "Permanent Address", value: staff.permanentAddress ?? "" },
        { label: "City", value: staff.city ?? "" },
        { label: "State / Region", value: staff.state ?? "" },
        { label: "Country", value: staff.country ?? "" },
      ],
    },
    {
      title: "Bank Details",
      fields: [
        { label: "Bank Name", value: staff.bankName ?? "" },
        { label: "Account No.", value: staff.bankAccountNo ?? "" },
        { label: "Bank Branch", value: staff.bankBranch ?? "" },
        { label: "Sort Code", value: staff.ifscCode ?? "" },
        { label: "SSNIT No.", value: staff.epfNo ?? "" },
      ],
    },
  ];

  const buffer = await renderToBuffer(
    ProfileDoc({
      schoolName: profile?.name ?? "School",
      address: profile?.address ?? null,
      logo: profile?.logo ?? null,
      docTitle: "Staff Profile",
      photo: staff.image ?? null,
      name: `${staff.firstName} ${staff.lastName}`,
      idLabel: "Employee ID",
      idValue: staff.employeeId,
      subLabel: "Designation",
      subValue: staff.designation?.name ?? "",
      status: staff.isActive ? "Active" : "Inactive",
      sections,
      printDate: new Date().toLocaleDateString(),
    })
  );

  return new Response(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="staff-profile-${staff.employeeId}.pdf"`,
    },
  });
}
