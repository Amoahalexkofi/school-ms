import { Topbar } from "@/components/Topbar";
import { ScanClient } from "./ScanClient";

export default async function AttendanceScanPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Scan Attendance" />
      <ScanClient />
    </div>
  );
}
