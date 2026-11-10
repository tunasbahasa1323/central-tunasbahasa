"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  FileText,
  MessageSquare,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

type PaymentStatus = "paid" | "partial" | "unpaid";

const invoices = [
  { id: "TRK-202611-008", customer: "PT Karya Maju", customerPhone: "08123456789", service: "Jasa Penerjemahan Dokumen", amount: 1850000, dp: 0, status: "paid" as PaymentStatus, date: "10 Nov 2026", dueDate: "17 Nov 2026", staff: "Diana Putri" },
  { id: "TRK-202611-007", customer: "Yayasan Al-Hikmah", customerPhone: "08987654321", service: "Kelas Bahasa Turki Privat", amount: 2500000, dp: 1000000, status: "partial" as PaymentStatus, date: "09 Nov 2026", dueDate: "16 Nov 2026", staff: "M Galih Rakasiwi" },
  { id: "TRK-202611-006", customer: "CV Nusantara Media", customerPhone: "08567890123", service: "Interpretasi Meeting Online", amount: 750000, dp: 0, status: "unpaid" as PaymentStatus, date: "08 Nov 2026", dueDate: "15 Nov 2026", staff: "Windi Alfira" },
  { id: "TRK-202611-005", customer: "Dr. Andi Surya", customerPhone: "08234567890", service: "Jasa Penerjemahan Dokumen", amount: 1200000, dp: 0, status: "paid" as PaymentStatus, date: "07 Nov 2026", dueDate: "14 Nov 2026", staff: "Diana Putri" },
  { id: "TRK-202611-004", customer: "RSUD Ciawi Bogor", customerPhone: "08345678901", service: "Pelatihan Bahasa Turki Grup", amount: 4200000, dp: 0, status: "paid" as PaymentStatus, date: "06 Nov 2026", dueDate: "13 Nov 2026", staff: "M Galih Rakasiwi" },
];

const statusConfig = {
  paid: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  partial: { label: "DP/Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700", icon: Clock },
  unpaid: { label: "Belum bayar", className: "border-rose-200 bg-rose-50 text-rose-700", icon: AlertCircle },
};

export default function TurkiUpInvoicesPage() {
  const [query, setQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[number] | null>(null);

  const filtered = invoices.filter((inv) => {
    const q = query.toLowerCase();
    return !q || inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q);
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount - i.dp, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Invoicing</p>
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Invoice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola invoice, pantau status pembayaran, dan kirim tagihan ke pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Lunas</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">{formatRupiah(totalPaid)}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Piutang Tersisa</p>
                <p className="mt-1 text-xl font-bold text-rose-600">{formatRupiah(totalOutstanding)}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoice</p>
                <p className="mt-1 text-xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari no. invoice atau pelanggan..."
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">No. Invoice</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Layanan</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const cfg = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-medium">{inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.date}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{inv.customer}</p>
                        <p className="text-xs text-muted-foreground">{inv.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.service}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatRupiah(inv.amount)}</p>
                        {inv.dp > 0 && <p className="text-xs text-emerald-600">DP: {formatRupiah(inv.dp)}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <Badge className={cfg.className}>{cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label={`Aksi ${inv.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedInvoice(inv)}>
                              <Eye className="h-4 w-4" /> Lihat invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4" /> Kirim via WA
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4" /> Unduh PDF
                            </DropdownMenuItem>
                            {inv.status !== "paid" && (
                              <DropdownMenuItem>
                                <CheckCircle2 className="h-4 w-4" /> Tandai Lunas
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {invoices.length} invoice
          </div>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedInvoice(null); }}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-primary">Invoice TurkiUp</p>
                <h2 className="mt-1 text-xl font-bold">{selectedInvoice.id}</h2>
              </div>
              <Badge className={statusConfig[selectedInvoice.status].className}>{statusConfig[selectedInvoice.status].label}</Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Pelanggan", value: selectedInvoice.customer },
                { label: "No. WA", value: selectedInvoice.customerPhone },
                { label: "Layanan", value: selectedInvoice.service },
                { label: "Staf", value: selectedInvoice.staff },
                { label: "Tanggal", value: selectedInvoice.date },
                { label: "Jatuh Tempo", value: selectedInvoice.dueDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Tagihan</p>
                <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(selectedInvoice.amount)}</p>
                {selectedInvoice.dp > 0 && (
                  <p className="mt-0.5 text-xs text-emerald-600">DP diterima: {formatRupiah(selectedInvoice.dp)} · Sisa: {formatRupiah(selectedInvoice.amount - selectedInvoice.dp)}</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Tutup</Button>
              <Button variant="outline"><MessageSquare className="h-4 w-4" /> Kirim WA</Button>
              <Button><FileText className="h-4 w-4" /> Unduh PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
