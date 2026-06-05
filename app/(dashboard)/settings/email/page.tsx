import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { EmailConfigClient } from "./EmailConfigClient";

export default async function EmailConfigPage() {
  const config = await (prisma as any).emailConfig.findFirst();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Email Configuration" />
      <EmailConfigClient config={config} />
    </div>
  );
}
