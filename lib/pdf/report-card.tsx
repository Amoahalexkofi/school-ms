import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

export type PdfRow = {
  subject: string; full: number; passing: number; obtained: number | null; grade: string | null; isPassing: boolean;
  // GES mode extras
  classScore?: number | null; examScore?: number | null; position?: number | null; remark?: string | null;
};
export type PdfTermReport = {
  attendancePresent?: number | null; attendanceTotal?: number | null;
  conduct?: string | null; attitude?: string | null; interest?: string | null;
  classTeacherRemark?: string | null; headTeacherRemark?: string | null;
  promotedTo?: string | null; nextTermBegins?: string | null;
};
export type PdfStudent = {
  name: string; admissionNo: string; rollNo?: string | null; className: string;
  fatherName?: string | null; motherName?: string | null; dob?: string | null; gender?: string | null;
  rows: PdfRow[]; totalFull: number; totalObtained: number; pct: number; division: string; allPassed: boolean; rank: number;
  report?: PdfTermReport | null;
};
export type PdfData = {
  schoolName: string; address?: string | null; title: string; heading?: string;
  examName: string; sessionLabel: string;
  leftSign: string; middleSign?: string; rightSign: string;
  gradeKey: { grade: string; from: number; to: number }[];
  fields: { name: boolean; father: boolean; mother: boolean; dob: boolean; admissionNo: boolean; rollNo: boolean };
  students: PdfStudent[];
  printDate: string;
  // GES terminal-report mode: adds Class/Exam score columns + wrapper block
  ges?: { sbaLabel: string; examLabel: string; onRoll?: number | null } | null;
  // School branding (template values, school profile as fallback)
  leftLogo?: string | null;
  rightLogo?: string | null;
  headerColor?: string | null;
  footerText?: string | null;
  watermarkUrl?: string | null;
};

const s = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica", color: "#111827" },
  header: { backgroundColor: "#1d4ed8", color: "#fff", padding: 12, textAlign: "center", borderRadius: 4 },
  school: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  addr: { fontSize: 8, color: "#dbeafe", marginTop: 2 },
  titleChip: { marginTop: 6, fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  sub: { fontSize: 8, color: "#dbeafe", marginTop: 3 },
  infoBox: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: "#e5e7eb", borderTopWidth: 0, padding: 8 },
  infoCell: { width: "33%", marginBottom: 4 },
  infoLabel: { fontSize: 7, color: "#9ca3af" },
  infoVal: { fontSize: 9 },
  rankBox: { position: "absolute", right: 10, top: 64, alignItems: "center" },
  rankNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  table: { marginTop: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#e5e7eb" },
  th: { backgroundColor: "#f3f4f6", fontFamily: "Helvetica-Bold", padding: 4, fontSize: 8 },
  td: { padding: 4, fontSize: 8 },
  cSub: { width: "40%" }, cNum: { width: "15%", textAlign: "center" },
  // GES columns: Subject | Class | Exam | Total | Grade | Pos. | Remarks
  gSub: { width: "24%" }, gNum: { width: "11%", textAlign: "center" }, gRem: { width: "21%" },
  wrapBox: { marginTop: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 8, flexDirection: "row", flexWrap: "wrap" },
  wrapCell: { width: "25%", marginBottom: 4 },
  remarkBlock: { marginTop: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 8 },
  remarkLabel: { fontSize: 7, color: "#9ca3af", marginBottom: 2 },
  remarkText: { fontSize: 9, marginBottom: 6 },
  totalRow: { flexDirection: "row", backgroundColor: "#f9fafb", fontFamily: "Helvetica-Bold" },
  summary: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  gradeKey: { marginTop: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 4, flexDirection: "row", flexWrap: "wrap" },
  sign: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  signItem: { borderTopWidth: 1, borderColor: "#9ca3af", paddingTop: 2, width: 120, textAlign: "center", fontSize: 8, color: "#6b7280" },
});

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoCell}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoVal}>{value}</Text>
    </View>
  );
}

// Only pass safe, well-formed colors into the PDF header
function safeColor(c: string | null | undefined, fallback: string): string {
  return c && /^#[0-9a-fA-F]{3,8}$/.test(c.trim()) ? c.trim() : fallback;
}

