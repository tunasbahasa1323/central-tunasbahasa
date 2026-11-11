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
  type PaymentRecord = { amount: number; paidAt: string; paymentType: string; proofUrl: string | null; proofType: string | null };
  type Invoice = {
    databaseId: string;
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
  const [paymentOption, setPaymentOption] = useState<"custom" | "half" | "full">("custom");
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [previewProof, setPreviewProof] = useState<{ url: string; isPdf: boolean } | null>(null);
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
          databaseId: row.id,
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

  async function loadPaymentHistory(invoice: Invoice) {
    if (!isSupabaseConfigured) return;
    setIsLoadingHistory(true);
    const result = await supabase.from("tu_order_payments").select("amount, paid_at, payment_type, proof_url").eq("order_id", invoice.databaseId).order("paid_at", { ascending: false });
    if (result.error) {
      setLoadError(`Gagal memuat riwayat pembayaran: ${result.error.message}`);
      setPaymentHistory([]);
    } else {
      setPaymentHistory((result.data ?? []).map((payment) => ({ amount: payment.amount, paidAt: payment.paid_at, paymentType: payment.payment_type, proofUrl: payment.proof_url, proofType: payment.proof_url?.toLowerCase().includes(".pdf") || payment.proof_url?.toLowerCase().includes("/raw/upload/") ? "application/pdf" : "image/*" })));
    }
    setIsLoadingHistory(false);
  }

  async function recordPayment() {
    if (!paymentInvoice || !isSupabaseConfigured) return;
    const payment = Number(paymentAmount.replace(/\D/g, ""));
    if (!payment) return;

    const totalPaidAmount = Math.min(paymentInvoice.amount, paymentInvoice.dp + payment);
    const nextStatus: PaymentStatus = totalPaidAmount >= paymentInvoice.amount ? "paid" : "partial";
    setIsSavingPayment(true);
    let proofUrl: string | null = null;
    let proofPublicId: string | null = null;
    if (paymentProof) {
      const formData = new FormData();
      formData.append("file", paymentProof);
      const uploadResult = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
      const uploadData = await uploadResult.json();
      if (!uploadResult.ok) {
        setLoadError(uploadData.error ?? "Gagal mengunggah bukti pembayaran.");
        setIsSavingPayment(false);
        return;
      }
      proofUrl = uploadData.secureUrl;
      proofPublicId = uploadData.publicId;
    }
    const paymentResult = await supabase.from("tu_order_payments").insert({ order_id: paymentInvoice.databaseId, amount: payment, payment_type: nextStatus === "paid" ? "paid" : "partial", paid_at: new Date().toISOString(), proof_url: proofUrl, proof_public_id: proofPublicId }).select("id").single();
    if (paymentResult.error) {
      setLoadError(`Gagal menyimpan riwayat pembayaran: ${paymentResult.error.message}`);
      setIsSavingPayment(false);
      return;
    }
    const result = await supabase.from("tu_orders").update({ dp: totalPaidAmount, status: nextStatus, updated_at: new Date().toISOString() }).eq("id", paymentInvoice.databaseId).select("order_code, dp, status").single();
    if (result.error) {
      setLoadError(`Gagal menyimpan pembayaran: ${result.error.message}`);
      setIsSavingPayment(false);
      return;
    }
    setInvoices((current) => current.map((invoice) => invoice.orderId !== paymentInvoice.orderId ? invoice : { ...invoice, dp: result.data.dp, status: result.data.status as PaymentStatus }));
    setPaymentInvoice(null);
    setPaymentAmount("");
    setPaymentOption("custom");
    setPaymentProof(null);
    setIsSavingPayment(false);
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
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(inv); void loadPaymentHistory(inv); }}>
                              <Eye className="h-4 w-4" /> Lihat invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4" /> Kirim via WA
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4" /> Unduh PDF
                            </DropdownMenuItem>
                            {inv.status !== "paid" && (
                              <DropdownMenuItem onClick={() => { setPaymentInvoice(inv); setPaymentAmount(""); setPaymentOption("custom"); }}>
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
              <div>
                <span className="mb-1.5 block text-xs font-medium">Pilihan pembayaran</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "half" as const, label: "DP 50%", amount: paymentInvoice.amount * 0.5 },
                    { value: "full" as const, label: "Lunas", amount: paymentInvoice.amount },
                    { value: "custom" as const, label: "Nominal manual", amount: null },
                  ].map((option) => (
                    <button type="button" key={option.value} onClick={() => { setPaymentOption(option.value); if (option.amount !== null) setPaymentAmount(formatPaymentInput(String(Math.max(0, option.amount - paymentInvoice.dp)))); }} className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${paymentOption === option.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Nominal pembayaran</span>
                <input value={paymentAmount} onChange={(e) => { setPaymentOption("custom"); setPaymentAmount(formatPaymentInput(e.target.value)); }} placeholder="Masukkan nominal" inputMode="numeric" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-medium">Bukti pembayaran (opsional)</span>
                              <input type="file" accept="image/*,application/pdf" onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)} className="block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium" />
                              <span className="mt-1 block text-[11px] text-muted-foreground">JPG, PNG, atau PDF. File disimpan ke Cloudinary.</span>
                            </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentInvoice(null)}>Batal</Button>
              <Button onClick={() => void recordPayment()} disabled={!paymentAmount || isSavingPayment}>{isSavingPayment ? "Menyimpan..." : "Simpan Pembayaran"}</Button>
            </div>
          </div>
        </div>
      )}

      {previewProof && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewProof(null); }}>
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-card p-4 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="font-semibold">Preview Bukti Pembayaran</p>
              <div className="flex items-center gap-2">
                <a href={previewProof.url} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Buka Tab Baru</a>
                <Button variant="outline" size="sm" onClick={() => setPreviewProof(null)}>Tutup</Button>
              </div>
            </div>
            <div className="mt-4 flex min-h-[300px] flex-1 items-center justify-center overflow-auto rounded-lg bg-muted/40 p-3">
              {previewProof.isPdf ? <iframe src={previewProof.url} title="Preview bukti pembayaran" className="h-[70vh] w-full rounded-md border border-border bg-background" /> : <img src={previewProof.url} alt="Bukti pembayaran" className="max-h-[70vh] max-w-full rounded-md object-contain" />}
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
                  <p className="mt-0.5 text-xs text-emerald-600">Total dibayar: {formatRupiah(selectedInvoice.dp)} · Sisa: {formatRupiah(selectedInvoice.amount - selectedInvoice.dp)}</p>
                )}
              </div>
              <div className="sm:col-span-2 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Riwayat Pembayaran</p>
                  {isLoadingHistory && <span className="text-xs text-muted-foreground">Memuat...</span>}
                </div>
                {!isLoadingHistory && paymentHistory.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Belum ada riwayat pembayaran.</p>}
                {!isLoadingHistory && paymentHistory.length > 0 && <div className="mt-2 divide-y divide-border">{paymentHistory.map((payment, index) => <div key={`${payment.paidAt}-${index}`} className="flex items-center justify-between gap-3 py-2 text-xs"><div><p className="font-medium">{payment.paymentType === "paid" ? "Pelunasan" : "DP/Sebagian"}</p><p className="text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.paidAt))}</p></div><div className="text-right"><p className="font-semibold text-emerald-600">{formatRupiah(payment.amount)}</p>{payment.proofUrl ? <button type="button" onClick={() => { const proofUrl = payment.proofUrl; if (proofUrl) { const isPdf = proofUrl.toLowerCase().includes(".pdf") || proofUrl.toLowerCase().includes("/raw/upload/"); const previewUrl = `/api/cloudinary/proof?url=${encodeURIComponent(proofUrl)}&type=${isPdf ? "pdf" : "image"}`; setPreviewProof({ url: previewUrl, isPdf }); } }} className="text-primary hover:underline">Lihat bukti</button> : <span className="text-muted-foreground">Tanpa bukti</span>}</div></div>)}</div>}
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
