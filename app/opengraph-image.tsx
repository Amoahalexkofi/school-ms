import { ImageResponse } from "next/og";

export const alt = "Skula — School Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated branded share card. ImageResponse fetches the remote logo
// (reading from /public via fs is unreliable on Vercel functions).
const LOGO_URL = "https://getskula.com/images/skula-logo.png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          position: "relative",
        }}
      >
        {/* Gradient mesh — matches the site hero */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(110% 80% at 88% 0%, rgba(83,58,253,0.40) 0%, rgba(83,58,253,0) 55%), " +
              "radial-gradient(70% 60% at 100% 45%, rgba(234,34,97,0.22) 0%, rgba(234,34,97,0) 55%), " +
              "radial-gradient(80% 70% at 25% 0%, rgba(245,233,212,0.9) 0%, rgba(245,233,212,0) 65%), " +
              "radial-gradient(90% 80% at 0% 35%, rgba(185,185,249,0.50) 0%, rgba(185,185,249,0) 60%), " +
              "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
          }}
        />

        {/* Logo (already includes tagline + url) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Skula" width={820} style={{ objectFit: "contain" }} />

        {/* Footer line */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            fontSize: 26,
            color: "#64748d",
            fontWeight: 400,
          }}
        >
          Fees · Attendance · GES report cards · WhatsApp alerts — getskula.com
        </div>
      </div>
    ),
    { ...size }
  );
}
