"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Plus,
  Search,
  Eye,
  FileText,
  MessageSquare,
  MoreHorizontal,
  User,
  Filter,
  Trash2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

type PaymentStatus = "paid" | "partial" | "unpaid";

const orders = [
  { id: "TRK-202611-008", customer: "PT Karya Maju", customerPhone: "08123456789", service: "Jasa Penerjemahan Dokumen", amount: 1850000, dp: 0, status: "paid" as PaymentStatus, date: "10 Nov 2026", staff: "Diana Putri", staffInitials: "DP" },
  { id: "TRK-202611-007", customer: "Yayasan Al-Hikmah", customerPhone: "08987654321", service: "Kelas Bahasa Turki Privat", amount: 2500000, dp: 1000000, status: "partial" as PaymentStatus, date: "09 Nov 2026", staff: "M Galih Rakasiwi", staffInitials: "MG" },
  { id: "TRK-202611-006", customer: "CV Nusantara Media", customerPhone: "08567890123", service: "Interpretasi Meeting Online", amount: 750000, dp: 0, status: "unpaid" as PaymentStatus, date: "08 Nov 2026", staff: "Windi Alfira", staffInitials: "WA" },
  { id: "TRK-202611-005", customer: "Dr. Andi Surya", customerPhone: "08234567890", service: "Jasa Penerjemahan Dokumen", amount: 1200000, dp: 0, status: "paid" as PaymentStatus, date: "07 Nov 2026", staff: "Diana Putri", staffInitials: "DP" },
  { id: "TRK-202611-004", customer: "RSUD Ciawi Bogor", customerPhone: "08345678901", service: "Pelatihan Bahasa Turki Grup", amount: 4200000, dp: 0, status: "paid" as PaymentStatus, date: "06 Nov 2026", staff: "M Galih Rakasiwi", staffInitials: "MG" },
  { id: "TRK-202611-003", customer: "Bapak Hendra Kurniawan", customerPhone: "08456789012", service: "Kelas Bahasa Turki Privat", amount: 2500000, dp: 0, status: "paid" as PaymentStatus, date: "04 Nov 2026", staff: "Diana Putri", staffInitials: "DP" },
];

