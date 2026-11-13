"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronLeft, LayoutDashboard, LogOut, MessageSquare, PanelLeft, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const STAFF_SESSION_KEY = "turkiup_staff_session";

const links = [
  { label: "Beranda", href: "/turkiup/staff-portal", icon: LayoutDashboard },
  { label: "Tugas Saya", href: "/turkiup/staff-portal/tasks", icon: PanelLeft },
  { label: "Pesan & Komentar", href: "/turkiup/staff-portal/messages", icon: MessageSquare },
  { label: "Profil Saya", href: "/turkiup/staff-portal/profile", icon: UserRound },
];

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    if (pathname === "/turkiup/staff-portal/login") { setSessionReady(true); return; }
    if (typeof window === "undefined" || !window.sessionStorage.getItem(STAFF_SESSION_KEY)) { router.replace("/turkiup/staff-portal/login"); return; }
    setSessionReady(true);
  }, [pathname, router]);
  function signOut() { window.sessionStorage.removeItem(STAFF_SESSION_KEY); router.replace("/turkiup/staff-portal/login"); }
  if (pathname === "/turkiup/staff-portal/login") return <>{children}</>;
  if (!sessionReady) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Memuat portal staff...</div>;
  return <TooltipProvider><div className="min-h-screen bg-slate-50"><aside className={cn("fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all", collapsed ? "w-[72px]" : "w-64")}><div className="flex h-16 items-center justify-between border-b px-4"><div className="flex items-center gap-2 overflow-hidden"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#075985] font-bold text-white">TU</div>{!collapsed && <div><p className="text-sm font-semibold text-slate-900">TurkiUp</p><p className="text-[10px] text-slate-500">Portal Staff</p></div>}</div><Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0">{collapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button></div><nav className="flex-1 space-y-1 p-3">{links.map((link) => <a key={link.label} href={link.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", pathname === link.href ? "bg-sky-50 font-medium text-sky-700" : "text-slate-600 hover:bg-sky-50 hover:text-sky-700")}>{<link.icon className="h-4 w-4 shrink-0" />}{!collapsed && <span>{link.label}</span>}</a>)}</nav><div className="border-t p-3"><Button variant="ghost" onClick={() => void signOut()} className={cn("w-full justify-start gap-3 text-slate-600", collapsed && "justify-center px-0")}><LogOut className="h-4 w-4" />{!collapsed && "Keluar"}</Button></div></aside><div className={cn("transition-all", collapsed ? "pl-[72px]" : "pl-64")}><header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8"><div><p className="text-xs text-slate-500">Portal Staff</p><p className="font-medium text-slate-900">Workspace TurkiUp</p></div><Button variant="ghost" size="icon" aria-label="Notifikasi"><Bell className="h-5 w-5 text-slate-600" /></Button></header><main className="p-4 lg:p-8">{children}</main></div></div></TooltipProvider>;
}
