"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/Topbar";
import {
  Send, MessageCircle, Users, Plus, Search, X, ArrowLeft, ArrowDown,
  AlertCircle, RotateCw, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────── types ────────────────────────────── */

type Person = {
  id: string;
  email: string;
  username?: string | null;
  staff?: { firstName: string; lastName: string } | null;
  student?: { firstName: string; lastName: string } | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: Person;
};

/** A message typed but not yet acknowledged by the server. */
type Outgoing = {
  tempId: string;
  content: string;
  createdAt: string;
  status: "sending" | "failed";
};

type Room = {
  id: string;
  name: string | null;
  type: "DIRECT" | "GROUP";
  participants: { userId: string; user: Person }[];
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
};

type DirectoryEntry = { userId: string; name: string; role: string };

const POLL_MS = 4000;
/** Treat "within this many px of the bottom" as reading the live tail. */
const STICK_THRESHOLD = 120;
/** Messages from one sender inside this window render as a single run. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

/* ────────────────────────────── helpers ────────────────────────────── */

function personName(p: Person | undefined | null) {
  if (!p) return "Unknown";
  if (p.staff) return `${p.staff.firstName} ${p.staff.lastName}`.trim();
  if (p.student) return `${p.student.firstName} ${p.student.lastName}`.trim();
  // Admin accounts have no staff row; a username beats a raw email address.
  return p.username || p.email.split("@")[0];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roomLabel(room: Room, myId: string) {
  if (room.name) return room.name;
  if (room.type === "DIRECT") {
    const other = room.participants.find((p) => p.userId !== myId);
    return other ? personName(other.user) : "Direct message";
  }
  return "Group";
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(d: Date) {
  const now = new Date();
  if (sameDay(d, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Fold a freshly-polled tail into what the client already holds.
 *
 * The poll only ever returns the newest page, so replacing outright would
 * discard any older pages the reader deliberately loaded — their history would
 * vanish a few seconds after "Load earlier".
 */
function mergeTail(prev: Message[] | null, tail: Message[]): Message[] {
  if (!prev?.length) return tail;
  if (!tail.length) return prev;
  const tailStart = new Date(tail[0].createdAt).getTime();
  const inTail = new Set(tail.map((m) => m.id));
  const older = prev.filter(
    (m) => new Date(m.createdAt).getTime() < tailStart && !inTail.has(m.id)
  );
  return [...older, ...tail];
}

/** Compact "when did this room last see activity" for the conversation list. */
function relativeTime(iso: string) {
  const then = new Date(iso);
  const mins = Math.floor((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (sameDay(then, new Date())) return clockTime(iso);
  const days = Math.floor(mins / 1440);
  if (days < 7) return dayLabel(then).slice(0, 3);
  return then.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* ────────────────────────────── component ────────────────────────────── */

export function ChatClient() {
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id ?? "";

  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [outbox, setOutbox] = useState<Outgoing[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [threadError, setThreadError] = useState<string | null>(null);
  const [unseenBelow, setUnseenBelow] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  /** Is the reader parked at the live tail? Drives whether we auto-scroll. */
  const stickToBottom = useRef(true);
  /** Room whose scroll position has already been initialised. */
  const initialisedRoom = useRef<string | null>(null);
  /** True once "Load earlier" has walked back to the first message. */
  const reachedStart = useRef(false);

  /* ── viewport lock ──
   * The dashboard shell is min-height driven, so a flex-1 child just grows and
   * the *document* becomes the scroller. Chat needs the opposite: pin the shell
   * to exactly the space left under the app chrome (which varies — mobile
   * header, demo banner) so the message pane is the only thing that scrolls. */
  const [shellHeight, setShellHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const el = rootRef.current;
      if (!el) return;
      const offsetFromDocTop = el.getBoundingClientRect().top + window.scrollY;
      setShellHeight(window.innerHeight - offsetFromDocTop);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ── conversations ── */

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (Array.isArray(data)) setRooms(data);
    } catch {
      setRooms((r) => r ?? []);
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const t = setInterval(loadRooms, POLL_MS);
    return () => clearInterval(t);
  }, [loadRooms]);

  /* ── thread ── */

  const loadThread = useCallback(async (roomId: string) => {
    const res = await fetch(`/api/chat/${roomId}`);
    if (!res.ok) {
      setThreadError(res.status === 404 ? "This conversation is no longer available." : "Couldn't load messages.");
      return;
    }
    const data = await res.json();
    setThreadError(null);
    setMessages((prev) => mergeTail(prev, data.messages ?? []));
    // Once the reader has paged back to the very start, the tail's own
    // "there is more" must not resurrect the Load-earlier button.
    setHasMore(reachedStart.current ? false : Boolean(data.hasMore));
  }, []);

  // Open a room: reset thread state, then poll it.
  useEffect(() => {
    if (!activeRoomId) return;
    setMessages(null);
    setOutbox([]);
    setHasMore(false);
    setUnseenBelow(false);
    stickToBottom.current = true;
    initialisedRoom.current = null;
    reachedStart.current = false;

    loadThread(activeRoomId);
    const t = setInterval(() => loadThread(activeRoomId), POLL_MS);
    return () => clearInterval(t);
  }, [activeRoomId, loadThread]);

  // Opening a room clears its badge locally; the server clears it on GET.
  useEffect(() => {
    if (!activeRoomId) return;
    setRooms((prev) =>
      prev?.map((r) => (r.id === activeRoomId ? { ...r, unreadCount: 0 } : r)) ?? prev
    );
  }, [activeRoomId, messages]);

  /* ── scrolling ──
   * The message pane is the only scroller. We never call scrollIntoView: it
   * walks up the ancestor chain and drags the whole page with it, which is
   * what made this view jitter every poll. */

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = paneRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : behavior });
    setUnseenBelow(false);
  }, []);

  function onPaneScroll() {
    const el = paneRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < STICK_THRESHOLD;
    if (stickToBottom.current) setUnseenBelow(false);
  }

  const lastMessageId = messages?.[messages.length - 1]?.id ?? null;
  const lastSenderId = messages?.[messages.length - 1]?.senderId ?? null;

  useLayoutEffect(() => {
    if (!activeRoomId || !messages) return;

    // First paint of a room lands at the bottom with no animation.
    if (initialisedRoom.current !== activeRoomId) {
      initialisedRoom.current = activeRoomId;
      scrollToBottom("auto");
      return;
    }
    // Afterwards only follow if the reader is already at the tail, or the new
    // message is their own. Otherwise offer the jump-to-latest pill instead.
    // Own messages snap ("auto"); a smooth animation can be dropped entirely
    // when the tab isn't animating, which would strand you above your own send.
    if (lastSenderId === myId) scrollToBottom("auto");
    else if (stickToBottom.current) scrollToBottom("smooth");
    else if (lastMessageId) setUnseenBelow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId, activeRoomId]);

  // Your own pending message should always be visible the instant it appears.
  useLayoutEffect(() => {
    if (outbox.length && stickToBottom.current) scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outbox.length]);

  async function loadOlder() {
    const el = paneRef.current;
    if (!activeRoomId || !messages?.length || !el || loadingOlder) return;
    setLoadingOlder(true);
    // Anchor on distance-from-bottom so the view doesn't jump when we prepend.
    const anchor = el.scrollHeight - el.scrollTop;
    try {
      const res = await fetch(`/api/chat/${activeRoomId}?before=${encodeURIComponent(messages[0].createdAt)}`);
      if (res.ok) {
        const data = await res.json();
        const older: Message[] = data.messages ?? [];
        if (older.length) {
          setMessages((prev) => {
            const have = new Set((prev ?? []).map((m) => m.id));
            return [...older.filter((m) => !have.has(m.id)), ...(prev ?? [])];
          });
          requestAnimationFrame(() => { el.scrollTop = el.scrollHeight - anchor; });
        }
        if (!data.hasMore) reachedStart.current = true;
        setHasMore(Boolean(data.hasMore));
      }
    } finally {
      setLoadingOlder(false);
    }
  }

  /* ── sending ──
   * Optimistic: the message renders immediately from the outbox, then moves
   * into the confirmed list when the server acknowledges it. */

  const deliver = useCallback(
    async (roomId: string, item: Outgoing) => {
      try {
        const res = await fetch(`/api/chat/${roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: item.content }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const saved: Message = await res.json();
        setMessages((prev) => {
          const list = prev ?? [];
          return list.some((m) => m.id === saved.id) ? list : [...list, saved];
        });
        setOutbox((prev) => prev.filter((o) => o.tempId !== item.tempId));
        loadRooms();
      } catch {
        setOutbox((prev) =>
          prev.map((o) => (o.tempId === item.tempId ? { ...o, status: "failed" } : o))
        );
      }
    },
    [loadRooms]
  );

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const content = draft.trim();
    if (!content || !activeRoomId) return;

    const item: Outgoing = {
      tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setOutbox((prev) => [...prev, item]);
    setDraft("");
    stickToBottom.current = true;
    if (composerRef.current) composerRef.current.style.height = "auto";
    deliver(activeRoomId, item);
  }

  function retry(item: Outgoing) {
    if (!activeRoomId) return;
    setOutbox((prev) => prev.map((o) => (o.tempId === item.tempId ? { ...o, status: "sending" } : o)));
    deliver(activeRoomId, { ...item, status: "sending" });
  }

  function discard(tempId: string) {
    setOutbox((prev) => prev.filter((o) => o.tempId !== tempId));
  }

  function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  /* ── new conversation ── */

  const [pickerOpen, setPickerOpen] = useState(false);
  const [directory, setDirectory] = useState<DirectoryEntry[] | null>(null);
  const [directoryError, setDirectoryError] = useState(false);
  const [pickerQ, setPickerQ] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    if (!pickerOpen || directory) return;
    fetch("/api/chat/users")
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? setDirectory(d) : setDirectoryError(true)))
      .catch(() => setDirectoryError(true));
  }, [pickerOpen, directory]);

  async function startChat(userId: string) {
    setStartingId(userId);
    try {
      const res = await fetch("/api/chat/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const room = await res.json();
        setPickerOpen(false);
        setPickerQ("");
        await loadRooms();
        setActiveRoomId(room.id);
      }
    } finally {
      setStartingId(null);
    }
  }

  const filteredDirectory = useMemo(() => {
    const q = pickerQ.trim().toLowerCase();
    if (!directory) return [];
    return q ? directory.filter((u) => u.name.toLowerCase().includes(q)) : directory;
  }, [directory, pickerQ]);

  /* ── derived ── */

  const activeRoom = rooms?.find((r) => r.id === activeRoomId) ?? null;
  const totalUnread = rooms?.reduce((n, r) => n + r.unreadCount, 0) ?? 0;

  /** Messages plus pending ones, annotated with grouping + day-break flags. */
  const rendered = useMemo(() => {
    if (!messages) return [];
    const all: (
      | { kind: "sent"; msg: Message }
      | { kind: "pending"; out: Outgoing }
    )[] = [
      ...messages.map((msg) => ({ kind: "sent" as const, msg })),
      ...outbox.map((out) => ({ kind: "pending" as const, out })),
    ];

    let prevSender: string | null = null;
    let prevAt = 0;
    return all.map((entry) => {
      const senderId = entry.kind === "sent" ? entry.msg.senderId : myId;
      const at = new Date(entry.kind === "sent" ? entry.msg.createdAt : entry.out.createdAt).getTime();
      const newDay = prevAt === 0 || !sameDay(new Date(prevAt), new Date(at));
      const grouped = !newDay && senderId === prevSender && at - prevAt < GROUP_WINDOW_MS;
      prevSender = senderId;
      prevAt = at;
      return { ...entry, senderId, at, newDay, grouped };
    });
  }, [messages, outbox, myId]);

  /* ────────────────────────────── render ────────────────────────────── */

  return (
    <div
      ref={rootRef}
      className="flex flex-col min-h-0 overflow-hidden"
      style={{ height: shellHeight ?? "100dvh" }}
    >
      <Topbar title="Chat" />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Conversations ── */}
        <aside
          className={cn(
            "w-full md:w-72 lg:w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col min-h-0",
            activeRoomId && "hidden md:flex"
          )}
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-[13px] font-bold text-slate-900">Conversations</h2>
              {totalUnread > 0 && (
                <span className="text-[11px] font-semibold text-indigo-600">{totalUnread} unread</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-expanded={pickerOpen}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {pickerOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {pickerOpen ? "Close" : "New"}
            </button>
          </div>

          {/* Staff picker */}
          {pickerOpen && (
            <div className="border-b border-slate-100 bg-slate-50 p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <label htmlFor="chat-people-search" className="sr-only">Search colleagues</label>
                <input
                  id="chat-people-search"
                  autoFocus
                  value={pickerQ}
                  onChange={(e) => setPickerQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setPickerOpen(false)}
                  placeholder="Search colleagues…"
                  className="w-full h-9 border border-slate-200 rounded-xl pl-9 pr-3 text-[13px] text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
                />
              </div>
              <div className="max-h-56 overflow-y-auto -mx-1 px-1">
                {directoryError ? (
                  <p className="text-[12px] text-rose-600 text-center py-4">
                    Couldn&apos;t load the staff directory.
                  </p>
                ) : !directory ? (
                  <div className="space-y-1.5 py-1" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-8 rounded-lg bg-slate-200/60 animate-pulse" />
                    ))}
                  </div>
                ) : filteredDirectory.length === 0 ? (
                  <p className="text-[12px] text-slate-500 text-center py-4">
                    {pickerQ.trim() ? `No colleague matches "${pickerQ.trim()}".` : "No colleagues to chat with yet."}
                  </p>
                ) : (
                  filteredDirectory.map((u) => (
                    <button
                      key={u.userId}
                      type="button"
                      onClick={() => startChat(u.userId)}
                      disabled={startingId !== null}
                      className="w-full text-left px-2 py-2 rounded-lg hover:bg-white text-[13px] flex items-center gap-2.5 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span className="h-7 w-7 shrink-0 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {initials(u.name)}
                      </span>
                      <span className="text-slate-900 truncate flex-1">{u.name}</span>
                      {startingId === u.userId ? (
                        <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide shrink-0">
                          {u.role.replace("_", " ").toLowerCase()}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Room list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!rooms ? (
              <div className="p-3 space-y-2" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center px-6 py-12">
                <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-slate-900 mb-1">No conversations yet</p>
                <p className="text-[12px] text-slate-500 mb-4 leading-relaxed">
                  Message any colleague on staff — messages stay inside your school.
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              <ul>
                {rooms.map((room) => {
                  const last = room.messages[0];
                  const isActive = room.id === activeRoomId;
                  const unread = room.unreadCount > 0 && !isActive;
                  const label = roomLabel(room, myId);
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        onClick={() => setActiveRoomId(room.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "w-full text-left px-4 py-3 border-b border-slate-100 flex gap-3 items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
                          isActive ? "bg-indigo-50/70" : "hover:bg-slate-50"
                        )}
                      >
                        <span
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold",
                            isActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {room.type === "GROUP" ? <Users className="h-4 w-4" /> : initials(label)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "text-[13px] truncate",
                                unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                              )}
                            >
                              {label}
                            </span>
                            <span className="text-[11px] text-slate-500 shrink-0 tabular-nums">
                              {relativeTime(room.lastMessageAt)}
                            </span>
                          </span>
                          <span className="flex items-center justify-between gap-2 mt-0.5">
                            <span
                              className={cn(
                                "text-[12px] truncate",
                                unread ? "text-slate-800 font-medium" : "text-slate-500"
                              )}
                            >
                              {last
                                ? `${last.senderId === myId ? "You: " : ""}${last.content}`
                                : "No messages yet"}
                            </span>
                            {unread && (
                              <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                                {room.unreadCount > 99 ? "99+" : room.unreadCount}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── Thread ── */}
        <section className={cn("flex-1 flex flex-col min-h-0 bg-[#f9fafb]", !activeRoomId && "hidden md:flex")}>
          {!activeRoomId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-[14px] font-semibold text-slate-900 mb-1">Select a conversation</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Pick someone on the left, or start a new conversation with any colleague.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveRoomId(null)}
                  aria-label="Back to conversations"
                  className="md:hidden -ml-1 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="h-9 w-9 shrink-0 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                  {activeRoom?.type === "GROUP" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    initials(activeRoom ? roomLabel(activeRoom, myId) : "")
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-bold text-slate-900 truncate">
                    {activeRoom ? roomLabel(activeRoom, myId) : "Conversation"}
                  </h2>
                  {activeRoom && (
                    <p className="text-[12px] text-slate-500">
                      {activeRoom.type === "GROUP"
                        ? `${activeRoom.participants.length} participants`
                        : activeRoom.participants
                            .filter((p) => p.userId !== myId)
                            .map((p) => p.user.email)
                            .join(", ")}
                    </p>
                  )}
                </div>
              </header>

              {/* Messages */}
              <div className="relative flex-1 min-h-0">
                <div
                  ref={paneRef}
                  onScroll={onPaneScroll}
                  role="log"
                  aria-live="polite"
                  aria-label="Messages"
                  className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-4"
                >
                  {threadError ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                        <p className="text-[13px] text-slate-700">{threadError}</p>
                      </div>
                    </div>
                  ) : !messages ? (
                    <div className="space-y-3" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn("flex", i % 2 ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "h-10 rounded-2xl bg-slate-200/70 animate-pulse",
                              i % 2 ? "w-40" : "w-56"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  ) : rendered.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center max-w-xs">
                        <p className="text-[13px] font-semibold text-slate-900 mb-1">
                          No messages yet
                        </p>
                        <p className="text-[12px] text-slate-500 leading-relaxed">
                          Say hello to start the conversation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {hasMore && (
                        <div className="flex justify-center pb-3">
                          <button
                            type="button"
                            onClick={loadOlder}
                            disabled={loadingOlder}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            {loadingOlder && <Loader2 className="h-3 w-3 animate-spin" />}
                            {loadingOlder ? "Loading…" : "Load earlier messages"}
                          </button>
                        </div>
                      )}

                      <ol className="space-y-0.5">
                        {rendered.map((entry) => {
                          const isMe = entry.senderId === myId;
                          const pending = entry.kind === "pending";
                          const failed = pending && entry.out.status === "failed";
                          const content = pending ? entry.out.content : entry.msg.content;
                          const key = pending ? entry.out.tempId : entry.msg.id;
                          const name = pending ? "You" : personName(entry.msg.sender);

                          return (
                            <li key={key}>
                              {entry.newDay && (
                                <div className="flex items-center gap-3 py-4" aria-hidden>
                                  <span className="h-px flex-1 bg-slate-200" />
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {dayLabel(new Date(entry.at))}
                                  </span>
                                  <span className="h-px flex-1 bg-slate-200" />
                                </div>
                              )}

                              <div
                                className={cn(
                                  "flex flex-col",
                                  isMe ? "items-end" : "items-start",
                                  entry.grouped ? "mt-0.5" : "mt-3"
                                )}
                              >
                                {/* Name only on the first message of a run, and
                                    only where it disambiguates. */}
                                {!entry.grouped && !isMe && (
                                  <p className="text-[11px] font-semibold text-slate-600 mb-1 px-1">
                                    {name}
                                  </p>
                                )}

                                <div
                                  className={cn(
                                    "px-3.5 py-2 text-[13px] leading-relaxed max-w-[85%] sm:max-w-md break-words whitespace-pre-wrap transition-opacity",
                                    isMe
                                      ? "bg-indigo-600 text-white rounded-2xl"
                                      : "bg-white text-slate-900 border border-slate-200 rounded-2xl",
                                    isMe && !entry.grouped && "rounded-tr-md",
                                    !isMe && !entry.grouped && "rounded-tl-md",
                                    pending && !failed && "opacity-60",
                                    failed && "bg-rose-50 text-rose-900 border border-rose-200"
                                  )}
                                >
                                  {content}
                                </div>

                                {failed ? (
                                  <div className="flex items-center gap-2 mt-1 px-1">
                                    <span className="text-[11px] text-rose-600 font-medium">
                                      Not sent
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => retry(entry.out)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                    >
                                      <RotateCw className="h-3 w-3" /> Retry
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => discard(entry.out.tempId)}
                                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                    >
                                      Discard
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-500 mt-1 px-1 tabular-nums">
                                    {pending ? "Sending…" : clockTime(entry.msg.createdAt)}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </>
                  )}
                </div>

                {/* Jump to latest — only while the reader is scrolled back */}
                {unseenBelow && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[12px] font-semibold px-3.5 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <ArrowDown className="h-3.5 w-3.5" /> New messages
                  </button>
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-slate-200 flex gap-2 items-end shrink-0"
              >
                <label htmlFor="chat-composer" className="sr-only">Message</label>
                <textarea
                  id="chat-composer"
                  ref={composerRef}
                  rows={1}
                  value={draft}
                  onChange={autoGrow}
                  onKeyDown={onComposerKeyDown}
                  placeholder="Write a message…"
                  className="flex-1 resize-none border border-slate-200 rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed text-slate-900 placeholder:text-slate-500 max-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="h-11 w-11 shrink-0 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
