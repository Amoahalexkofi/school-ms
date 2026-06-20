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
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e0e7ff 100%)",
          position: "relative",
        }}
      >
        {/* Top brand accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            display: "flex",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
          }}
        />

        {/* Logo (already includes tagline + url) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Skula" width={860} style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size }
  );
}
