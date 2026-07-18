"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/Topbar";
import { Send, MessageCircle, Users, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; email: string; staff?: { firstName: string; lastName: string } | null; student?: { firstName: string; lastName: string } | null };
};

type Room = {
  id: string;
  name: string | null;
  type: "DIRECT" | "GROUP";
  participants: { user: { id: string; email: string; staff?: { firstName: string; lastName: string } | null } }[];
  messages: Message[];
};

function senderName(sender: Message["sender"]) {
  if (sender.staff) return `${sender.staff.firstName} ${sender.staff.lastName}`;
  if (sender.student) return `${sender.student.firstName} ${sender.student.lastName}`;
  return sender.email;
}

function roomLabel(room: Room, myId: string) {
  if (room.name) return room.name;
  if (room.type === "DIRECT") {
    const other = room.participants.find((p) => p.user.id !== myId);
    if (!other) return "Direct";
    const u = other.user;
    return u.staff ? `${u.staff.firstName} ${u.staff.lastName}` : u.email;
  }
  return "Group";
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [myId, setMyId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: session } = useSession();

  // Identify the current user so own messages align right / show as "me"
  useEffect(() => {
    const id = (session?.user as any)?.id;
    if (id) setMyId(id);
  }, [session]);

  // Load rooms
  const loadRooms = useCallback(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRooms(data); })
      .catch(() => {});
  }, []);
  useEffect(() => { loadRooms(); }, [loadRooms]);

  // ── New chat: staff directory picker ──
  const [pickerOpen, setPickerOpen] = useState(false);
  const [directory, setDirectory] = useState<{ userId: string; name: string; role: string }[]>([]);
  const [pickerQ, setPickerQ] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!pickerOpen || directory.length) return;
    fetch("/api/chat/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setDirectory(d); }).catch(() => {});
  }, [pickerOpen, directory.length]);

  async function startChat(userId: string) {
    setStarting(true);
    try {
      const res = await fetch("/api/chat/direct", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const room = await res.json();
        setPickerOpen(false); setPickerQ("");
        loadRooms();
        setActiveRoomId(room.id);
      }
    } finally { setStarting(false); }
  }

  // Load messages and poll
  const loadMessages = useCallback(async (roomId: string) => {
    const res = await fetch(`/api/chat/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    loadMessages(activeRoomId);
    pollRef.current = setInterval(() => loadMessages(activeRoomId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeRoomId, loadMessages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeRoomId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${activeRoomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (res.ok) {
        setDraft("");
        await loadMessages(activeRoomId);
      }
    } finally {
      setSending(false);
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Chat" />
      <div className="flex flex-1 overflow-hidden">

        {/* Room list */}
        <aside className="w-64 shrink-0 border-r bg-white flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversations</p>
            <button onClick={() => setPickerOpen(o => !o)} aria-label="New chat"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-full transition-colors">
              {pickerOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />} New
            </button>
          </div>
          {pickerOpen && (
            <div className="border-b bg-slate-50 p-2 space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input autoFocus value={pickerQ} onChange={e => setPickerQ(e.target.value)}
                  placeholder="Search staff…"
                  className="w-full border rounded-lg pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {directory
                  .filter(u => !pickerQ.trim() || u.name.toLowerCase().includes(pickerQ.toLowerCase()))
                  .map(u => (
                    <button key={u.userId} onClick={() => startChat(u.userId)} disabled={starting}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-white text-sm flex items-center justify-between disabled:opacity-50">
                      <span className="text-gray-800 truncate">{u.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase shrink-0 ml-2">{u.role.replace("_", " ").toLowerCase()}</span>
                    </button>
                  ))}
                {directory.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Loading staff…</p>}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="text-center mt-8 px-3">
                <p className="text-xs text-gray-400 mb-2">No conversations yet.</p>
                <button onClick={() => setPickerOpen(true)} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Start one →
                </button>
              </div>
            ) : (
              rooms.map((room) => {
                const last = room.messages[0];
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 border-b hover:bg-gray-50 transition-colors",
                      activeRoomId === room.id && "bg-blue-50 border-l-2 border-l-blue-600"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {room.type === "GROUP" ? (
                        <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <MessageCircle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-800 truncate">{roomLabel(room, myId)}</p>
                    </div>
                    {last && (
                      <p className="text-xs text-gray-400 truncate pl-5">{last.content}</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Message thread */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {!activeRoomId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 bg-white border-b">
                <p className="font-semibold text-sm">
                  {activeRoom ? roomLabel(activeRoom, myId) : ""}
                </p>
                {activeRoom && (
                  <p className="text-xs text-gray-400">
                    {activeRoom.participants.length} participant{activeRoom.participants.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-8">No messages yet. Say hello!</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender.id === myId;
                    return (
                      <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <p className="text-xs text-gray-400 mb-0.5 px-1">{senderName(msg.sender)}</p>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm max-w-xs lg:max-w-md break-words",
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white border text-gray-800 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
