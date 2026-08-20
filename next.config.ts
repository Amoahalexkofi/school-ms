import type { NextConfig } from "next";

// Deliberately permissive on script/style/img sources rather than a
// nonce-based strict policy — this app has no nonce plumbing wired through
// its scripts today, and getting a strict CSP wrong ships as a silent,
// hard-to-detect breakage (blank pages, missing styles) rather than a loud
// error. connect-src and script-src are still scoped to 'self': every
// external service call (payment gateways, SMS/email/WhatsApp providers)
// happens server-side in API routes, never from client-side JS, so this
// still blocks the two things that matter most if an XSS payload ever did
// land — loading a remote attacker script, and exfiltrating data via fetch
// to an attacker-controlled domain.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
