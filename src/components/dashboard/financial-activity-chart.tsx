"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Jan 25", tunasBahasa: 12800, turkiUp: 7600, alkapreloved: 5600 },
  { month: "Feb 25", tunasBahasa: 13400, turkiUp: 8100, alkapreloved: 5900 },
  { month: "Mar 25", tunasBahasa: 14100, turkiUp: 8500, alkapreloved: 6200 },
  { month: "Apr 25", tunasBahasa: 13800, turkiUp: 8800, alkapreloved: 6500 },
  { month: "Mei 25", tunasBahasa: 14900, turkiUp: 9100, alkapreloved: 6800 },
  { month: "Jun 25", tunasBahasa: 15300, turkiUp: 9400, alkapreloved: 7100 },
  { month: "Jul 25", tunasBahasa: 15800, turkiUp: 9700, alkapreloved: 7300 },
  { month: "Aug 25", tunasBahasa: 16100, turkiUp: 10100, alkapreloved: 7500 },
  { month: "Sep 25", tunasBahasa: 16800, turkiUp: 10500, alkapreloved: 7800 },
  { month: "Okt 25", tunasBahasa: 17100, turkiUp: 10800, alkapreloved: 8000 },
  { month: "Nov 25", tunasBahasa: 17800, turkiUp: 11200, alkapreloved: 8200 },
  { month: "Des 25", tunasBahasa: 18500, turkiUp: 11800, alkapreloved: 8600 },
  { month: "Des", tunasBahasa: 16200, turkiUp: 9800, alkapreloved: 7200 },
  { month: "Jan", tunasBahasa: 17400, turkiUp: 10600, alkapreloved: 7600 },
  { month: "Feb", tunasBahasa: 18100, turkiUp: 11400, alkapreloved: 8100 },
  { month: "Mar", tunasBahasa: 17600, turkiUp: 11800, alkapreloved: 7900 },
  { month: "Apr", tunasBahasa: 19200, turkiUp: 12100, alkapreloved: 8300 },
  { month: "Mei", tunasBahasa: 18500, turkiUp: 12200, alkapreloved: 8400 },
  { month: "Jun", tunasBahasa: 21000, turkiUp: 14800, alkapreloved: 9100 },
  { month: "Jul", tunasBahasa: 19800, turkiUp: 16500, alkapreloved: 11200 },
  { month: "Aug", tunasBahasa: 24300, turkiUp: 15200, alkapreloved: 13800 },
  { month: "Sep", tunasBahasa: 27100, turkiUp: 19400, alkapreloved: 14500 },
  { month: "Okt", tunasBahasa: 29800, turkiUp: 22100, alkapreloved: 16200 },
  { month: "Nov", tunasBahasa: 32400, turkiUp: 24600, alkapreloved: 18100 },
];

const lines = [
  { dataKey: "tunasBahasa", name: "Tunas Bahasa", color: "#3b82f6" },
  { dataKey: "turkiUp", name: "TurkiUp", color: "#10b981" },
  { dataKey: "alkapreloved", name: "Alkapreloved", color: "#f59e0b" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value * 1000);
}

function formatFullCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value * 1000);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label} 2026
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FinancialActivityChart({ range }: { range: string }) {
  const visibleData = useMemo(() => {
    const count = Number(range);
    return monthlyData.slice(-count);
  }, [range]);
  const totals = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        total: visibleData.reduce(
          (sum, item) => sum + Number(item[line.dataKey as keyof typeof item]),
          0
        ),
      })),
    [visibleData]
  );
  const totalRevenue = totals.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
      <div className="space-y-4 lg:pt-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total revenue</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatFullCurrency(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">+12,8% dari periode sebelumnya</p>
        </div>
        <div className="space-y-3">
          {totals.map((sector) => (
            <div key={sector.dataKey} className="border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {sector.name}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatFullCurrency(sector.total)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {Math.round((sector.total / totalRevenue) * 100)}% dari total
              </p>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={visibleData}
        margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCurrency(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: line.color, strokeWidth: 2, stroke: "#fff" }}
          />
        ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