const statusConfig = {
  paid: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  partial: { label: "DP/Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700" },
  unpaid: { label: "Belum bayar", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

export default function TurkiUpOrdersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[number] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([{ id: 1, service: "", quantity: "1", amount: "", discount: "" }]);
  const [discount, setDiscount] = useState("");

  function formatNumberInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
  }

  function addOrderItem() {
    setOrderItems((items) => [...items, { id: Date.now(), service: "", quantity: "1", amount: "", discount: "" }]);
  }

  function updateOrderItem(id: number, field: "service" | "quantity" | "amount" | "discount", value: string) {
    const formattedValue = field === "quantity" || field === "amount" ? formatNumberInput(value) : value;
    setOrderItems((items) => items.map((item) => item.id === id ? { ...item, [field]: formattedValue } : item));
  }

  function removeOrderItem(id: number) {
    setOrderItems((items) => items.length === 1 ? items : items.filter((item) => item.id !== id));
  }

  function downloadInvoicePdf() {
    if (!selectedOrder) return;
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Invoice TurkiUp", 20, 25);
    pdf.setFontSize(13);
    pdf.text(selectedOrder.id, 20, 35);
    pdf.setFontSize(11);
    pdf.text(`Status: ${statusConfig[selectedOrder.status].label}`, 20, 48);
    pdf.text(`Pelanggan: ${selectedOrder.customer}`, 20, 62);
    pdf.text(`Nomor WA: ${selectedOrder.customerPhone}`, 20, 72);
    pdf.text(`Layanan: ${selectedOrder.service}`, 20, 82);
    pdf.text(`Staf Pengerjaan: ${selectedOrder.staff}`, 20, 92);
    pdf.text(`Tanggal Order: ${selectedOrder.date}`, 20, 102);
    pdf.text(`DP Diterima: ${selectedOrder.dp ? formatRupiah(selectedOrder.dp) : "-"}`, 20, 112);
    pdf.setFontSize(14);
    pdf.text(`Total Tagihan: ${formatRupiah(selectedOrder.amount)}`, 20, 132);
    pdf.save(`${selectedOrder.id}.pdf`);
  }

  const orderSubtotal = orderItems.reduce((sum, item) => {
    const quantity = Number(item.quantity.replace(/\D/g, "")) || 1;
    const amount = Number(item.amount.replace(/\D/g, "")) || 0;
    const itemDiscount = Number(item.discount.replace(/\D/g, "")) || 0;
    return sum + Math.max(0, quantity * amount - itemDiscount);
  }, 0);
  const orderTotal = Math.max(0, orderSubtotal - (Number(discount.replace(/\D/g, "")) || 0));

  const filtered = useMemo(() =>
    orders.filter((o) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.service.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Semua status" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    }), [query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Sales & CRM</p>
          <h1 className="text-2xl font-semibold tracking-tight">Order & Pelanggan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola transaksi, penugasan staf, dan data pelanggan TurkiUp.</p>
        </div>
        <Button size="sm" onClick={() => { setOrderItems([{ id: 1, service: "", quantity: "1", amount: "", discount: "" }]); setDiscount(""); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4" /> Buat Order Baru
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total order", value: orders.length },
          { label: "Lunas", value: orders.filter((o) => o.status === "paid").length, className: "text-emerald-600" },
          { label: "DP/Sebagian", value: orders.filter((o) => o.status === "partial").length, className: "text-amber-600" },
          { label: "Belum bayar", value: orders.filter((o) => o.status === "unpaid").length, className: "text-rose-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.className ?? ""}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari no. order, pelanggan, atau layanan..."
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none hover:bg-muted">
                <Filter className="h-3.5 w-3.5" /> {statusFilter}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["Semua status", "paid", "partial", "unpaid"].map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                    {s === "Semua status" ? s : statusConfig[s as PaymentStatus].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">No. Order</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Layanan</th>
                  <th className="px-4 py-3 font-medium">Staf</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-medium text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.service}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">{order.staffInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{order.staff}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(order.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusConfig[order.status].className}>{statusConfig[order.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label={`Aksi ${order.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" /> Lihat invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4" /> Kirim via WA
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="h-4 w-4" /> Detail pelanggan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {orders.length} order
          </div>
        </CardContent>
      </Card>

      {/* Invoice detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-primary">Invoice TurkiUp</p>
                <h2 className="mt-1 text-xl font-bold">{selectedOrder.id}</h2>
              </div>
              <Badge className={statusConfig[selectedOrder.status].className}>{statusConfig[selectedOrder.status].label}</Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Pelanggan", value: selectedOrder.customer },
                { label: "Nomor WA", value: selectedOrder.customerPhone },
                { label: "Layanan", value: selectedOrder.service },
                { label: "Staf Pengerjaan", value: selectedOrder.staff },
                { label: "Tanggal Order", value: selectedOrder.date },
                { label: "DP Diterima", value: selectedOrder.dp ? formatRupiah(selectedOrder.dp) : "-" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Tagihan</p>
                <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(selectedOrder.amount)}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Tutup</Button>
              <Button variant="outline"><MessageSquare className="h-4 w-4" /> Kirim WA</Button>
              <Button onClick={downloadInvoicePdf}><FileText className="h-4 w-4" /> Unduh PDF</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create order modal - placeholder */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div className="w-full max-w-2xl rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold">Buat Order Baru</h2>
            <p className="mt-1 text-sm text-muted-foreground">Isi data transaksi untuk pelanggan TurkiUp.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Nama pelanggan", name: "customer", placeholder: "Contoh: PT Karya Maju" },
                { label: "No. WhatsApp pelanggan", name: "phone", placeholder: "08xxxxxxxxxx" },
              ].map((f) => (
                <label key={f.name} className="space-y-1.5 text-sm">
                  <span className="font-medium">{f.label}</span>
                  <input name={f.name} placeholder={f.placeholder} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
                </label>
              ))}
              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Daftar layanan / pesanan</span><Button type="button" variant="outline" size="sm" onClick={addOrderItem}><Plus className="h-4 w-4" /> Tambah Layanan</Button></div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground"><th className="px-3 py-2 font-medium">No.</th><th className="px-3 py-2 font-medium">Layanan / Jasa</th><th className="px-3 py-2 font-medium">Banyak Orderan</th><th className="px-3 py-2 font-medium">Nominal (Rp)</th><th className="px-3 py-2 font-medium">Discount Item</th><th className="px-3 py-2 font-medium">Total Harga</th><th className="px-3 py-2" /></tr></thead>
                                        <tbody>{orderItems.map((item, index) => { const quantity = Number(item.quantity.replace(/\D/g, "")) || 1; const amount = Number(item.amount.replace(/\D/g, "")) || 0; const itemDiscount = Number(item.discount.replace(/\D/g, "")) || 0; return <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-2 text-muted-foreground">{index + 1}</td><td className="px-3 py-2"><select value={item.service} onChange={(event) => updateOrderItem(item.id, "service", event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Pilih layanan</option><option>Jasa Penerjemahan Dokumen</option><option>Kelas Bahasa Turki Privat</option><option>Interpretasi Meeting Online</option><option>Pelatihan Bahasa Turki Grup</option></select></td><td className="px-3 py-2"><input value={item.quantity} onChange={(event) => updateOrderItem(item.id, "quantity", event.target.value)} inputMode="numeric" placeholder="1" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2"><input value={item.amount} onChange={(event) => updateOrderItem(item.id, "amount", event.target.value)} inputMode="numeric" placeholder="1.000" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2"><input value={item.discount} onChange={(event) => updateOrderItem(item.id, "discount", event.target.value)} inputMode="numeric" placeholder="Opsional" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2 font-semibold text-primary">{formatRupiah(Math.max(0, quantity * amount - itemDiscount))}</td><td className="px-3 py-2"><Button type="button" variant="ghost" size="sm" disabled={orderItems.length === 1} onClick={() => removeOrderItem(item.id)} aria-label="Hapus layanan"><Trash2 className="h-4 w-4 text-rose-600" /></Button></td></tr>; })}</tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-col items-end gap-2 border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-sm font-medium">Discount (opsional)<input value={discount} onChange={(event) => setDiscount(formatNumberInput(event.target.value))} inputMode="numeric" placeholder="0" className="h-9 w-36 rounded-md border border-input bg-background px-3 text-right text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></label>
                  <p className="text-right text-sm font-semibold text-primary">Total: {formatRupiah(orderTotal)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Simpan & Generate Invoice</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
