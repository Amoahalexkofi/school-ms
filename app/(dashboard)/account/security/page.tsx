import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountSecurityPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  let forced = false;
  if (userId) {
    const me = await ((await getDb()) as any).user
      .findUnique({ where: { id: userId }, select: { mustChangePassword: true } })
      .catch(() => null);
    forced = !!me?.mustChangePassword;
  }
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Account Security" />
      <ChangePasswordForm forced={forced} />
    </div>
  );
}
