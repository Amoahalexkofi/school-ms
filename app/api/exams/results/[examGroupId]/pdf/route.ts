import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/lib/db";
import { ReportCardDoc, type PdfStudent } from "@/lib/pdf/report-card";

export const runtime = "nodejs";

// One-click report-card PDF. ?classSectionId=&studentId(optional)&templateId(optional)
export async function GET(req: NextRequest, { params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;
  const sp = req.nextUrl.searchParams;
  const classSectionId = sp.get("classSectionId");
  const studentId = sp.get("studentId");
  const templateId = sp.get("templateId");
  if (!classSectionId) return new Response("classSectionId required", { status: 422 });

  const db = await getDb();
  const [group, profile, divisions, scale, template] = await Promise.all([
    (db as any).examGroup.findUnique({ where: { id: examGroupId }, select: { name: true } }),
    (db as any).schoolProfile.findFirst({ select: { name: true, address: true } }),
    (db as any).markDivision.findMany({ where: { isActive: true }, orderBy: { percentageFrom: "desc" } }).catch(() => []),
    (db as any).gradingScale.findFirst({ orderBy: { createdAt: "asc" }, include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } } }).catch(() => null),
    templateId ? (db as any).templateMarksheet.findUnique({ where: { id: templateId } }).catch(() => null) : null,
  ]);

  const schedules = await (db as any).examSchedule.findMany({
    where: { examGroupId, isActive: true, classSectionId },
    include: {
      subject: { select: { name: true } },
      classSection: { include: { class: { select: { name: true } }, section: { select: { name: true } } } },
      markEntries: { include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, rollNo: true, dateOfBirth: true, gender: true, fatherName: true, motherName: true } } } },
    },
    orderBy: { dateOfExam: "asc" },
  });

  const className = schedules[0]?.classSection
    ? `${schedules[0].classSection.class?.name ?? ""} - ${schedules[0].classSection.section?.name ?? ""}`
    : "";

  const map: Record<string, any> = {};
  for (const sch of schedules) {
    for (const m of sch.markEntries) {
      const st = m.student;
      if (!map[st.id]) map[st.id] = { st, rows: [] };
      map[st.id].rows.push({
        subject: sch.subject.name, full: sch.fullMarks, passing: sch.passingMarks,
        obtained: m.attendance === "A" ? null : Number(m.marksObtained ?? 0),
        grade: m.grade, isPassing: m.isPassing,
      });
    }
  }

  const divisionFor = (pct: number, allPassed: boolean): string => {
    if (!allPassed && divisions.length) return "Fail";
    for (const d of divisions) if (pct >= Number(d.percentageFrom) && pct <= Number(d.percentageTo)) return d.name;
    return divisions.length ? "-" : "";
  };

  let list = Object.values(map).map((r: any) => {
    const totalFull = r.rows.reduce((a: number, x: any) => a + x.full, 0);
    const totalObtained = r.rows.reduce((a: number, x: any) => a + (x.obtained ?? 0), 0);
    const pct = totalFull ? Math.round((totalObtained / totalFull) * 100) : 0;
    const allPassed = r.rows.every((x: any) => x.obtained !== null && x.isPassing);
    return {
      name: `${r.st.firstName} ${r.st.lastName}`, admissionNo: r.st.admissionNo, rollNo: r.st.rollNo,
      className, fatherName: r.st.fatherName, motherName: r.st.motherName,
      dob: r.st.dateOfBirth ? new Date(r.st.dateOfBirth).toLocaleDateString() : null,
      gender: r.st.gender, rows: r.rows, totalFull, totalObtained, pct, allPassed,
      division: divisionFor(pct, allPassed), _id: r.st.id,
    } as PdfStudent & { _id: string };
  });

  list.sort((a, b) => b.totalObtained - a.totalObtained);
  list.forEach((s, i) => (s.rank = i + 1));
  // Persisted rank overrides
  const persisted = await (db as any).studentExamRank.findMany({ where: { examGroupId } }).catch(() => []);
  if (persisted.length) {
    const pm = new Map(persisted.map((p: any) => [p.studentId, p.rank]));
    for (const s of list as any[]) if (pm.has(s._id)) s.rank = pm.get(s._id);
    list.sort((a, b) => a.rank - b.rank);
  }
  if (studentId) list = list.filter((s: any) => s._id === studentId);
  if (!list.length) return new Response("No results found", { status: 404 });

  const gradeKey = (scale?.ranges ?? []).map((r: any) => ({ grade: r.grade, from: Number(r.markFrom), to: Number(r.markTo) }));
  const fld = (k: string, def: boolean) => (template ? !!template[k] : def);

  const buffer = await renderToBuffer(
    ReportCardDoc({
      schoolName: profile?.name ?? "School",
      address: profile?.address ?? null,
      title: template?.title || "REPORT CARD / MARKSHEET",
      heading: template?.heading || "",
      examName: group?.name ?? "",
      sessionLabel: "",
      leftSign: template?.leftSign ?? "Class Teacher",
      middleSign: template?.middleSign ?? "",
      rightSign: template?.rightSign ?? "Principal",
      gradeKey,
      fields: {
        name: fld("isName", true), father: fld("isFatherName", true), mother: fld("isMotherName", true),
        dob: fld("isDob", true), admissionNo: fld("isAdmissionNo", true), rollNo: fld("isRollNo", true),
      },
      students: list as PdfStudent[],
      printDate: new Date().toLocaleDateString(),
    })
  );

  const fname = studentId && list[0] ? `report-card-${(list[0] as any).admissionNo || "student"}.pdf` : `report-cards-${group?.name ?? "exam"}.pdf`;
  return new Response(buffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fname.replace(/[^a-z0-9.\-]/gi, "_")}"`,
    },
  });
}
