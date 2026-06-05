import { Topbar } from "@/components/Topbar";
import { PostNoticeForm } from "./PostNoticeForm";

export default async function NewNoticePage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Post Notice" />
      <PostNoticeForm />
    </div>
  );
}