export function ReportCardDoc(d: PdfData) {
  const headerBg = safeColor(d.headerColor, "#1d4ed8");
  return (
    <Document>
      {d.students.map((st, i) => (
        <Page key={i} size="A4" style={s.page}>
          {d.watermarkUrl ? (
            /* Faint school crest behind the page content */
            <Image
              src={d.watermarkUrl}
              style={{ position: "absolute", top: 260, left: 150, width: 300, height: 300, opacity: 0.05 }}
            />
          ) : null}

          <View style={[s.header, { backgroundColor: headerBg, flexDirection: "row", alignItems: "center" }]}>
            {d.leftLogo ? (
              <Image src={d.leftLogo} style={{ width: 52, height: 52, objectFit: "contain" }} />
            ) : (
              <View style={{ width: 52 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.school}>{d.schoolName}</Text>
              {d.address ? <Text style={s.addr}>{d.address}</Text> : null}
              <Text style={s.titleChip}>{d.title}</Text>
              {d.heading ? <Text style={s.sub}>{d.heading}</Text> : null}
              <Text style={s.sub}>{d.examName}{d.sessionLabel ? ` — ${d.sessionLabel}` : ""}</Text>
            </View>
            {d.rightLogo ? (
              <Image src={d.rightLogo} style={{ width: 52, height: 52, objectFit: "contain" }} />
            ) : (
              <View style={{ width: 52 }} />
            )}
          </View>

          <View style={s.infoBox}>
            {d.fields.name && <Info label="Student Name" value={st.name} />}
            {d.fields.admissionNo && <Info label="Admission No" value={st.admissionNo} />}
            {d.fields.rollNo && <Info label="Roll No" value={st.rollNo ?? "-"} />}
            <Info label="Class" value={st.className} />
            {d.fields.father && <Info label="Father's Name" value={st.fatherName ?? "-"} />}
            {d.fields.mother && <Info label="Mother's Name" value={st.motherName ?? "-"} />}
            {d.fields.dob && <Info label="Date of Birth" value={st.dob ?? "-"} />}
            <Info label="Gender" value={st.gender ?? "-"} />
            <Info label="Rank" value={`#${st.rank}`} />
          </View>

          {d.ges ? (
            <View style={s.table}>
              <View style={[s.tr, { backgroundColor: "#f3f4f6" }]}>
                <Text style={[s.th, s.gSub]}>Subject</Text>
                <Text style={[s.th, s.gNum]}>{d.ges.sbaLabel}</Text>
                <Text style={[s.th, s.gNum]}>{d.ges.examLabel}</Text>
                <Text style={[s.th, s.gNum]}>Total</Text>
                <Text style={[s.th, s.gNum, { width: "8%" }]}>Grade</Text>
                <Text style={[s.th, s.gNum, { width: "8%" }]}>Pos.</Text>
                <Text style={[s.th, s.gRem]}>Remarks</Text>
              </View>
              {st.rows.map((r, j) => (
                <View key={j} style={s.tr}>
                  <Text style={[s.td, s.gSub]}>{r.subject}</Text>
                  <Text style={[s.td, s.gNum]}>{r.obtained === null ? "-" : (r.classScore ?? "-")}</Text>
                  <Text style={[s.td, s.gNum]}>{r.obtained === null ? "-" : (r.examScore ?? "-")}</Text>
                  <Text style={[s.td, s.gNum]}>{r.obtained === null ? "ABS" : r.obtained}</Text>
                  <Text style={[s.td, s.gNum, { width: "8%" }]}>{r.grade ?? "-"}</Text>
                  <Text style={[s.td, s.gNum, { width: "8%" }]}>{r.position ? `${r.position}` : "-"}</Text>
                  <Text style={[s.td, s.gRem]}>{r.remark ?? ""}</Text>
                </View>
              ))}
              <View style={s.totalRow}>
                <Text style={[s.td, s.gSub]}>TOTAL</Text>
                <Text style={[s.td, s.gNum]}>-</Text>
                <Text style={[s.td, s.gNum]}>-</Text>
                <Text style={[s.td, s.gNum]}>{st.totalObtained}</Text>
                <Text style={[s.td, s.gNum, { width: "8%" }]}>-</Text>
                <Text style={[s.td, s.gNum, { width: "8%" }]}>-</Text>
                <Text style={[s.td, s.gRem]}>{st.pct}% overall</Text>
              </View>
            </View>
          ) : (
            <View style={s.table}>
              <View style={[s.tr, { backgroundColor: "#f3f4f6" }]}>
                <Text style={[s.th, s.cSub]}>Subject</Text>
                <Text style={[s.th, s.cNum]}>Max</Text>
                <Text style={[s.th, s.cNum]}>Pass</Text>
                <Text style={[s.th, s.cNum]}>Obtained</Text>
                <Text style={[s.th, s.cNum]}>Grade</Text>
              </View>
              {st.rows.map((r, j) => (
                <View key={j} style={s.tr}>
                  <Text style={[s.td, s.cSub]}>{r.subject}</Text>
                  <Text style={[s.td, s.cNum]}>{r.full}</Text>
                  <Text style={[s.td, s.cNum]}>{r.passing}</Text>
                  <Text style={[s.td, s.cNum]}>{r.obtained === null ? "ABS" : r.obtained}</Text>
                  <Text style={[s.td, s.cNum]}>{r.grade ?? "-"}</Text>
                </View>
              ))}
              <View style={s.totalRow}>
                <Text style={[s.td, s.cSub]}>TOTAL</Text>
                <Text style={[s.td, s.cNum]}>{st.totalFull}</Text>
                <Text style={[s.td, s.cNum]}>-</Text>
                <Text style={[s.td, s.cNum]}>{st.totalObtained}</Text>
                <Text style={[s.td, s.cNum]}>{st.pct}%</Text>
              </View>
            </View>
          )}

          {d.ges && st.report && (
            <View style={s.wrapBox}>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Attendance</Text>
                <Text style={s.infoVal}>
                  {st.report.attendancePresent ?? "-"} out of {st.report.attendanceTotal ?? "-"}
                </Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Position in Class</Text>
                <Text style={s.infoVal}>#{st.rank}{d.ges.onRoll ? ` of ${d.ges.onRoll}` : ""}</Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Conduct</Text>
                <Text style={s.infoVal}>{st.report.conduct ?? "-"}</Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Attitude</Text>
                <Text style={s.infoVal}>{st.report.attitude ?? "-"}</Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Interest</Text>
                <Text style={s.infoVal}>{st.report.interest ?? "-"}</Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Promoted To</Text>
                <Text style={s.infoVal}>{st.report.promotedTo ?? "-"}</Text>
              </View>
              <View style={s.wrapCell}>
                <Text style={s.infoLabel}>Next Term Begins</Text>
                <Text style={s.infoVal}>{st.report.nextTermBegins ?? "-"}</Text>
              </View>
            </View>
          )}

          {d.ges && st.report && (st.report.classTeacherRemark || st.report.headTeacherRemark) && (
            <View style={s.remarkBlock}>
              {st.report.classTeacherRemark ? (
                <>
                  <Text style={s.remarkLabel}>CLASS TEACHER&apos;S REMARKS</Text>
                  <Text style={s.remarkText}>{st.report.classTeacherRemark}</Text>
                </>
              ) : null}
              {st.report.headTeacherRemark ? (
                <>
                  <Text style={s.remarkLabel}>HEAD TEACHER&apos;S REMARKS</Text>
                  <Text style={s.remarkText}>{st.report.headTeacherRemark}</Text>
                </>
              ) : null}
            </View>
          )}

          {d.gradeKey.length > 0 && (
            <View style={s.gradeKey}>
              <Text style={{ fontFamily: "Helvetica-Bold", marginRight: 6 }}>Grading Key: </Text>
              {d.gradeKey.map((g) => <Text key={g.grade} style={{ marginRight: 8 }}>{g.grade} {g.from}-{g.to}%</Text>)}
            </View>
          )}

          <View style={s.summary}>
            <View>
              <Text>Percentage: {st.pct}%</Text>
              <Text>Division: {st.division}</Text>
              <Text>Overall Result: {st.allPassed ? "PASSED" : "FAILED"}</Text>
            </View>
            <Text style={{ fontSize: 7, color: "#9ca3af" }}>Issued: {d.printDate}</Text>
          </View>

          <View style={s.sign}>
            {[d.leftSign, d.middleSign, d.rightSign].filter(Boolean).map((label, k) => (
              <Text key={k} style={s.signItem}>{label}</Text>
            ))}
          </View>

          {d.footerText ? (
            <Text style={{ marginTop: 14, textAlign: "center", fontSize: 8, color: "#6b7280" }}>
              {d.footerText}
            </Text>
          ) : null}
        </Page>
      ))}
    </Document>
  );
}
