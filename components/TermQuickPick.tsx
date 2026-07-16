"use client";

// One-click date ranges in the language schools plan in. Renders nothing when
// the school hasn't set up terms — the from/to inputs remain the fallback.
type Term = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  sessionId: string;
};

const iso = (d: string) => new Date(d).toISOString().slice(0, 10);

export function TermQuickPick({
  terms, sessionId, onPick,
}: {
  terms: Term[];
  sessionId?: string;          // filter to a session when the report has one selected
  onPick: (from: string, to: string) => void;
}) {
  const visible = sessionId ? terms.filter(t => t.sessionId === sessionId) : terms;
  if (!visible.length) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick range</span>
      {visible.map(t => (
        <button key={t.id} type="button"
          onClick={() => onPick(iso(t.startDate), iso(t.endDate))}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            t.isCurrent
              ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
          }`}>
          {t.name}{t.isCurrent ? " · current" : ""}
        </button>
      ))}
    </div>
  );
}
