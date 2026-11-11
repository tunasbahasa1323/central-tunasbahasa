"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
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

const statusConfig = {
  paid: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  partial: { label: "DP/Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700", icon: Clock },
  unpaid: { label: "Belum bayar", className: "border-rose-200 bg-rose-50 text-rose-700", icon: AlertCircle },
};

export default function TurkiUpInvoicesPage() {
  type Invoice = {
    orderId: string;
    customer: string;
    customerPhone: string;
    services: string[];
    amount: number;
    dp: number;
    status: PaymentStatus;
    date: string;
    dueDate: string;
    staff: string[];
  };
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadInvoices() {
      if (!isSupabaseConfigured) {
        setLoadError("Supabase belum dikonfigurasi.");
        return;
      }
      const result = await supabase.from("tu_orders").select("*, tu_order_items(*)").order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setLoadError(`Gagal memuat invoice: ${result.error.message}`);
        return;
      }
      setInvoices((result.data ?? []).map((row) => {
        const items = row.tu_order_items ?? [];
        return {
          orderId: row.order_code,
          customer: row.customer_name,
          customerPhone: row.customer_phone,
          services: items.map((item: { service_name: string }) => item.service_name),
          amount: items.reduce((sum: number, item: { quantity: number; amount: number; discount: number }) => sum + Math.max(0, item.quantity * item.amount - item.discount), 0),
          dp: row.dp,
          status: row.status,
          date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.created_at)),
          dueDate: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(new Date(row.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)),
          staff: items.map((item: { staff_name: string }) => item.staff_name).filter(Boolean),
        };
      }));
    }
    void loadInvoices();
    return () => { active = false; };
  }, []);

  const filtered = invoices.filter((inv) => {
    const searchable = `${inv.orderId} ${inv.customer} ${inv.services.join(" ")}`.toLowerCase();
    const q = query.toLowerCase();
    return !q || searchable.includes(q);
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount - i.dp, 0);

  function formatPaymentInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
  }

  function recordPayment() {
    if (!paymentInvoice) return;
    const payment = Number(paymentAmount.replace(/\D/g, ""));
    if (!payment) return;

    const totalPaidAmount = Math.min(paymentInvoice.amount, paymentInvoice.dp + payment);
    const nextStatus: PaymentStatus = totalPaidAmount >= paymentInvoice.amount ? "paid" : "partial";
    void supabase.from("tu_orders").update({ dp: totalPaidAmount, status: nextStatus, updated_at: new Date().toISOString() }).eq("order_code", paymentInvoice.orderId);
    setInvoices((current) => current.map((invoice) => invoice.orderId !== paymentInvoice.orderId ? invoice : { ...invoice, dp: totalPaidAmount, status: nextStatus }));
    setPaymentInvoice(null);
    setPaymentAmount("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Invoicing</p>
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Invoice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola invoice, pantau status pembayaran, dan kirim tagihan ke pelanggan.</p>
      </div>

      {loadError && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</p>}

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
                    <tr key={inv.orderId} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-medium">{inv.orderId}</p>
                        <p className="text-xs text-muted-foreground">{inv.date}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{inv.customer}</p>
                        <p className="text-xs text-muted-foreground">{inv.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.services.length === 1 ? inv.services[0] : `${inv.services.length} layanan`}</td>
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
                          <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label={`Aksi ${inv.orderId}`}>
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
                              <DropdownMenuItem onClick={() => { setPaymentInvoice(inv); setPaymentAmount(""); }}>
                                <CheckCircle2 className="h-4 w-4" /> Catat Pembayaran
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

      {paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setPaymentInvoice(null); }}>
          <div className="w-full max-w-md rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="border-b border-border pb-4">
              <p className="text-xs font-medium text-primary">Catat Pembayaran</p>
              <h2 className="mt-1 text-lg font-bold">{paymentInvoice.orderId}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{paymentInvoice.customer}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total tagihan</span><span className="font-medium">{formatRupiah(paymentInvoice.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sudah dibayar</span><span className="font-medium text-emerald-600">{formatRupiah(paymentInvoice.dp)}</span></div>
              <div className="flex justify-between border-b border-border pb-3"><span className="text-muted-foreground">Sisa tagihan</span><span className="font-medium text-rose-600">{formatRupiah(Math.max(0, paymentInvoice.amount - paymentInvoice.dp))}</span></div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Nominal pembayaran</span>
                <input value={paymentAmount} onChange={(e) => setPaymentAmount(formatPaymentInput(e.target.value))} placeholder="Masukkan nominal" inputMode="numeric" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentInvoice(null)}>Batal</Button>
              <Button onClick={recordPayment} disabled={!paymentAmount}>Simpan Pembayaran</Button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedInvoice(null); }}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-primary">Invoice TurkiUp</p>
                <h2 className="mt-1 text-xl font-bold">{selectedInvoice.orderId}</h2>
              </div>
              <Badge className={statusConfig[selectedInvoice.status].className}>{statusConfig[selectedInvoice.status].label}</Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Pelanggan", value: selectedInvoice.customer },
                { label: "No. WA", value: selectedInvoice.customerPhone },
                { label: "Layanan", value: selectedInvoice.services.length === 1 ? selectedInvoice.services[0] : `${selectedInvoice.services.length} layanan` },
                { label: "Staf", value: selectedInvoice.staff.length ? selectedInvoice.staff.join(", ") : "Belum ditugaskan" },
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
