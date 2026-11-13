"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
  BookOpen,
  Plane,
  ShoppingBag,
  FileText,
  CheckSquare,
  Tag,
  UserRound,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const turkiUpSubmenu: NavItem[] = [
  { name: "Overview", href: "/turkiup", icon: LayoutDashboard },
  { name: "Order & CRM", href: "/turkiup/orders", icon: ShoppingBag, children: [
    { name: "Semua Order", href: "/turkiup/orders", icon: ShoppingBag },
    { name: "Data Customer", href: "/turkiup/customers", icon: Users },
    { name: "Riwayat Progres", href: "/turkiup/orders/progress", icon: FileText },
  ] },
  { name: "Invoice", href: "/turkiup/invoices", icon: FileText },
  { name: "Monitoring Tugas", href: "/turkiup/operations", icon: CheckSquare },
  { name: "Keuangan", href: "/turkiup/finance", icon: Wallet, children: [
      { name: "Cost Order", href: "/turkiup/finance", icon: Receipt },
    { name: "Pembayaran Masuk", href: "/turkiup/finance/payments", icon: CreditCard },
    { name: "Pengeluaran", href: "/turkiup/finance/expenses", icon: Receipt },
    { name: "Laporan Profit", href: "/turkiup/finance/profit", icon: TrendingUp },
  ] },
  { name: "Data Staff", href: "/turkiup/staff", icon: Users },
  { name: "Katalog Jasa", href: "/turkiup/catalog", icon: Tag },
  { name: "Portal Staff", href: "/turkiup/staff-portal", icon: UserRound },
];

const navigation: NavGroup[] = [
  {
    label: "General",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Employee", href: "/employee", icon: Users },
      { name: "Payroll", href: "/payroll", icon: Wallet },
      { name: "Finance", href: "/finance", icon: TrendingUp },
    ],
  },
  {
    label: "Business Sector",
    items: [
      { name: "Tunas Bahasa", href: "/tunas-bahasa", icon: BookOpen },
      { name: "TurkiUp", href: "/turkiup", icon: Plane },
      { name: "Alkapreloved", href: "/alkapreloved", icon: ShoppingBag },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  embedded?: boolean;
}

export function Sidebar({ collapsed, onToggle, embedded = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        embedded ? "relative h-full w-full" : "fixed",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-3">
        <div className={cn(
          "shrink-0 rounded-lg bg-white p-1.5",
          collapsed ? "h-10 w-10" : "px-3 py-1.5"
        )}>
          <Image
            src="/logo.png"
            alt="Central Management"
            width={collapsed ? 28 : 140}
            height={collapsed ? 28 : 36}
            className={cn(
              "object-contain",
              collapsed ? "h-7 w-7" : "h-9 w-auto"
            )}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mb-1 mx-auto h-px w-6 bg-sidebar-border" />}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isTurkiUp = item.name === "TurkiUp";
                const isFinance = item.name === "Finance";
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : isTurkiUp
                    ? pathname.startsWith("/turkiup")
                    : isFinance
                      ? pathname.startsWith("/finance")
                      : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                    {!collapsed && isTurkiUp && <ChevronDown className="ml-auto h-4 w-4" />}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger render={linkContent} />
                      <TooltipContent side="right" sideOffset={8}>
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <div key={item.name}>
                    {linkContent}
                    {isTurkiUp && pathname.startsWith("/turkiup") && (
                      <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                        {turkiUpSubmenu.map((subItem) => {
                                                  const isSubActive = subItem.href === "/turkiup"
                            ? pathname === "/turkiup"
                                                                              : subItem.name === "Order & CRM"
                                                                                                                                                              ? pathname === "/turkiup/orders" || pathname.startsWith("/turkiup/orders/") || pathname.startsWith("/turkiup/customers")
                              : pathname.startsWith(subItem.href);
                                                  return (
                                                    <div key={subItem.name}>
                                                      <Link href={subItem.href} className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors", isSubActive ? "bg-sidebar-accent/70 font-medium text-sidebar-primary" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                                                        <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{subItem.name}</span>
                                                        {subItem.children && <ChevronDown className="ml-auto h-3 w-3" />}
                                                      </Link>
                                                      {subItem.children && isSubActive && <div className="ml-4 space-y-0.5 border-l border-sidebar-border pl-2">{subItem.children.map((child) => { const childActive = child.name === "Semua Order" ? pathname === "/turkiup/orders" : child.name === "Riwayat Progres" ? pathname === "/turkiup/orders/progress" : child.name === "Cost Order" ? pathname === "/turkiup/finance" : pathname === child.href || pathname.startsWith(`${child.href}/`); return <Link key={child.name} href={child.href} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors", childActive ? "bg-sidebar-accent/50 font-medium text-sidebar-primary" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><child.icon className="h-3 w-3 shrink-0" /><span className="truncate">{child.name}</span></Link>; })}</div>}
                                                    </div>
                                                  );
                                                })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
