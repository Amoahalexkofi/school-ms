import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Skula — School Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/images/skula-logomark.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px 96px",
          background: "#f6f9fc",
          backgroundImage:
            "radial-gradient(60% 75% at 92% 8%, rgba(83,58,253,0.16) 0%, transparent 62%), radial-gradient(45% 60% at 4% 100%, rgba(83,58,253,0.10) 0%, transparent 65%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} height={54} style={{ objectFit: "contain", marginBottom: 40 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(83,58,253,0.10)",
            color: "#533afd",
            fontSize: 18,
            fontWeight: 700,
            padding: "8px 18px",
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          Built for African schools
        </div>

        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: "#0d253d",
            letterSpacing: "-2px",
            lineHeight: 1.08,
            maxWidth: 940,
            display: "flex",
          }}
        >
          The all-in-one school management platform
        </div>
        <div
          style={{
            fontSize: 25,
            color: "#64748d",
            marginTop: 24,
            display: "flex",
          }}
        >
          Admissions · Fees · Attendance · Exams · Payroll · Parent communication
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 52,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#533afd",
              color: "#fff",
              fontSize: 19,
              fontWeight: 700,
              padding: "12px 26px",
              borderRadius: 999,
            }}
          >
            getskula.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#94a3b8",
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            15 modules · one subscription
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
