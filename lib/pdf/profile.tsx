import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

export type ProfileField = { label: string; value: string };
export type ProfileSection = { title: string; fields: ProfileField[] };
export type ProfileDocData = {
  schoolName: string;
  address?: string | null;
  logo?: string | null;
  headerColor?: string | null;
  docTitle: string;
  photo?: string | null;
  name: string;
  idLabel: string;
  idValue: string;
  subLabel?: string;
  subValue?: string;
  status: string;
  sections: ProfileSection[];
  printDate: string;
};

const s = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica", color: "#111827" },
  header: { backgroundColor: "#1d4ed8", color: "#fff", padding: 12, borderRadius: 4, flexDirection: "row", alignItems: "center" },
  school: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  addr: { fontSize: 8, color: "#dbeafe", marginTop: 2 },
  titleChip: { marginTop: 6, fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  identity: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderTopWidth: 0, padding: 12, gap: 12 },
  photo: { width: 64, height: 64, borderRadius: 32, objectFit: "cover" },
  photoPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  idRow: { flexDirection: "row", marginTop: 3, gap: 14 },
  idLabel: { fontSize: 7, color: "#9ca3af" },
  idValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  statusChip: { marginLeft: "auto", fontSize: 8, fontFamily: "Helvetica-Bold", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  section: { marginTop: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4 },
  sectionTitle: { backgroundColor: "#f3f4f6", padding: 6, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#374151" },
  sectionBody: { flexDirection: "row", flexWrap: "wrap", padding: 8 },
  field: { width: "33%", marginBottom: 6, paddingRight: 6 },
  fieldLabel: { fontSize: 7, color: "#9ca3af" },
  fieldValue: { fontSize: 9, marginTop: 1 },
  footer: { marginTop: 16, textAlign: "center", fontSize: 7, color: "#9ca3af" },
});

function safeColor(c: string | null | undefined, fallback: string): string {
  return c && /^#[0-9a-fA-F]{3,8}$/.test(c.trim()) ? c.trim() : fallback;
}

export function ProfileDoc(d: ProfileDocData) {
  const headerBg = safeColor(d.headerColor, "#1d4ed8");
  const isActive = d.status.toLowerCase() === "active";
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={[s.header, { backgroundColor: headerBg }]}>
          {d.logo ? (
            <Image src={d.logo} style={{ width: 44, height: 44, objectFit: "contain", marginRight: 10 }} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={s.school}>{d.schoolName}</Text>
            {d.address ? <Text style={s.addr}>{d.address}</Text> : null}
            <Text style={s.titleChip}>{d.docTitle.toUpperCase()}</Text>
          </View>
        </View>

        <View style={s.identity}>
          {d.photo ? (
            <Image src={d.photo} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4338ca" }}>
                {d.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{d.name}</Text>
            <View style={s.idRow}>
              <View>
                <Text style={s.idLabel}>{d.idLabel}</Text>
                <Text style={s.idValue}>{d.idValue}</Text>
              </View>
              {d.subLabel && d.subValue ? (
                <View>
                  <Text style={s.idLabel}>{d.subLabel}</Text>
                  <Text style={s.idValue}>{d.subValue}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Text
            style={[
              s.statusChip,
              isActive ? { backgroundColor: "#dcfce7", color: "#15803d" } : { backgroundColor: "#fef2f2", color: "#b91c1c" },
            ]}
          >
            {d.status}
          </Text>
        </View>

        {d.sections.map((sec, i) => (
          <View key={i} style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <View style={s.sectionBody}>
              {sec.fields.map((f, j) => (
                <View key={j} style={s.field}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <Text style={s.fieldValue}>{f.value || "—"}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={s.footer}>Generated {d.printDate} · Powered by Skula</Text>
      </Page>
    </Document>
  );
}
