"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
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
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

type PaymentStatus = "paid" | "partial" | "unpaid";
type OrderItem = { service: string; quantity: number; amount: number; discount: number; staff: string; staffInitials: string };
type Order = { id: string; customer: string; customerPhone: string; items: OrderItem[]; dp: number; status: PaymentStatus; date: string; staff: string; staffInitials: string };

function calculateOrderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + Math.max(0, item.quantity * item.amount - item.discount), 0);
}

function orderServiceSummary(order: Order) {
  return order.items.length === 1 ? order.items[0].service : `${order.items.length} layanan`;
}

function orderStaffSummary(order: Order) {
  const staff = order.items.filter((item, index, items) =>
    items.findIndex((candidate) => candidate.staff === item.staff) === index,
  );

  return {
    visible: staff.slice(0, 3),
    remaining: Math.max(0, staff.length - 3),
    count: staff.length,
  };
}

const statusConfig = {
  paid: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  partial: { label: "DP/Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700" },
  unpaid: { label: "Belum bayar", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

export default function TurkiUpOrdersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; basePrice: number }[]>([]);
  const [serviceQueries, setServiceQueries] = useState<Record<number, string>>({});
  const [activeServicePicker, setActiveServicePicker] = useState<number | null>(null);
  const [servicePickerPosition, setServicePickerPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isCustomerSaving, setIsCustomerSaving] = useState(false);
  const [customerMessage, setCustomerMessage] = useState("");
  const [orderItems, setOrderItems] = useState([{ id: 1, service: "", quantity: "1", amount: "", discount: "" }]);
  const [discount, setDiscount] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCustomers() {
      if (!isSupabaseConfigured) return;
      const result = await supabase.from("tu_customers").select("id, name, phone").order("name", { ascending: true });
      if (active && !result.error) setCustomers(result.data ?? []);
    }
    void loadCustomers();
    async function loadServices() {
      if (!isSupabaseConfigured) return;
      const result = await supabase.from("tu_services").select("id, name, base_price").eq("is_active", true).order("name", { ascending: true });
      if (active && !result.error) setServices((result.data ?? []).map((service) => ({ id: service.id, name: service.name, basePrice: service.base_price })));
    }
    void loadServices();
    async function loadOrders() {
      if (!isSupabaseConfigured) {
        setLoadError("Supabase belum dikonfigurasi.");
        return;
      }
      const result = await supabase.from("tu_orders").select("*, tu_order_items(*)").order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setLoadError(`Gagal memuat order: ${result.error.message}`);
        return;
      }
      setOrders((result.data ?? []).map((row) => {
        const items = (row.tu_order_items ?? []).map((item: { service_name: string; quantity: number; amount: number; discount: number; staff_name: string; staff_initials: string }) => ({
          service: item.service_name,
          quantity: item.quantity,
          amount: item.amount,
          discount: item.discount,
          staff: item.staff_name,
          staffInitials: item.staff_initials,
        }));
        return {
          id: row.order_code,
          customer: row.customer_name,
          customerPhone: row.customer_phone,
          items,
          dp: row.dp,
          status: row.status,
          date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.created_at)),
          staff: items[0]?.staff ?? "",
          staffInitials: items[0]?.staffInitials ?? "",
        };
      }));
    }
    void loadOrders();
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") void loadOrders();
    };
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, []);

  useEffect(() => {
    if (!isCreateOpen || !isSupabaseConfigured) return;
    async function refreshServices() {
      const result = await supabase.from("tu_services").select("id, name, base_price").eq("is_active", true).order("name", { ascending: true });
      if (!result.error) {
        setServices((result.data ?? []).map((service) => ({ id: service.id, name: service.name, basePrice: service.base_price })));
      }
    }
    void refreshServices();
  }, [isCreateOpen]);

  const matchingCustomers = customers.filter((customer) => {
    const value = customerQuery.trim().toLowerCase();
    return !value || `${customer.name} ${customer.phone}`.toLowerCase().includes(value);
  });

  async function saveCustomer() {
    const form = document.querySelector("form[name=customer]") as HTMLFormElement | null;
    const data = form ? new FormData(form) : null;
    const name = String(data?.get("name") ?? "").trim();
    const phone = String(data?.get("phone") ?? "").trim();
    if (!name || !phone || !isSupabaseConfigured) {
      setCustomerMessage(!isSupabaseConfigured ? "Supabase belum dikonfigurasi." : "Nama dan nomor WhatsApp wajib diisi.");
      return;
    }
    setIsCustomerSaving(true);
    const result = await supabase.from("tu_customers").insert({ name, phone }).select("id, name, phone").single();
    if (result.error) {
      setCustomerMessage(`Gagal menyimpan customer: ${result.error.message}`);
      setIsCustomerSaving(false);
      return;
    }
    setCustomers((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)));
    setCustomerQuery(result.data.name);
    const customerInput = document.querySelector('input[name="customer"]') as HTMLInputElement | null;
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement | null;
    if (customerInput) customerInput.value = result.data.name;
    if (phoneInput) phoneInput.value = result.data.phone;
    setIsCustomerFormOpen(false);
    setIsCustomerPickerOpen(false);
    setCustomerMessage("");
    setIsCustomerSaving(false);
  }

  function selectCustomer(customer: { name: string; phone: string }) {
    setCustomerQuery(customer.name);
    const customerInput = document.querySelector('input[name="customer"]') as HTMLInputElement | null;
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement | null;
    if (customerInput) customerInput.value = customer.name;
    if (phoneInput) phoneInput.value = customer.phone;
    setIsCustomerPickerOpen(false);
  }

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
    if (field === "service") setServiceQueries((queries) => ({ ...queries, [id]: value }));
  }

  function openServicePicker(itemId: number, input: HTMLInputElement) {
    const rect = input.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 360), window.innerWidth - 24);
    const left = Math.min(rect.left, window.innerWidth - width - 12);
    setServicePickerPosition({ top: rect.bottom + 4, left: Math.max(12, left), width });
    setActiveServicePicker(itemId);
  }

  function selectService(itemId: number, service: { name: string; basePrice: number }) {
    setOrderItems((items) => items.map((item) => item.id === itemId ? { ...item, service: service.name, amount: service.basePrice ? formatNumberInput(String(service.basePrice)) : item.amount } : item));
    setServiceQueries((queries) => ({ ...queries, [itemId]: service.name }));
    setActiveServicePicker(null);
    setServicePickerPosition(null);
  }

  function removeOrderItem(id: number) {
    setOrderItems((items) => items.length === 1 ? items : items.filter((item) => item.id !== id));
  }

  async function saveOrder() {
    const customerName = (document.querySelector('input[name="customer"]') as HTMLInputElement)?.value.trim();
    const customerPhone = (document.querySelector('input[name="phone"]') as HTMLInputElement)?.value.trim();
    const validItems = orderItems.filter((item) => item.service.trim());
    if (!customerName || !customerPhone || validItems.length === 0) {
      setSaveMessage("Nama pelanggan, nomor WhatsApp, dan minimal satu layanan wajib diisi.");
      return;
    }
    if (!isSupabaseConfigured) {
      setSaveMessage("Supabase belum dikonfigurasi.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    const customerResult = await supabase.from("tu_customers").select("id").eq("phone", customerPhone).maybeSingle();
    if (customerResult.error) {
      setSaveMessage(`Gagal mencari pelanggan: ${customerResult.error.message}`);
      setIsSaving(false);
      return;
    }
    const orderResult = await supabase.from("tu_orders").insert({
      customer_id: customerResult.data?.id ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
      dp: 0,
      status: "unpaid",
    }).select("id").single();
    if (orderResult.error) {
      setSaveMessage(`Gagal menyimpan order: ${orderResult.error.message}`);
      setIsSaving(false);
      return;
    }

    const itemResult = await supabase.from("tu_order_items").insert(validItems.map((item) => ({
      order_id: orderResult.data.id,
      service_name: item.service,
      quantity: Number(item.quantity.replace(/\D/g, "")) || 1,
      amount: Number(item.amount.replace(/\D/g, "")) || 0,
      discount: Number(item.discount.replace(/\D/g, "")) || 0,
      staff_name: "",
      staff_initials: "",
    })));
    if (itemResult.error) {
      await supabase.from("tu_orders").delete().eq("id", orderResult.data.id);
      setSaveMessage(`Gagal menyimpan layanan order: ${itemResult.error.message}`);
      setIsSaving(false);
      return;
    }

    setSaveMessage("Order berhasil disimpan.");
    window.setTimeout(() => setSaveMessage(""), 4000);
    setIsSaving(false);
    setIsCreateOpen(false);
    setOrderItems([{ id: Date.now(), service: "", quantity: "1", amount: "", discount: "" }]);
    setDiscount("");
    const refreshed = await supabase.from("tu_orders").select("*, tu_order_items(*)").order("created_at", { ascending: false });
    if (!refreshed.error) {
      setOrders((refreshed.data ?? []).map((row) => {
        const items = (row.tu_order_items ?? []).map((item: { service_name: string; quantity: number; amount: number; discount: number; staff_name: string; staff_initials: string }) => ({ service: item.service_name, quantity: item.quantity, amount: item.amount, discount: item.discount, staff: item.staff_name, staffInitials: item.staff_initials }));
        return { id: row.order_code, customer: row.customer_name, customerPhone: row.customer_phone, items, dp: row.dp, status: row.status, date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.created_at)), staff: items[0]?.staff ?? "", staffInitials: items[0]?.staffInitials ?? "" };
      }));
    }
  }

  async function downloadInvoicePdf() {
    if (!selectedOrder) return;
    const pdf = new jsPDF();
    const verificationUrl = `${window.location.origin}/turkiup/orders?invoice=${encodeURIComponent(selectedOrder.id)}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 160 });
    pdf.setFontSize(18);
    pdf.text("Invoice TurkiUp", 20, 25);
    // Place the verification QR at the lower-left of the invoice.
    const qrX = 20;
    const qrY = 250;
    pdf.addImage(qrDataUrl, "PNG", qrX, qrY, 35, 35);
    pdf.setFontSize(13);
    pdf.text(selectedOrder.id, 20, 35);
    pdf.setFontSize(11);
    pdf.text(`Status: ${statusConfig[selectedOrder.status].label}`, 20, 48);
    pdf.text(`Pelanggan: ${selectedOrder.customer}`, 20, 62);
    pdf.text(`Nomor WA: ${selectedOrder.customerPhone}`, 20, 72);
    pdf.text(`Tanggal Order: ${selectedOrder.date}`, 20, 82);
    pdf.setFontSize(11);
    selectedOrder.items.forEach((item, index) => {
      const y = 98 + index * 12;
      pdf.text(`${index + 1}. ${item.service} (${item.quantity} x ${formatRupiah(item.amount)})`, 20, y);
      pdf.text(`Total: ${formatRupiah(Math.max(0, item.quantity * item.amount - item.discount))}`, 145, y);
    });
    const totalY = 98 + selectedOrder.items.length * 12 + 8;
    pdf.text(`DP Diterima: ${selectedOrder.dp ? formatRupiah(selectedOrder.dp) : "-"}`, 20, totalY);
    pdf.setFontSize(14);
    pdf.text(`Total Tagihan: ${formatRupiah(calculateOrderTotal(selectedOrder))}`, 20, totalY + 16);
    pdf.setFontSize(8);
    pdf.text("Scan untuk verifikasi invoice", qrX, qrY + 43);
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
      const matchesQuery = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.items.some((item) => item.service.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "Semua status" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    }), [orders, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Sales & CRM</p>
          <h1 className="text-2xl font-semibold tracking-tight">Order & Pelanggan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola transaksi, penugasan staf, dan data pelanggan TurkiUp.</p>
        </div>
        <Button size="sm" onClick={() => { setOrderItems([{ id: 1, service: "", quantity: "1", amount: "", discount: "" }]); setDiscount(""); setServiceQueries({}); setActiveServicePicker(null); setServicePickerPosition(null); setIsCreateOpen(true); }}>
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

      {loadError && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</p>}
      {saveMessage && <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{saveMessage}</p>}

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
                    <td className="px-4 py-3 text-muted-foreground">{orderServiceSummary(order)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const staffSummary = orderStaffSummary(order);
                        return (
                          <div className="flex -space-x-1.5" title={order.items.map((item) => `${item.service}: ${item.staff}`).join(" | ")}>
                            {staffSummary.visible.map((item) => (
                              <Avatar key={item.staff} className="h-7 w-7 border-2 border-background">
                                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{item.staffInitials}</AvatarFallback>
                              </Avatar>
                            ))}
                            {staffSummary.remaining > 0 && (
                              <Avatar className="h-7 w-7 border-2 border-background">
                                <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">+{staffSummary.remaining}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(calculateOrderTotal(order))}</td>
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
                { label: "Layanan", value: orderServiceSummary(selectedOrder) },
                { label: "Staf Pengerjaan", value: selectedOrder.staff },
                { label: "Tanggal Order", value: selectedOrder.date },
                { label: "DP Diterima", value: selectedOrder.dp ? formatRupiah(selectedOrder.dp) : "-" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Rincian Layanan</p>
                <div className="space-y-2">{selectedOrder.items.map((item) => <div key={item.service} className="flex items-start justify-between gap-4 text-sm"><span>{item.service}<span className="block text-xs text-muted-foreground">{item.quantity} x {formatRupiah(item.amount)}{item.discount ? ` · Diskon ${formatRupiah(item.discount)}` : ""} · {item.staff}</span></span><span className="shrink-0 font-medium">{formatRupiah(Math.max(0, item.quantity * item.amount - item.discount))}</span></div>)}</div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3"><p className="text-xs text-muted-foreground">Total Tagihan</p><p className="text-xl font-bold text-primary">{formatRupiah(calculateOrderTotal(selectedOrder))}</p></div>
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

      {isCustomerFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
          <form name="customer" onSubmit={(event) => { event.preventDefault(); void saveCustomer(); }} className="w-full max-w-md rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <p className="text-xs font-medium text-primary">Data Customer</p>
            <h2 className="mt-1 text-xl font-bold">Tambah Customer</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5 text-sm"><span className="font-medium">Nama pelanggan</span><input name="name" defaultValue={customerQuery} placeholder="Nama lengkap atau nama perusahaan" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" /></label>
              <label className="block space-y-1.5 text-sm"><span className="font-medium">No. WhatsApp</span><input name="phone" placeholder="08xxxxxxxxxx" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" /></label>
              {customerMessage && <p className="text-sm text-rose-600">{customerMessage}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsCustomerFormOpen(false)}>Batal</Button><Button type="submit" disabled={isCustomerSaving}>{isCustomerSaving ? "Menyimpan..." : "Simpan Customer"}</Button></div>
          </form>
        </div>
      )}

      {/* Create order modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div className="w-full max-w-2xl rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold">Buat Order Baru</h2>
            <p className="mt-1 text-sm text-muted-foreground">Isi data transaksi untuk pelanggan TurkiUp.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="relative space-y-1.5 text-sm">
                <span className="font-medium">Nama pelanggan</span>
                <input name="customer" value={customerQuery} onFocus={() => setIsCustomerPickerOpen(true)} onChange={(event) => { setCustomerQuery(event.target.value); setIsCustomerPickerOpen(true); }} placeholder="Cari nama pelanggan..." autoComplete="off" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
                {isCustomerPickerOpen && (
                  <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
                    {matchingCustomers.map((customer) => <button type="button" key={customer.id} onClick={() => selectCustomer(customer)} className="flex w-full flex-col rounded px-3 py-2 text-left text-sm hover:bg-muted"><span className="font-medium">{customer.name}</span><span className="text-xs text-muted-foreground">{customer.phone}</span></button>)}
                    {matchingCustomers.length === 0 && <button type="button" onClick={() => { setIsCustomerFormOpen(true); setCustomerMessage(""); }} className="w-full rounded px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/5">+ Tambah Customer Baru</button>}
                  </div>
                )}
              </label>
              <label className="space-y-1.5 text-sm"><span className="font-medium">No. WhatsApp pelanggan</span><input name="phone" placeholder="08xxxxxxxxxx" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></label>
              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Daftar layanan / pesanan</span><Button type="button" variant="outline" size="sm" onClick={addOrderItem}><Plus className="h-4 w-4" /> Tambah Layanan</Button></div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground"><th className="px-3 py-2 font-medium">No.</th><th className="px-3 py-2 font-medium">Layanan / Jasa</th><th className="px-3 py-2 font-medium">Banyak Orderan</th><th className="px-3 py-2 font-medium">Nominal (Rp)</th><th className="px-3 py-2 font-medium">Discount Item</th><th className="px-3 py-2 font-medium">Total Harga</th><th className="px-3 py-2" /></tr></thead>
                                        <tbody>{orderItems.map((item, index) => { const quantity = Number(item.quantity.replace(/\D/g, "")) || 1; const amount = Number(item.amount.replace(/\D/g, "")) || 0; const itemDiscount = Number(item.discount.replace(/\D/g, "")) || 0; const serviceQuery = serviceQueries[item.id] ?? item.service; const matchingServices = services.filter((service) => service.name.toLowerCase().includes(serviceQuery.toLowerCase())); return <tr key={item.id} className="border-b last:border-0"><td className="px-3 py-2 text-muted-foreground">{index + 1}</td><td className="relative px-3 py-2"><input value={serviceQuery} onFocus={(event) => openServicePicker(item.id, event.currentTarget)} onChange={(event) => { updateOrderItem(item.id, "service", event.target.value); openServicePicker(item.id, event.currentTarget); }} placeholder="Ketik/pilih layanan" autoComplete="off" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />{activeServicePicker === item.id && <div className="fixed z-[70] max-h-44 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg" style={servicePickerPosition ? { top: servicePickerPosition.top, left: servicePickerPosition.left, width: servicePickerPosition.width } : undefined}>{matchingServices.map((service) => <button type="button" key={service.id} onClick={() => selectService(item.id, service)} className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-muted"><span className="min-w-0 flex-1 whitespace-normal break-words pr-2">{service.name}</span><span className="shrink-0 text-xs text-muted-foreground">{formatRupiah(service.basePrice)}</span></button>)}{matchingServices.length === 0 && serviceQuery && <p className="px-3 py-2 text-xs text-muted-foreground">Layanan baru akan disimpan sebagai teks manual.</p>}</div>}</td><td className="px-3 py-2"><input value={item.quantity} onChange={(event) => updateOrderItem(item.id, "quantity", event.target.value)} inputMode="numeric" placeholder="1" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2"><input value={item.amount} onChange={(event) => updateOrderItem(item.id, "amount", event.target.value)} inputMode="numeric" placeholder="1.000" className="h-9 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2"><input value={item.discount} onChange={(event) => updateOrderItem(item.id, "discount", event.target.value)} inputMode="numeric" placeholder="Opsional" className="h-9 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" /></td><td className="px-3 py-2 font-semibold text-primary">{formatRupiah(Math.max(0, quantity * amount - itemDiscount))}</td><td className="px-3 py-2"><Button type="button" variant="ghost" size="sm" disabled={orderItems.length === 1} onClick={() => removeOrderItem(item.id)} aria-label="Hapus layanan"><Trash2 className="h-4 w-4 text-rose-600" /></Button></td></tr>; })}</tbody>
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
              <Button onClick={saveOrder} disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan & Generate Invoice"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
