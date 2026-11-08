"use client";

import { useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FinancialActivityChart } from "@/components/dashboard/financial-activity-chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stats = [
  {
    title: "Total karyawan",
    value: "48",
    change: "+3",
    trend: "up" as const,
    description: "bulan ini",
    icon: Users,
  },
  {
    title: "Sektor aktif",
    value: "3",
    change: "0",
    trend: "neutral" as const,
    description: "dari 3 total",
    icon: Building2,
  },
  {
    title: "Karyawan aktif",
    value: "45",
    change: "+2",
    trend: "up" as const,
    description: "bulan ini",
    icon: UserCheck,
  },
  {
    title: "Tidak aktif",
    value: "3",
    change: "+1",
    trend: "down" as const,
    description: "bulan ini",
    icon: UserX,
  },
];

const recentEmployees = [
  {
    name: "Ahmad Fauzi",
    role: "staff",
    sectors: ["Jasa", "Preloved"],
    joinDate: "5 Nov 2026",
    initials: "AF",
  },
  {
    name: "Siti Rahmawati",
    role: "manager",
    sectors: ["Agensi"],
    joinDate: "2 Nov 2026",
    initials: "SR",
  },
  {
    name: "Budi Santoso",
    role: "staff",
    sectors: ["Jasa"],
    joinDate: "28 Okt 2026",
    initials: "BS",
  },
  {
    name: "Diana Putri",
    role: "staff",
    sectors: ["Preloved", "Agensi"],
    joinDate: "25 Okt 2026",
    initials: "DP",
  },
  {
    name: "Eko Prasetyo",
    role: "staff",
    sectors: ["Jasa"],
    joinDate: "20 Okt 2026",
    initials: "EP",
  },
];

const sectorDistribution = [
  { name: "Jasa", count: 28, color: "bg-primary" },
  { name: "Agensi", count: 15, color: "bg-accent" },
  { name: "Preloved", count: 18, color: "bg-chart-2" },
];

const recentActivities = [
  {
    action: "menambahkan karyawan baru",
    target: "Ahmad Fauzi",
    actor: "Super Admin",
    time: "5 menit lalu",
  },
  {
    action: "mengubah sektor bisnis",
    target: "Diana Putri",
    actor: "Super Admin",
    time: "1 jam lalu",
  },
  {
    action: "menonaktifkan akun",
    target: "Rudi Hermawan",
    actor: "Manajer A",
    time: "3 jam lalu",
  },
  {
    action: "menambahkan sektor baru",
    target: "Preloved",
    actor: "Super Admin",
    time: "1 hari lalu",
  },
];

const roleBadgeVariant: Record<string, string> = {
  superadmin: "bg-red-100 text-red-700 border-red-200",
  manager: "bg-amber-100 text-amber-700 border-amber-200",
  staff: "bg-blue-100 text-blue-700 border-blue-200",
};

const roleLabel: Record<string, string> = {
  superadmin: "Super Admin",
  manager: "Manajer",
  staff: "Staf",
};

export default function DashboardPage() {
  const [financialRange, setFinancialRange] = useState("6");
  const totalDistribution = sectorDistribution.reduce(
    (sum, s) => sum + s.count,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan data karyawan dan sektor bisnis Tunas Bahasa
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    {stat.trend !== "neutral" && (
                      <span
                        className={`inline-flex items-center text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        )}
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Activity Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Financial Activity
            </CardTitle>
            <CardDescription>Pendapatan per sektor bisnis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                {financialRange === "12"
                  ? "1 tahun"
                  : `${financialRange} bulan`}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                {["1", "2", "3", "6", "12"].map((range) => (
                  <DropdownMenuItem
                    key={range}
                    onClick={() => setFinancialRange(range)}
                    className="justify-between"
                  >
                    {range === "12" ? "1 tahun" : `${range} bulan`}
                    {financialRange === range && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="text-xs">
              Lihat detail
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FinancialActivityChart range={financialRange} />
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent employees table */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Karyawan terbaru
              </CardTitle>
              <CardDescription>
                5 karyawan terakhir yang ditambahkan
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Lihat semua
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Sektor</th>
                    <th className="px-6 py-3 font-medium">Tanggal masuk</th>
                    <th className="px-6 py-3 font-medium sr-only">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmployees.map((emp) => (
                    <tr
                      key={emp.name}
                      className="border-t transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {emp.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {emp.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeVariant[emp.role]}`}
                        >
                          {roleLabel[emp.role]}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {emp.sectors.map((sector) => (
                            <Badge
                              key={sector}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {emp.joinDate}
                      </td>
                      <td className="px-6 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Sector distribution + Activity */}
        <div className="space-y-6">
          {/* Sector distribution */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Distribusi karyawan
              </CardTitle>
              <CardDescription>Per sektor bisnis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectorDistribution.map((sector) => {
                const percentage = Math.round(
                  (sector.count / totalDistribution) * 100,
                );
                return (
                  <div key={sector.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {sector.name}
                      </span>
                      <span className="text-muted-foreground">
                        {sector.count} orang ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${sector.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total penempatan</span>
                <span className="font-semibold text-foreground">
                  {totalDistribution}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Satu karyawan bisa ditempatkan di lebih dari satu sektor
              </p>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Aktivitas terkini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      {index < recentActivities.length - 1 && (
                        <div className="mt-1 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.actor}</span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
