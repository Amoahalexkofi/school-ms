"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, MapPin, Camera as CameraIcon, Settings } from "lucide-react";

type Result = { ok: true; already: boolean; name: string; status: string } | { ok: false; error: string };

export function ScanClient({ geofenceConfigured }: { geofenceConfigured: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const [locStatus, setLocStatus] = useState<"asking" | "ready" | "denied">("asking");
  const [locError, setLocError] = useState("Location access is required to mark attendance. Allow it in your browser settings and reload.");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!geofenceConfigured) return;
    if (!("geolocation" in navigator)) {
      setLocStatus("denied");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocStatus("ready");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocError("Location access is blocked for this site — allow it in your browser's site settings (and OS Location Services), then reload.");
        } else if (err.code === err.TIMEOUT) {
          setLocError("Location request timed out — check your signal and reload.");
        } else {
          setLocError("Couldn't determine your location — make sure Location Services is on for your browser, then reload.");
        }
        setLocStatus("denied");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [geofenceConfigured]);

  useEffect(() => {
    if (locStatus !== "ready" || !videoRef.current) return;
    let cancelled = false;

    import("qr-scanner").then(({ default: QrScanner }) => {
      if (cancelled || !videoRef.current) return;
      QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

      const scanner = new QrScanner(
        videoRef.current,
        (res: { data: string }) => handleDecode(res.data),
        { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 5 }
      );
      scannerRef.current = scanner;
      scanner.start().catch((err: any) => setCameraError(err?.message ?? "Couldn't access the camera"));
    });

    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [locStatus]);

  async function handleDecode(code: string) {
    if (busyRef.current || !coordsRef.current) return;
    busyRef.current = true;
    scannerRef.current?.pause();

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lat: coordsRef.current.lat, lng: coordsRef.current.lng }),
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true, ...data } : { ok: false, error: data.error ?? "Couldn't mark attendance" });
    } catch {
      setResult({ ok: false, error: "Network error — try again" });
    }

    setTimeout(() => {
      setResult(null);
      busyRef.current = false;
      scannerRef.current?.start();
    }, 2500);
  }

  if (!geofenceConfigured) {
    return (
      <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-sm mt-2 bg-white rounded-2xl border border-slate-200/80 px-6 py-6 text-center space-y-3">
          <MapPin className="h-6 w-6 text-amber-500 mx-auto" />
          <p className="text-[14px] font-semibold text-slate-900">Attendance scanning isn't set up yet</p>
          <p className="text-[13px] text-slate-500">
            The school's location hasn't been configured, so scans can't be verified yet. An admin needs to set it in School Profile first.
          </p>
          <Link href="/settings/school-profile" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-700">
            <Settings className="h-3.5 w-3.5" /> Go to School Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-4 mt-2">
        <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-5">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            {locStatus === "asking" && "Getting your location…"}
            {locStatus === "ready" && "Got your location — point the camera at a card's QR code"}
            {locStatus === "denied" && locError}
          </div>
        </div>

        {locStatus === "ready" && (
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-2 text-white text-center px-6">
                <CameraIcon className="h-6 w-6 text-slate-400" />
                <p className="text-[13px] text-slate-300">{cameraError}</p>
              </div>
            )}
            {result && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-2 text-center px-6">
                {result.ok ? (
                  <>
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                    <p className="text-white font-semibold">{result.name}</p>
                    <p className="text-[13px] text-slate-300">
                      {result.already ? `Already marked — ${result.status}` : `Marked ${result.status}`}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-9 w-9 text-red-400" />
                    <p className="text-[13px] text-slate-300">{result.error}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-[12px] text-slate-400 text-center">
          Hold your ID card's QR code up to the camera. Attendance can only be marked from within school grounds.
        </p>
      </div>
    </main>
  );
}
