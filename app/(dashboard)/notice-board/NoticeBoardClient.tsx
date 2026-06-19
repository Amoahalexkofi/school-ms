"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Trash2, Plus } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

const audienceColor: Record<string, string> = { ALL: "bg-blue-100 text-blue-700", STAFF: "bg-purple-100 text-purple-700", STUDENTS: "bg-green-100 text-green-700", PARENTS: "bg-orange-100 text-orange-700" };

export function NoticeBoardClient({ notices }: any) {
  const perm = usePermission("communicate");
  const router = useRouter();

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    await fetch("/api/notices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{notices.length} notice{notices.length !== 1 ? "s" : ""}</p>
        {perm.canAdd && (
          <Link href="/notice-board/new">
            <Button><Plus className="h-4 w-4 mr-1" /> Post Notice</Button>
          </Link>
        )}
      </div>

      {notices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-gray-500">No notices posted yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-blue-600 shrink-0" />
                    <h3 className="font-semibold text-base">{notice.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${audienceColor[notice.audience]}`}>{notice.audience}</span>
                  </div>
                  {perm.canDelete && (
                    <button onClick={() => deleteNotice(notice.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t">
                  {notice.postedBy.firstName} {notice.postedBy.lastName} · {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </main>
  );
}
