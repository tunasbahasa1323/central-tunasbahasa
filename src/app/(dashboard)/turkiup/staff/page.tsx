"use client";

import { useState } from "react";
import { Search, UserRound, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const staffMembers = [
  { name: "Diana Putri", initials: "DP", role: "Penerjemah", specialization: "Penerjemahan Dokumen", activeTasks: 1, completedTasks: 2, status: "Aktif" },
  { name: "M Galih Rakasiwi", initials: "MG", role: "Tutor Bahasa Turki", specialization: "Kelas dan Pelatihan", activeTasks: 1, completedTasks: 2, status: "Aktif" },
  { name: "Windi Alfira", initials: "WA", role: "Interpreter", specialization: "Interpretasi Meeting", activeTasks: 1, completedTasks: 0, status: "Aktif" },
];

export default function TurkiUpStaffPage() {
  const [search, setSearch] = useState("");
  const filteredStaff = staffMembers.filter((staff) =>
    `${staff.name} ${staff.role} ${staff.specialization}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Operasional</p>
        <h1 className="text-2xl font-semibold tracking-tight">Data Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lihat daftar staff, peran, spesialisasi, dan beban tugas tim TurkiUp.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-5"><UserRound className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Total Staff</p><p className="text-xl font-bold">{staffMembers.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><BriefcaseBusiness className="h-5 w-5 text-amber-500" /><div><p className="text-xs text-muted-foreground">Tugas Aktif</p><p className="text-xl font-bold">{staffMembers.reduce((sum, staff) => sum + staff.activeTasks, 0)}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><div><p className="text-xs text-muted-foreground">Tugas Selesai</p><p className="text-xl font-bold">{staffMembers.reduce((sum, staff) => sum + staff.completedTasks, 0)}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Direktori Staff TurkiUp</CardTitle><CardDescription>Data staff yang terlibat dalam operasional TurkiUp</CardDescription></div>
            <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau peran..." className="h-9 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Staff</th><th className="px-4 py-3 font-medium">Peran</th><th className="px-4 py-3 font-medium">Spesialisasi</th><th className="px-4 py-3 font-medium">Tugas Aktif</th><th className="px-4 py-3 font-medium">Selesai</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
              <tbody>{filteredStaff.map((staff) => <tr key={staff.name} className="border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary">{staff.initials}</AvatarFallback></Avatar><span className="font-medium">{staff.name}</span></div></td><td className="px-4 py-4">{staff.role}</td><td className="px-4 py-4 text-muted-foreground">{staff.specialization}</td><td className="px-4 py-4 font-medium">{staff.activeTasks}</td><td className="px-4 py-4 font-medium">{staff.completedTasks}</td><td className="px-4 py-4"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{staff.status}</Badge></td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
