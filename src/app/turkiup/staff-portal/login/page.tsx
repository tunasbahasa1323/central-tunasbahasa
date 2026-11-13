"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const STAFF_SESSION_KEY = "turkiup_staff_session";

export default function StaffPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured) { setError("Environment Supabase belum dikonfigurasi."); return; }
    setLoading(true);
    const staffResult = await supabase
      .from("cm_employees")
      .select("id, nama_lengkap, email, is_active")
      .ilike("email", email.trim())
      .maybeSingle();
    if (staffResult.error) { setError("Data staff tidak dapat diperiksa. Coba lagi."); setLoading(false); return; }
    if (!staffResult.data) { setError("Email ini belum terdaftar pada Data Staff TurkiUp."); setLoading(false); return; }
    if (!staffResult.data.is_active) { setError("Akun staff ini tidak aktif. Hubungi administrator."); setLoading(false); return; }

    const employeeResult = await supabase
      .from("cm_employees")
      .select("id, nama_lengkap, email, is_active")
      .eq("id", staffResult.data.id)
      .eq("is_active", true)
      .maybeSingle();
    if (employeeResult.error || !employeeResult.data) { setError("Akun ini belum terdaftar sebagai staff aktif."); setLoading(false); return; }

    const sectorResult = await supabase
      .from("cm_user_sectors")
      .select("cm_business_sectors(name)")
      .eq("user_id", employeeResult.data.id);
    const hasTurkiUpAccess = (sectorResult.data ?? []).some((item: any) => {
      const sector = Array.isArray(item.cm_business_sectors) ? item.cm_business_sectors[0] : item.cm_business_sectors;
      return sector?.name?.toLowerCase() === "turkiup";
    });
    if (sectorResult.error || !hasTurkiUpAccess) { setError("Akun staff ini tidak memiliki akses ke Portal TurkiUp."); setLoading(false); return; }

    window.sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify({ id: employeeResult.data.id, name: employeeResult.data.nama_lengkap, email: employeeResult.data.email }));
    router.replace("/turkiup/staff-portal");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#061b35] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(14,116,144,0.35),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(3,105,161,0.3),transparent_34%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-gradient-to-br from-[#075985] via-[#0e7490] to-[#164e63] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 font-bold">TU</div><div><p className="font-semibold">TurkiUp</p><p className="text-xs text-cyan-100">Portal Staff</p></div></div><div className="mt-24 max-w-md"><p className="text-sm font-medium text-cyan-100">Workspace operasional</p><h1 className="mt-3 text-4xl font-semibold leading-tight">Kerjakan tugas dengan lebih terarah.</h1><p className="mt-5 text-sm leading-6 text-sky-100">Akses tugas, progres, dan komunikasi pekerjaan TurkiUp dari satu ruang kerja.</p></div></div><div className="flex items-center gap-2 text-xs text-cyan-100"><ShieldCheck className="h-4 w-4" />Akses aman untuk staff TurkiUp</div></section>
        <section className="p-6 sm:p-10 lg:p-14"><div className="mx-auto max-w-md"><div className="mb-10 lg:hidden"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#075985] font-bold text-white">TU</div><p className="text-sm font-semibold text-slate-900">TurkiUp · Portal Staff</p></div><p className="text-sm font-medium text-sky-700">Selamat datang</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Masuk ke portal staff</h2><p className="mt-3 text-sm leading-6 text-slate-500">Gunakan akun staff TurkiUp untuk melanjutkan pekerjaan Anda.</p><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block space-y-2 text-sm font-medium text-slate-700">Email staff<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@perusahaan.com" className="h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" /></div></label><label className="block space-y-2 text-sm font-medium text-slate-700">Password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" className="h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>{error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}<Button type="submit" disabled={loading} className="h-11 w-full bg-[#075985] hover:bg-[#064e73]">{loading ? "Memproses..." : <>Masuk ke Portal <ArrowRight className="ml-2 h-4 w-4" /></>}</Button></form><p className="mt-8 text-center text-xs text-slate-400">Jika mengalami kendala akses, hubungi administrator.</p><Link href="/" className="mt-5 block text-center text-xs font-medium text-sky-700 hover:underline">Kembali ke halaman utama</Link></div></section>
      </div>
    </main>
  );
}
