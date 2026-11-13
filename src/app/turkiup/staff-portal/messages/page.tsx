"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCheck, MessageCircle, Search, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Conversation = {
  id: string;
  taskId?: string;
  name: string;
  role: string;
  order: string;
  preview: string;
  time: string;
  unread: number;
  messages: { id: string; text: string; sender: "staff" | "team"; time: string }[];
};
type TaskCommentRow = { id: string; task_id: string; author_name: string; comment: string; created_at: string; task?: { title: string; tu_orders?: { order_code: string; customer_name: string } | null } | null };

export default function StaffMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null;
  const filteredConversations = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.order} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase())), [conversations, query]);

  useEffect(() => {
    async function loadTaskComments() {
      const result = await supabase.from("tu_task_comments").select("id, task_id, author_name, comment, created_at, tu_tasks(title, tu_orders(order_code, customer_name))").order("created_at", { ascending: false });
      if (result.error) { setLoadingComments(false); return; }
      const rows = (result.data ?? []) as unknown as TaskCommentRow[];
      const grouped = new Map<string, Conversation>();
      rows.forEach((row) => {
        const taskId = row.task_id;
        const existing = grouped.get(taskId);
        const message = { id: row.id, text: row.comment, sender: "team" as const, time: new Date(row.created_at).toLocaleString("id-ID") };
        if (existing) {
          existing.messages.push(message);
          return;
        }
        grouped.set(taskId, {
          id: `task-comment-${taskId}`,
          taskId,
          name: row.author_name || "Komentar Tugas",
          role: "Komentar Monitoring Tugas",
          order: row.task?.tu_orders?.order_code ?? "-",
          preview: row.comment,
          time: new Date(row.created_at).toLocaleDateString("id-ID"),
          unread: 0,
          messages: [message],
        });
      });
      const imported = Array.from(grouped.values());
      imported.forEach((conversation) => { conversation.messages.sort((a, b) => a.time.localeCompare(b.time)); });
      setConversations(imported);
      if (imported[0]) setSelectedId(imported[0].id);
      setLoadingComments(false);
    }
    void loadTaskComments();
  }, []);

  function selectConversation(id: string) {
    setSelectedId(id);
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation));
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !selectedConversation?.taskId) return;
    const result = await supabase.from("tu_task_comments").insert({ task_id: selectedConversation.taskId, author_name: "Staff", comment: text }).select("id, task_id, author_name, comment, created_at").single();
    if (result.error) return;
    const message = { id: result.data.id, text: result.data.comment, sender: "staff" as const, time: new Date(result.data.created_at).toLocaleString("id-ID") };
    setConversations((current) => current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, preview: text, time: new Date(result.data.created_at).toLocaleDateString("id-ID"), messages: [...conversation.messages, message] } : conversation));
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-700">Workspace TurkiUp</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Pesan & Komentar</h1>
        <p className="mt-2 text-sm text-slate-500">Komunikasikan pekerjaan dengan customer dan tim internal.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid min-h-[580px] md:grid-cols-[300px_1fr]">
          <aside className="border-b bg-slate-50/70 md:border-b-0 md:border-r">
            <div className="border-b p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari percakapan..." className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm" />
              </div>
            </div>
            <div className="max-h-[470px] overflow-y-auto p-2">
              {filteredConversations.map((conversation) => (
                <button key={conversation.id} type="button" onClick={() => selectConversation(conversation.id)} className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${selectedConversation?.id === conversation.id ? "bg-white shadow-sm ring-1 ring-sky-100" : "hover:bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{conversation.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
                    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium text-slate-900">{conversation.name}</p><span className="shrink-0 text-[10px] text-slate-400">{conversation.time}</span></div><p className="mt-0.5 text-[11px] text-slate-500">{conversation.order}</p><p className="mt-1 truncate text-xs text-slate-500">{conversation.preview}</p></div>
                    {conversation.unread > 0 && <Badge className="h-5 min-w-5 justify-center rounded-full bg-sky-600 px-1 text-[10px]">{conversation.unread}</Badge>}
                  </div>
                </button>
              ))}
              {loadingComments && <p className="p-6 text-center text-xs text-muted-foreground">Memuat komentar tugas...</p>}
              {!loadingComments && !filteredConversations.length && <p className="p-6 text-center text-xs text-muted-foreground">Percakapan tidak ditemukan.</p>}
            </div>
          </aside>

          {selectedConversation ? <section className="flex min-h-[580px] flex-col">
            <header className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{selectedConversation.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><h2 className="text-sm font-semibold text-slate-900">{selectedConversation.name}</h2><p className="text-xs text-slate-500">{selectedConversation.role} · {selectedConversation.order}</p></div></div><Button variant="outline" size="sm"><MessageCircle className="mr-2 h-4 w-4" />Detail order</Button>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4 sm:p-6">
              <div className="flex justify-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-500">Hari ini</span></div>
              {selectedConversation.messages.map((message) => <div key={message.id} className={`flex ${message.sender === "staff" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.sender === "staff" ? "rounded-br-md bg-sky-700 text-white" : "rounded-bl-md bg-slate-100 text-slate-700"}`}><p>{message.text}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${message.sender === "staff" ? "text-sky-100" : "text-slate-400"}`}><span>{message.time}</span>{message.sender === "staff" && <CheckCheck className="h-3 w-3" />}</div></div></div>)}
            </div>
            <div className="border-t bg-slate-50/60 p-4"><div className="flex items-end gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Tulis pesan atau komentar..." rows={2} className="min-h-10 flex-1 resize-none rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200" /><Button onClick={() => void sendMessage()} disabled={!draft.trim() || !selectedConversation?.taskId} size="icon" aria-label="Kirim pesan"><Send className="h-4 w-4" /></Button></div><p className="mt-2 text-[10px] text-slate-400">Tekan Enter untuk mengirim · Shift + Enter untuk baris baru</p></div>
          </section> : <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">Pilih percakapan untuk melihat pesan.</div>}
        </div>
      </Card>
    </div>
  );
}
