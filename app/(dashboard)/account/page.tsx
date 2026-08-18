import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AccountProfileForm } from "./AccountProfileForm";

export default async function AccountPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  let user: { username: string; email: string; image: string | null } | null = null;
  if (userId) {
    user = await ((await getDb()) as any).user
      .findUnique({ where: { id: userId }, select: { username: true, email: true, image: true } })
      .catch(() => null);
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Account" />
      <AccountProfileForm
        username={user?.username ?? ""}
        email={user?.email ?? ""}
        image={user?.image ?? ""}
      />
    </div>
  );
}
