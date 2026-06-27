import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

export type PdfRow = { subject: string; full: number; passing: number; obtained: number | null; grade: string | null; isPassing: boolean };
export type PdfStudent = {
  name: string; admissionNo: string; rollNo?: string | null; className: string;
  fatherName?: string | null; motherName?: string | null; dob?: string | null; gender?: string | null;
  rows: PdfRow[]; totalFull: number; totalObtained: number; pct: number; division: string; allPassed: boolean; rank: number;
};
export type PdfData = {
  schoolName: string; address?: string | null; title: string; heading?: string;
  examName: string; sessionLabel: string;
  leftSign: string; middleSign?: string; rightSign: string;
  gradeKey: { grade: string; from: number; to: number }[];
  fields: { name: boolean; father: boolean; mother: boolean; dob: boolean; admissionNo: boolean; rollNo: boolean };
  students: PdfStudent[];
  printDate: string;
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

export function ReportCardDoc(d: PdfData) {
  return (
    <Document>
      {d.students.map((st, i) => (
        <Page key={i} size="A4" style={s.page}>
          <View style={s.header}>
            <Text style={s.school}>{d.schoolName}</Text>
            {d.address ? <Text style={s.addr}>{d.address}</Text> : null}
            <Text style={s.titleChip}>{d.title}</Text>
            {d.heading ? <Text style={s.sub}>{d.heading}</Text> : null}
            <Text style={s.sub}>{d.examName} — {d.sessionLabel}</Text>
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
        </Page>
      ))}
    </Document>
  );
}
