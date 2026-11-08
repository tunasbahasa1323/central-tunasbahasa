"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  TrendingUp,
  BookOpen,
  Plane,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
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
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
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

                return <div key={item.name}>{linkContent}</div>;
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
