"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Encodes a real, scannable code — the fake barcode this replaced was just
// monospace text (`*{admissionNo}*`) with no actual encoding behind it.
// "SKULA:" prefix lets the scanner reject an unrelated QR code (a poster,
// a random link) with a clean "not a valid attendance code" message
// instead of a confusing lookup failure.
export function studentQrValue(admissionNo: string) {
  return `SKULA:STUDENT:${admissionNo}`;
}
export function staffQrValue(employeeId: string) {
  return `SKULA:STAFF:${employeeId}`;
}

export function AttendanceQrCode({ value, size = 96 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size * 2, margin: 0, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(url => { if (!cancelled) setSrc(url); })
      .catch(() => { if (!cancelled) setSrc(null); });
    return () => { cancelled = true; };
  }, [value, size]);

  if (!src) return <div style={{ width: size, height: size }} className="bg-slate-100 rounded animate-pulse" />;
  return <img src={src} alt="Scan to mark attendance" width={size} height={size} className="rounded" />;
}
