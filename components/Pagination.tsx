"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function Pagination({ page, totalPages, total, limit }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params}`);
  }

  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  if (totalPages <= 1 && total <= limit) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[13px] text-slate-500">
      <span>{total === 0 ? "No results" : `${from}–${to} of ${total}`}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 font-medium text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
