"use client";

import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
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

async function downloadPayslip(payment: (typeof paymentHistory)[number]) {
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const slipUrl = `${window.location.origin}/slip/${payment.id}`;
  const qrDataUrl = await QRCode.toDataURL(slipUrl, { errorCorrectionLevel: "H", margin: 1, width: 220 });
  const left = 18;
  const right = 192;
  const navy = [20, 48, 92] as const;
  const gray = [107, 114, 128] as const;
  const line = [210, 218, 230] as const;
  const amount = formatRupiah(payment.amount);

  // Header follows the reference slip: company identity, document title, and period.
  pdf.setFillColor(...navy);
  pdf.rect(0, 0, 210, 38, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.text("CENTRAL MANAGEMENT", left, 14);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("TUNAS BAHASA", left, 21);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("SLIP GAJI", right, 15, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Nomor slip: ${payment.id}`, right, 22, { align: "right" });
  pdf.text(`Tanggal pembayaran: ${payment.date}`, right, 29, { align: "right" });

  pdf.setTextColor(31, 41, 55);

  // Employee information table.
  pdf.setFillColor(241, 247, 255);
  pdf.roundedRect(left, 48, right - left, 34, 2, 2, "F");
  pdf.setDrawColor(...line);
  pdf.roundedRect(left, 48, right - left, 34, 2, 2, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...navy);
  pdf.text("DATA PENERIMA", left + 6, 56);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(31, 41, 55);
  pdf.text("Nama", left + 6, 65);
  pdf.text(payment.name, left + 45, 65);
  pdf.text("ID Karyawan", left + 6, 73);
  pdf.text(payment.employeeId, left + 45, 73);
  pdf.text("Nama bank", left + 100, 65);
  pdf.text(payment.bankName, left + 135, 65);
  pdf.text("No. rekening", left + 100, 73);
  pdf.text(payment.accountNumber, left + 135, 73);

  // Earnings table lists one row for every task included in the payment.
  const paymentTasks = tasks.slice(0, Number.parseInt(payment.tasks, 10));
  const taskAmount = paymentTasks.length > 0 ? payment.amount / paymentTasks.length : payment.amount;
  let y = 96;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...navy);
  pdf.setFontSize(10);
  pdf.text("RINCIAN PENDAPATAN", left, y);
  y += 6;
  pdf.setFillColor(...navy);
  pdf.rect(left, y, right - left, 9, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text("KETERANGAN", left + 5, y + 6);
  pdf.text("JUMLAH", right - 5, y + 6, { align: "right" });
  y += 9;
  pdf.setDrawColor(...line);
  pdf.setTextColor(31, 41, 55);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  paymentTasks.forEach((task, index) => {
    const rowHeight = 12;
    if (index % 2 === 1) pdf.setFillColor(248, 250, 252);
    else pdf.setFillColor(255, 255, 255);
    pdf.rect(left, y, right - left, rowHeight, "FD");
    pdf.text(`${index + 1}. ${task.title}`, left + 5, y + 7);
    pdf.text(formatRupiah(Math.round(taskAmount)), right - 5, y + 7, { align: "right" });
    y += rowHeight;
  });
  pdf.setFillColor(241, 247, 255);
  pdf.rect(left, y, right - left, 13, "F");
  pdf.setDrawColor(...line);
  pdf.rect(left, y, right - left, 13);
  pdf.setFont("helvetica", "bold");
  pdf.text("TOTAL DITERIMA", left + 5, y + 8);
  pdf.setTextColor(...navy);
  pdf.setFontSize(11);
  pdf.text(amount, right - 5, y + 8, { align: "right" });

  const noticeY = y + 22;
  pdf.setFillColor(241, 247, 255);
  pdf.roundedRect(left, noticeY, right - left, 27, 2, 2, "F");
  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(8.5);
  pdf.text("Dokumen ini diterbitkan secara otomatis oleh sistem Central Management", left + 6, noticeY + 11);
  pdf.text("dan sah sebagai bukti resmi dari Perusahaan.", left + 6, noticeY + 18);

  const footerY = Math.max(noticeY + 50, 242);
  const qrX = right - 30;
  const qrY = footerY + 5;
  pdf.addImage(qrDataUrl, "PNG", qrX, qrY, 24, 24);
  pdf.setDrawColor(...line);
  pdf.line(left, footerY, right, footerY);
  pdf.setTextColor(...gray);
  pdf.setFontSize(8);
  pdf.text("Central Management · Tunas Bahasa", left, footerY + 10);
  pdf.text("Slip ini dibuat secara digital dan tidak memerlukan tanda tangan basah.", left, footerY + 17);
  pdf.text(`Validasi: ${slipUrl}`, left, footerY + 24);
  pdf.text("Halaman 1 dari 1", qrX - 5, footerY + 17, { align: "right" });
  pdf.setFontSize(7.5);
  pdf.text("Scan untuk validasi slip", qrX + 12, qrY + 29, { align: "center" });
  pdf.save(`slip-payroll-${payment.id}.pdf`);
}

const paymentHistory = [
  { id: "PAY-2026-11-001", employeeId: "EMP-024", name: "Ahmad Fauzi", bankName: "Bank BCA", accountNumber: "1234567890", tasks: "3 tugas", amount: 1850000, date: "01 Nov 2026", status: "Berhasil" },
  { id: "PAY-2026-10-001", employeeId: "EMP-021", name: "Diana Putri", bankName: "Bank Mandiri", accountNumber: "9876543210", tasks: "4 tugas", amount: 2425000, date: "28 Okt 2026", status: "Berhasil" },
  { id: "PAY-2026-10-002", employeeId: "EMP-022", name: "Budi Santoso", bankName: "Bank BNI", accountNumber: "4567890123", tasks: "2 tugas", amount: 950000, date: "25 Okt 2026", status: "Berhasil" },
];

export default function PayrollPage() {
  const [selectedStaff, setSelectedStaff] = useState(staff[0]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<(typeof paymentHistory)[number] | null>(null);
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
        <CardContent><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-3">ID pembayaran</th><th className="px-3 py-3">Penerima</th><th className="px-3 py-3">Komisi</th><th className="px-3 py-3">Tanggal</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Slip</th></tr></thead><tbody>{paymentHistory.map((payment) => <tr key={payment.id} className="border-b last:border-0"><td className="px-3 py-3 font-medium">{payment.id}<p className="text-xs font-normal text-muted-foreground">{payment.tasks}</p></td><td className="px-3 py-3">{payment.name}</td><td className="px-3 py-3 font-medium">{formatRupiah(payment.amount)}</td><td className="px-3 py-3 text-muted-foreground">{payment.date}</td><td className="px-3 py-3"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{payment.status}</Badge></td><td className="px-3 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>Lihat slip</Button></td></tr>)}</tbody></table></div></CardContent>
      </Card>
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPayment(null); }}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4"><div><p className="text-sm font-medium text-primary">Digital Payslip</p><h2 className="mt-1 text-lg font-semibold">Slip pembayaran payroll</h2><p className="mt-1 text-xs text-muted-foreground">{selectedPayment.id}</p></div><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{selectedPayment.status}</Badge></div>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Penerima</p><p className="mt-1 font-medium">{selectedPayment.name}</p></div><div><p className="text-xs text-muted-foreground">Tanggal pembayaran</p><p className="mt-1 font-medium">{selectedPayment.date}</p></div><div><p className="text-xs text-muted-foreground">Nama bank</p><p className="mt-1 font-medium">{selectedPayment.bankName}</p></div><div><p className="text-xs text-muted-foreground">No. rekening</p><p className="mt-1 font-medium">{selectedPayment.accountNumber}</p></div><div><p className="text-xs text-muted-foreground">Komisi tugas</p><p className="mt-1 font-medium">{selectedPayment.tasks}</p></div><div><p className="text-xs text-muted-foreground">Total dibayarkan</p><p className="mt-1 font-semibold text-primary">{formatRupiah(selectedPayment.amount)}</p></div></div>
            <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">Dokumen ini diterbitkan secara otomatis oleh sistem Central Management dan sah sebagai bukti resmi dari Perusahaan.</div>
            <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setSelectedPayment(null)}>Tutup</Button><Button onClick={() => void downloadPayslip(selectedPayment)}>Cetak slip</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
