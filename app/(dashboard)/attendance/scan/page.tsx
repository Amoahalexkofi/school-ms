import { notFound } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { isAddonEnabled } from "@/lib/addons";
import { getSchoolProfile } from "@/lib/services/school-profile";
import { ScanClient } from "./ScanClient";

export default async function AttendanceScanPage() {
  if (!(await isAddonEnabled("qr_attendance"))) notFound();

  const profile = await getSchoolProfile();
  const geofenceConfigured = Number.isFinite(profile?.latitude) && Number.isFinite(profile?.longitude);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Scan Attendance" />
      <ScanClient geofenceConfigured={geofenceConfigured} />
    </div>
  );
}
