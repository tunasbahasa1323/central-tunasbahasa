"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0 bg-sidebar border-sidebar-border">
            <Sidebar
              collapsed={false}
              embedded
              onToggle={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div
          className={cn(
            "flex flex-col transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-60"
          )}
        >
          <Header onMobileMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
