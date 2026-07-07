import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

// Generic tabular report PDF: school header, report title, optional filter
// subtitle, an auto-sized table (columns from the first row's keys) and page
// numbers. Landscape when the table is wide.

export type TabularPdfData = {
  schoolName: string;
  address?: string | null;
  title: string;
  subtitle?: string | null;
  columns: string[];
  rows: string[][];
  generatedAt: string;
};

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 44, paddingHorizontal: 34, fontSize: 8.5, color: "#111827" },
  school: { fontSize: 13, fontWeight: 700, textAlign: "center" },
  address: { fontSize: 8, color: "#6b7280", textAlign: "center", marginTop: 2 },
  title: { fontSize: 10.5, fontWeight: 700, textAlign: "center", marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  subtitle: { fontSize: 8, color: "#6b7280", textAlign: "center", marginTop: 3 },
  rule: { borderBottomWidth: 2, borderBottomColor: "#111827", borderBottomStyle: "solid", marginTop: 8, marginBottom: 10 },
  headRow: { flexDirection: "row", backgroundColor: "#f3f4f6", borderBottomWidth: 1, borderBottomColor: "#d1d5db" },
  headCell: { fontWeight: 700, paddingVertical: 4, paddingHorizontal: 4 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  rowAlt: { backgroundColor: "#f9fafb" },
  cell: { paddingVertical: 3.5, paddingHorizontal: 4 },
  footer: {
    position: "absolute", bottom: 20, left: 34, right: 34,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 7, color: "#9ca3af",
  },
});

export function TabularReportDoc({ data }: { data: TabularPdfData }) {
  const wide = data.columns.length > 7;
  const colWidth = `${100 / data.columns.length}%`;

  return (
    <Document title={data.title}>
      <Page size="A4" orientation={wide ? "landscape" : "portrait"} style={s.page}>
        <Text style={s.school}>{data.schoolName}</Text>
        {data.address ? <Text style={s.address}>{data.address}</Text> : null}
        <Text style={s.title}>{data.title}</Text>
        {data.subtitle ? <Text style={s.subtitle}>{data.subtitle}</Text> : null}
        <View style={s.rule} />

        <View style={s.headRow} fixed>
          {data.columns.map((c, i) => (
            <Text key={i} style={[s.headCell, { width: colWidth }]}>{c}</Text>
          ))}
        </View>
        {data.rows.map((r, ri) => (
          <View key={ri} style={ri % 2 === 1 ? [s.row, s.rowAlt] : s.row} wrap={false}>
            {r.map((v, ci) => (
              <Text key={ci} style={[s.cell, { width: colWidth }]}>{v}</Text>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>{data.rows.length} record{data.rows.length === 1 ? "" : "s"} · generated {data.generatedAt}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
