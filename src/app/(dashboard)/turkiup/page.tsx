"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Users,
  MoreHorizontal,
  Eye,
  Plus,
  Plane,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const recentOrders = [
  { id: "TRK-202611-008", customer: "PT Karya Maju", service: "Jasa Penerjemahan Dokumen", amount: 1850000, status: "paid", date: "10 Nov 2026", staff: "Diana Putri" },
  { id: "TRK-202611-007", customer: "Yayasan Al-Hikmah", service: "Kelas Bahasa Turki Privat", amount: 2500000, status: "partial", date: "09 Nov 2026", staff: "M Galih Rakasiwi" },
  { id: "TRK-202611-006", customer: "CV Nusantara Media", service: "Interpretasi Meeting Online", amount: 750000, status: "unpaid", date: "08 Nov 2026", staff: "Windi Alfira" },
  { id: "TRK-202611-005", customer: "Dr. Andi Surya", service: "Jasa Penerjemahan Dokumen", amount: 1200000, status: "paid", date: "07 Nov 2026", staff: "Diana Putri" },
  { id: "TRK-202611-004", customer: "RSUD Ciawi Bogor", service: "Pelatihan Bahasa Turki Grup", amount: 4200000, status: "paid", date: "06 Nov 2026", staff: "M Galih Rakasiwi" },
];

const teamProgress = [
  { name: "Diana Putri", initials: "DP", tasks: 3, completed: 2, revenue: 5050000 },
  { name: "M Galih Rakasiwi", initials: "MG", tasks: 4, completed: 3, revenue: 6700000 },
  { name: "Windi Alfira", initials: "WA", tasks: 2, completed: 1, revenue: 1200000 },
];

const monthlyFinancials = [
  { month: "Jun", pemasukan: 14800000, pengeluaran: 6200000 },
  { month: "Jul", pemasukan: 16500000, pengeluaran: 7100000 },
  { month: "Agu", pemasukan: 15200000, pengeluaran: 6800000 },
  { month: "Sep", pemasukan: 19400000, pengeluaran: 8300000 },
  { month: "Okt", pemasukan: 22100000, pengeluaran: 9700000 },
  { month: "Nov", pemasukan: 24600000, pengeluaran: 11200000 },
];

const customerSources = [
  { name: "Referral", value: 38, color: "#2563eb" },
  { name: "Instagram", value: 27, color: "#0ea5e9" },
  { name: "Website", value: 21, color: "#14b8a6" },
  { name: "WhatsApp", value: 14, color: "#f59e0b" },
];

const formatCompactRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const statusConfig = {
  paid: { label: "Lunas", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  partial: { label: "Sebagian", className: "border-amber-200 bg-amber-50 text-amber-700" },
  unpaid: { label: "Belum bayar", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

export default function TurkiUpPage() {
  const [selectedOrder, setSelectedOrder] = useState<(typeof recentOrders)[number] | null>(null);

  const totalRevenue = recentOrders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const totalPartial = recentOrders.filter((o) => o.status === "partial").reduce((s, o) => s + o.amount, 0);
  const totalUnpaid = recentOrders.filter((o) => o.status === "unpaid").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
            <Plane className="h-4 w-4" />
            <span>Workspace TurkiUp</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard TurkiUp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola CRM, Order, Invoice, dan monitoring operasional tim TurkiUp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/turkiup/catalog"}>
            Katalog Jasa
          </Button>
          <Button size="sm" onClick={() => window.location.href = "/turkiup/orders"}>
            <Plus className="h-4 w-4" /> Buat Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pemasukan (Lunas)</p>
                <p className="mt-2 text-xl font-bold text-emerald-600">{formatRupiah(totalRevenue)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{recentOrders.filter((o) => o.status === "paid").length} transaksi lunas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Menunggu Pelunasan</p>
                <p className="mt-2 text-xl font-bold text-amber-600">{formatRupiah(totalPartial + totalUnpaid)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{recentOrders.filter((o) => o.status !== "paid").length} invoice belum lunas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Order</p>
                <p className="mt-2 text-xl font-bold">{recentOrders.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Bulan November 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tim Aktif</p>
                <p className="mt-2 text-xl font-bold">{teamProgress.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{teamProgress.reduce((s, t) => s + t.tasks, 0)} total tugas aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle>Pemasukan & Pengeluaran</CardTitle>
            <CardDescription>Perbandingan arus kas TurkiUp setiap bulan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Pemasukan</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Pengeluaran</span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyFinancials} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={formatCompactRupiah} />
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} contentStyle={{ borderRadius: 10, borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ display: "none" }} />
                  <Bar dataKey="pemasukan" name="Pemasukan" fill="#2563eb" fillOpacity={0.18} stroke="#2563eb" strokeWidth={1} radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" fillOpacity={0.16} stroke="#f43f5e" strokeWidth={1} radius={[5, 5, 0, 0]} />
                  <Line type="monotone" dataKey="pemasukan" name="Pemasukan (tren)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran (tren)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle>Sumber Pelanggan</CardTitle>
            <CardDescription>Distribusi pelanggan berdasarkan kanal</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={customerSources} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                    {customerSources.map((source) => <Cell key={source.name} fill={source.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-xs text-muted-foreground">total pelanggan</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {customerSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: source.color }} />{source.name}</span>
                  <span className="font-semibold">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Terbaru</CardTitle>
                  <CardDescription>Daftar transaksi dan status pembayaran</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/turkiup/orders"}>
                  Lihat semua
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-5 py-3 font-medium">No. Order</th>
                      <th className="px-4 py-3 font-medium">Pelanggan</th>
                      <th className="px-4 py-3 font-medium">Nominal</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.service}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatRupiah(order.amount)}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig[order.status as keyof typeof statusConfig].className}>
                            {statusConfig[order.status as keyof typeof statusConfig].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" /> Lihat invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4" /> Kirim via WA
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Progress */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Tim TurkiUp</CardTitle>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/turkiup/operations"}>
                  Board
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {teamProgress.map((member) => (
                <div key={member.name} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.completed}/{member.tasks} tugas selesai</p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.round((member.completed / member.tasks) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-medium text-emerald-600">{formatRupiah(member.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice detail popup */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-primary">Invoice TurkiUp</p>
                <h2 className="mt-1 text-xl font-bold">{selectedOrder.id}</h2>
              </div>
              <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig].className}>
                {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Pelanggan", value: selectedOrder.customer },
                { label: "Tanggal Order", value: selectedOrder.date },
                { label: "Layanan", value: selectedOrder.service },
                { label: "Staf Pengerjaan", value: selectedOrder.staff },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Tagihan</p>
                <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(selectedOrder.amount)}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Tutup</Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4" /> Kirim via WA
              </Button>
              <Button>
                <FileText className="h-4 w-4" /> Unduh PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
