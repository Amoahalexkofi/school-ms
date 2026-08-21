import { getSchoolProfile } from "@/lib/services/school-profile";
import { Topbar } from "@/components/Topbar";
import { isAddonEnabled } from "@/lib/addons";
import { SchoolProfileForm } from "./SchoolProfileForm";

export default async function SchoolProfilePage() {
  const [profile, qrAttendanceEnabled] = await Promise.all([
    getSchoolProfile(),
    isAddonEnabled("qr_attendance"),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="School Profile" />
      <SchoolProfileForm profile={profile} qrAttendanceEnabled={qrAttendanceEnabled} />
    </div>
  );
}
