"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Page failed to load</h2>
        <p className="text-sm text-gray-500 mb-2">{error.message || "An unexpected error occurred."}</p>
        {error.digest && <p className="text-xs text-gray-400 font-mono mb-6">Error ID: {error.digest}</p>}
        <div className="flex gap-2 justify-center">
          <Button onClick={reset} size="sm">Try again</Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
