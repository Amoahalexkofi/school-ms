import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

async function getNotices() {
  return (prisma as any).notice.findMany({
    where: { isPublished: true },
    include: { postedBy: true },
    orderBy: { createdAt: "desc" },
  });
}

const audienceColor: Record<string, string> = {
  ALL:      "bg-blue-100 text-blue-700",
  STAFF:    "bg-purple-100 text-purple-700",
  STUDENTS: "bg-green-100 text-green-700",
  PARENTS:  "bg-orange-100 text-orange-700",
};

export default async function NoticeBoardPage() {
  const notices = await getNotices();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notice Board" />
      <main className="flex-1 p-6 space-y-6">

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{notices.length} notice{notices.length !== 1 ? "s" : ""} published</p>
        </div>

        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-gray-500">
              No notices posted yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice: any) => (
              <Card key={notice.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-blue-600 shrink-0" />
                      <h3 className="font-semibold text-base">{notice.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${audienceColor[notice.audience] ?? "bg-gray-100 text-gray-600"}`}>
                      {notice.audience}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                  <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs text-gray-400">
                    <span>Posted by {notice.postedBy.firstName} {notice.postedBy.lastName}</span>
                    <span>·</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
