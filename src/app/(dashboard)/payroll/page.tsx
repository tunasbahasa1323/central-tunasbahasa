"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, CircleDollarSign, Clock3, History, Search, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const staff = [
  { id: "EMP-024", name: "Ahmad Fauzi", sector: "Tunas Bahasa", pending: 2450000, tasks: 4, paid: 8250000 },
  { id: "EMP-021", name: "Diana Putri", sector: "TurkiUp", pending: 1850000, tasks: 3, paid: 6425000 },
  { id: "EMP-022", name: "Budi Santoso", sector: "Tunas Bahasa", pending: 950000, tasks: 2, paid: 5100000 },
];

const tasks = [
  { id: "TSK-1048", title: "Pendampingan kelas Bahasa Inggris", sector: "Tunas Bahasa", date: "08 Nov 2026", amount: 850000 },
  { id: "TSK-1042", title: "Penerjemahan dokumen klien", sector: "TurkiUp", date: "06 Nov 2026", amount: 625000 },
  { id: "TSK-1037", title: "Survey kebutuhan pelatihan", sector: "Tunas Bahasa", date: "04 Nov 2026", amount: 975000 },
];

const formatRupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const paymentHistory = [
  { id: "PAY-2026-011", name: "Ahmad Fauzi", tasks: "3 tugas", amount: 1850000, date: "01 Nov 2026", status: "Berhasil" },
  { id: "PAY-2026-010", name: "Diana Putri", tasks: "4 tugas", amount: 2425000, date: "28 Okt 2026", status: "Berhasil" },
  { id: "PAY-2026-009", name: "Budi Santoso", tasks: "2 tugas", amount: 950000, date: "25 Okt 2026", status: "Berhasil" },
];

export default function PayrollPage() {
  const [selectedStaff, setSelectedStaff] = useState(staff[0]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const selectedTotal = useMemo(() => tasks.filter((task) => selectedTasks.includes(task.id)).reduce((total, task) => total + task.amount, 0), [selectedTasks]);

  return (
    <div className="space-y-6">
      <div><p className="mb-1 text-sm font-medium text-primary">Pendapatan karyawan</p><h1 className="text-2xl font-semibold tracking-tight">Payroll</h1><p className="mt-1 text-sm text-muted-foreground">Kelola komisi tugas, pencairan, dan riwayat pembayaran staf.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Menunggu dibayar", value: "Rp 5,25 jt", icon: Clock3, tone: "text-amber-600" }, { label: "Dicairkan bulan ini", value: "Rp 19,78 jt", icon: CircleDollarSign, tone: "text-emerald-600" }, { label: "Tugas selesai", value: "42", icon: Check, tone: "text-primary" }, { label: "Penerima aktif", value: "18", icon: WalletCards, tone: "text-sky-600" }].map((item) => <Card key={item.label}><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.value}</p></div><item.icon className={`h-6 w-6 ${item.tone}`} /></div></CardContent></Card>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
        <Card><CardHeader><CardTitle>Staf penerima</CardTitle><CardDescription>Pilih staf untuk melihat komisi yang belum dicairkan.</CardDescription><div className="relative mt-3"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring" placeholder="Cari nama staf..." /></div></CardHeader><CardContent className="space-y-2">{staff.map((person) => <button key={person.id} onClick={() => { setSelectedStaff(person); setSelectedTasks([]); }} className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${selectedStaff.id === person.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div><p className="font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.id} · {person.sector}</p></div><div className="text-right"><p className="font-semibold text-amber-600">{formatRupiah(person.pending)}</p><p className="text-xs text-muted-foreground">{person.tasks} tugas</p></div></button>)}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle>Tugas selesai belum dibayar</CardTitle><CardDescription>{selectedStaff.name} · pilih tugas yang dicairkan hari ini</CardDescription></div><Badge variant="secondary">{tasks.length} tersedia</Badge></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-3">Pilih</th><th className="px-3 py-3">Tugas</th><th className="px-3 py-3">Sektor</th><th className="px-3 py-3">Selesai</th><th className="px-3 py-3 text-right">Komisi</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-b last:border-0"><td className="px-3 py-3"><input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={(event) => setSelectedTasks((current) => event.target.checked ? [...current, task.id] : current.filter((id) => id !== task.id))} className="h-4 w-4 accent-primary" /></td><td className="px-3 py-3"><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.id}</p></td><td className="px-3 py-3 text-muted-foreground">{task.sector}</td><td className="px-3 py-3 text-muted-foreground">{task.date}</td><td className="px-3 py-3 text-right font-medium">{formatRupiah(task.amount)}</td></tr>)}</tbody></table></div><div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">Total pencairan</p><p className="text-lg font-semibold">{formatRupiah(selectedTotal)}</p></div><Button disabled={!selectedTasks.length}>Cairkan komisi <ChevronRight className="h-4 w-4" /></Button></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Riwayat pembayaran staf</CardTitle><CardDescription>Daftar pencairan komisi yang sudah diproses.</CardDescription></div>
          <Button variant="outline" size="sm">Lihat semua riwayat <ChevronRight className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-3">ID pembayaran</th><th className="px-3 py-3">Penerima</th><th className="px-3 py-3">Komisi</th><th className="px-3 py-3">Tanggal</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Slip</th></tr></thead><tbody>{paymentHistory.map((payment) => <tr key={payment.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{payment.id}<p className="text-xs font-normal text-muted-foreground">{payment.tasks}</p></td><td className="px-3 py-3">{payment.name}</td><td className="px-3 py-3 font-medium">{formatRupiah(payment.amount)}</td><td className="px-3 py-3 text-muted-foreground">{payment.date}</td><td className="px-3 py-3"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{payment.status}</Badge></td><td className="px-3 py-3 text-right"><Button variant="ghost" size="sm">Lihat slip</Button></td></tr>)}</tbody></table></div></CardContent>
      </Card>
    </div>
  );
}
