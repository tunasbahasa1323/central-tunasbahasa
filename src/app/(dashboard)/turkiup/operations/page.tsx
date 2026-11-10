"use client";

import { useState } from "react";
import { Clock, CheckCircle2, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type TaskStatus = "assigned" | "in_progress" | "done";

interface Task {
  id: string;
  title: string;
  orderId: string;
  customer: string;
  staff: string;
  staffInitials: string;
  date: string;
  status: TaskStatus;
}

const initialTasks: Task[] = [
  { id: "TSK-2026-001", title: "Penerjemahan dokumen kontrak", orderId: "TRK-202611-008", customer: "PT Karya Maju", staff: "Diana Putri", staffInitials: "DP", date: "10 Nov 2026", status: "done" },
  { id: "TSK-2026-002", title: "Kelas Bahasa Turki sesi 1/4", orderId: "TRK-202611-007", customer: "Yayasan Al-Hikmah", staff: "M Galih Rakasiwi", staffInitials: "MG", date: "09 Nov 2026", status: "in_progress" },
  { id: "TSK-2026-003", title: "Interpretasi meeting online klien", orderId: "TRK-202611-006", customer: "CV Nusantara Media", staff: "Windi Alfira", staffInitials: "WA", date: "08 Nov 2026", status: "assigned" },
  { id: "TSK-2026-004", title: "Penerjemahan dokumen medis", orderId: "TRK-202611-005", customer: "Dr. Andi Surya", staff: "Diana Putri", staffInitials: "DP", date: "07 Nov 2026", status: "done" },
  { id: "TSK-2026-005", title: "Pelatihan Bahasa Turki sesi 1/8", orderId: "TRK-202611-004", customer: "RSUD Ciawi Bogor", staff: "M Galih Rakasiwi", staffInitials: "MG", date: "06 Nov 2026", status: "done" },
  { id: "TSK-2026-006", title: "Kelas Bahasa Turki sesi 2/4", orderId: "TRK-202611-007", customer: "Yayasan Al-Hikmah", staff: "M Galih Rakasiwi", staffInitials: "MG", date: "11 Nov 2026", status: "assigned" },
];

const columnConfig: { status: TaskStatus; label: string; icon: React.ElementType; color: string; badgeClass: string }[] = [
  { status: "assigned", label: "Ditugaskan", icon: Clock, color: "text-amber-500", badgeClass: "border-amber-200 bg-amber-50 text-amber-700" },
  { status: "in_progress", label: "Sedang Dikerjakan", icon: Loader2, color: "text-blue-500", badgeClass: "border-blue-200 bg-blue-50 text-blue-700" },
  { status: "done", label: "Selesai", icon: CheckCircle2, color: "text-emerald-500", badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
];

export default function TurkiUpOperationsPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function moveTo(taskId: string, newStatus: TaskStatus) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Operasional</p>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring Tugas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau progres pengerjaan staf TurkiUp secara real-time dalam tampilan Kanban.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {columnConfig.map((col) => {
          const count = tasks.filter((t) => t.status === col.status).length;
          return (
            <Card key={col.status}>
              <CardContent className="flex items-center gap-3 p-4">
                <col.icon className={`h-5 w-5 shrink-0 ${col.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{col.label}</p>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="grid gap-4 md:grid-cols-3">
        {columnConfig.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center gap-2">
              <col.icon className={`h-4 w-4 ${col.color}`} />
              <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {tasks.filter((t) => t.status === col.status).length}
              </span>
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-2 min-h-[200px]">
              {tasks.filter((t) => t.status === col.status).map((task) => (
                <div key={task.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="shrink-0 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label={`Pindahkan ${task.id}`}>
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {columnConfig.filter((c) => c.status !== col.status).map((c) => (
                          <DropdownMenuItem key={c.status} onClick={() => moveTo(task.id, c.status)}>
                            <c.icon className={`h-4 w-4 ${c.color}`} /> Pindah ke {c.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Order: {task.orderId}</p>
                  <p className="text-xs text-muted-foreground">{task.customer}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary/10 text-[9px] text-primary">{task.staffInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{task.staff}</span>
                    </div>
                    <Badge className={col.badgeClass + " text-[10px] px-1.5 py-0"}>{task.date}</Badge>
                  </div>
                </div>
              ))}
              {tasks.filter((t) => t.status === col.status).length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                  Tidak ada tugas
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Team directory */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Direktori Tim TurkiUp</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nama Staf</th>
                <th className="px-4 py-3 font-medium">Ditugaskan</th>
                <th className="px-4 py-3 font-medium">Proses</th>
                <th className="px-4 py-3 font-medium">Selesai</th>
                <th className="px-4 py-3 font-medium">Progres</th>
              </tr>
            </thead>
            <tbody>
              {["Diana Putri", "M Galih Rakasiwi", "Windi Alfira"].map((name) => {
                const staffTasks = tasks.filter((t) => t.staff === name);
                const done = staffTasks.filter((t) => t.status === "done").length;
                const inProg = staffTasks.filter((t) => t.status === "in_progress").length;
                const assigned = staffTasks.filter((t) => t.status === "assigned").length;
                const total = staffTasks.length;
                const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
                return (
                  <tr key={name} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-amber-600">{assigned}</td>
                    <td className="px-4 py-3 text-blue-600">{inProg}</td>
                    <td className="px-4 py-3 text-emerald-600">{done}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: total ? `${Math.round((done / total) * 100)}%` : "0%" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{total ? Math.round((done / total) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
