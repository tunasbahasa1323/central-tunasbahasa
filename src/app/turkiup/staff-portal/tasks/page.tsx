"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, FileText, Loader2, Play, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const STAFF_SESSION_KEY = "turkiup_staff_session";

type TaskStatus = "assigned" | "in_progress" | "done";
type StaffTask = { id: string; order: string; customer: string; title: string; stage: string; due: string; status: TaskStatus; priority: "normal" | "urgent"; description: string; comments: number };
const statusConfig: Record<TaskStatus, { label: string; className: string }> = { assigned: { label: "Ditugaskan", className: "border-amber-200 bg-amber-50 text-amber-700" }, in_progress: { label: "Sedang dikerjakan", className: "border-blue-200 bg-blue-50 text-blue-700" }, done: { label: "Selesai", className: "border-emerald-200 bg-emerald-50 text-emerald-700" } };

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | TaskStatus>("all");
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  async function loadTasks() {
    if (!isSupabaseConfigured) { setError("Environment Supabase belum dikonfigurasi."); setLoading(false); return; }
    const storedSession = window.sessionStorage.getItem(STAFF_SESSION_KEY);
    const session = storedSession ? JSON.parse(storedSession) as { id?: string } : null;
    if (!session?.id) { setError("Sesi staff tidak ditemukan."); setLoading(false); return; }
    const result = await supabase.from("tu_tasks").select("id, title, status, created_at, active_staff_id, tu_orders(order_code, customer_name), tu_task_stages(stage_name, status, stage_order, staff_id)").neq("status", "waiting_assignment").order("created_at", { ascending: false });
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    const rows = result.data ?? [];
    const comments = await supabase.from("tu_task_comments").select("task_id");
    const commentCounts = new Map<string, number>();
    (comments.data ?? []).forEach((row) => commentCounts.set(row.task_id, (commentCounts.get(row.task_id) ?? 0) + 1));
    setTasks(rows.map((row: any) => {
      const stages = [...(row.tu_task_stages ?? [])].sort((a: any, b: any) => a.stage_order - b.stage_order);
      const staffStages = stages.filter((item: any) => item.staff_id === session.id);
      const stage = staffStages.find((item: any) => item.status !== "completed") ?? staffStages[staffStages.length - 1];
      if (row.active_staff_id !== session.id && !staffStages.length) return null;
      return { id: row.id, order: row.tu_orders?.order_code ?? "-", customer: row.tu_orders?.customer_name ?? "-", title: row.title, stage: stage?.stage_name ?? "Pekerjaan", due: "Belum ditentukan", status: row.status, priority: "normal", description: "Detail tugas tersedia pada Monitoring Tugas.", comments: commentCounts.get(row.id) ?? 0 };
    }).filter((task): task is StaffTask => task !== null));
    setLoading(false);
  }

  useEffect(() => { void loadTasks(); }, []);
  const visibleTasks = useMemo(() => tasks.filter((task) => (activeFilter === "all" || task.status === activeFilter) && `${task.order} ${task.customer} ${task.title}`.toLowerCase().includes(query.toLowerCase())), [tasks, activeFilter, query]);
  const stats = { active: tasks.filter((task) => task.status === "in_progress").length, assigned: tasks.filter((task) => task.status === "assigned").length, done: tasks.filter((task) => task.status === "done").length };

  async function advanceTask(task: StaffTask) {
    const nextStatus: TaskStatus = task.status === "assigned" ? "in_progress" : "done";
    setUpdating(task.id);
    const result = await supabase.from("tu_tasks").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", task.id);
    if (result.error) setError(result.error.message); else { setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item)); setSelectedTask((current) => current?.id === task.id ? { ...current, status: nextStatus } : current); }
    setUpdating("");
  }

  return <div className="space-y-6"><div><p className="text-sm font-medium text-sky-700">Workspace TurkiUp</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Tugas Saya</h1><p className="mt-2 text-sm text-slate-500">Kelola pekerjaan yang ditugaskan kepada Anda.</p></div>{error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{loading ? <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Memuat tugas...</CardContent></Card> : <><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Sedang dikerjakan</p><p className="mt-2 text-2xl font-semibold text-blue-600">{stats.active}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Menunggu dikerjakan</p><p className="mt-2 text-2xl font-semibold text-amber-600">{stats.assigned}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Selesai</p><p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.done}</p></CardContent></Card></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold">Daftar Tugas</h2><p className="text-sm text-muted-foreground">Data tugas dari Monitoring Tugas.</p></div><div className="flex flex-wrap gap-2">{(["all", "assigned", "in_progress", "done"] as const).map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{filter === "all" ? "Semua" : statusConfig[filter].label}</button>)}</div></div><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari order atau tugas..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm" /></div><div className="grid gap-4 lg:grid-cols-2">{visibleTasks.map((task) => <Card key={task.id} className="transition-shadow hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Badge className={statusConfig[task.status].className}>{statusConfig[task.status].label}</Badge>{task.priority === "urgent" && <Badge variant="outline" className="border-rose-200 text-rose-600">Prioritas tinggi</Badge>}</div><h3 className="mt-3 font-semibold">{task.title}</h3><p className="mt-1 text-xs text-muted-foreground">{task.order} · {task.customer}</p></div><button type="button" onClick={() => setSelectedTask(task)} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Lihat detail tugas"><ChevronRight className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Tahap: {task.stage}</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />Deadline: {task.due}</span></div><div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted-foreground">{task.comments} komentar</span>{task.status !== "done" && <Button size="sm" disabled={updating === task.id} onClick={() => void advanceTask(task)}>{updating === task.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : task.status === "assigned" ? <Play className="mr-2 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}{task.status === "assigned" ? "Mulai kerja" : "Tandai selesai"}</Button>}</div></CardContent></Card>)}</div>{!visibleTasks.length && <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Tidak ada tugas yang sesuai.</CardContent></Card>}</>}</div>;
}
