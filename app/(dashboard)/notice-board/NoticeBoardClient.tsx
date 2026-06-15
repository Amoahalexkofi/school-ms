"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Trash2, Plus } from "lucide-react";

const audienceColor: Record<string, string> = { ALL: "bg-blue-500/10 text-blue-400", STAFF: "bg-violet-500/10 text-violet-400", STUDENTS: "bg-emerald-500/10 text-emerald-400", PARENTS: "bg-orange-500/10 text-orange-400" };

export function NoticeBoardClient({ notices }: any) {
  const router = useRouter();

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    await fetch("/api/notices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{notices.length} notice{notices.length !== 1 ? "s" : ""}</p>
        <Link href="/notice-board/new">
          <Button><Plus className="h-4 w-4 mr-1" /> Post Notice</Button>
        </Link>
      </div>

      {notices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-white/40">No notices posted yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-blue-400 shrink-0" />
                    <h3 className="font-semibold text-base">{notice.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${audienceColor[notice.audience]}`}>{notice.audience}</span>
                  </div>
                  <button onClick={() => deleteNotice(notice.id)} className="text-white/30 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-white/60 whitespace-pre-wrap">{notice.content}</p>
                <p className="text-xs text-white/30 mt-3 pt-3 border-t">
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
