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
          padding: "80px 90px",
          background: "#1c1e54",
          backgroundImage:
            "radial-gradient(120% 100% at 15% 0%, rgba(83,58,253,0.35) 0%, transparent 60%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} height={64} style={{ objectFit: "contain", marginBottom: 44 }} />
        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1.15,
            maxWidth: 900,
            display: "flex",
          }}
        >
          The all-in-one school management platform
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#c9d4f2",
            marginTop: 22,
            display: "flex",
          }}
        >
          Admissions · Fees · Attendance · Exams · Payroll · Parent communication
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#533afd",
              color: "#fff",
              fontSize: 18,
              fontWeight: 600,
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            getskula.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#a5b4fc",
              fontSize: 18,
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
