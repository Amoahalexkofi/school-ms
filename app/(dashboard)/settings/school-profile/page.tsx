import { getSchoolProfile } from "@/lib/services/school-profile";
import { Topbar } from "@/components/Topbar";
import { SchoolProfileForm } from "./SchoolProfileForm";

export default async function SchoolProfilePage() {
  const profile = await getSchoolProfile();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="School Profile" />
      <SchoolProfileForm profile={profile} />
    </div>
  );
}
