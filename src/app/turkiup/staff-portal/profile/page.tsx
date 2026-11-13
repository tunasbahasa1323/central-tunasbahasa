"use client";

import { useEffect, useState } from "react";
import { Camera, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const STAFF_SESSION_KEY = "turkiup_staff_session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured) { setLoadError("Environment Supabase belum dikonfigurasi."); setLoading(false); return; }
      const storedSession = window.sessionStorage.getItem(STAFF_SESSION_KEY);
      const session = storedSession ? JSON.parse(storedSession) as { id?: string; email?: string } : null;
      if (!session?.id && !session?.email) { setLoadError("Sesi staff tidak ditemukan."); setLoading(false); return; }
      const result = await supabase.from("cm_employees").select("*, cm_user_sectors(sector_id, cm_business_sectors(name)), tu_staff_profiles(id, role, specialization)").match(session.id ? { id: session.id } : { email: session.email }).limit(1).maybeSingle();
      if (result.error) { setLoadError(result.error.message); setLoading(false); return; }
      if (!result.data) { setLoadError("Data staff tidak ditemukan."); setLoading(false); return; }
      const row: any = result.data;
      const profile = Array.isArray(row.tu_staff_profiles) ? row.tu_staff_profiles[0] : row.tu_staff_profiles;
      setProfilePhoto(row.foto_profil ?? row.profile_photo_url ?? ""); setName(row.nama_lengkap ?? ""); setEmail(row.email ?? ""); setPhone(row.no_wa ?? row.no_tlp ?? ""); setEmployeeCode(row.employee_code ?? "-"); setRole(profile?.role ?? "Belum ditentukan"); setSpecialization(profile?.specialization ?? "-"); setStatus(row.is_active ? "Aktif" : "Tidak aktif"); setJoinDate(row.created_at ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.created_at)) : "-"); setBio(profile?.specialization ?? ""); setBankName(row.nama_bank ?? "-"); setAccountNumber(row.nomor_rekening ?? "-"); setAccountHolder(row.nama_pemilik_rekening ?? "-"); setBankBranch(row.cabang_bank ?? "-"); setLoading(false);
    }
    void loadProfile();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {loadError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Gagal memuat data staff: {loadError}</div>}
      {loading && <div className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-500">Memuat data staff...</div>}
      <div>
        <p className="text-sm font-medium text-sky-700">Workspace TurkiUp</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Profil Saya</h1>
        <p className="mt-2 text-sm text-slate-500">Kelola informasi profil dan preferensi akun staff Anda.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative"><div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-cyan-200 text-3xl font-semibold text-sky-700">{profilePhoto ? <img src={profilePhoto} alt={`Foto ${name}`} className="h-full w-full object-cover" /> : name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "-"}</div><label aria-label="Ubah foto profil" className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-sky-700 text-white shadow-sm hover:bg-sky-800">{uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploadingPhoto} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploadingPhoto(true); setLoadError(""); const formData = new FormData(); formData.append("file", file); const upload = await fetch("/api/cloudinary/profile", { method: "POST", body: formData }); const payload = await upload.json(); if (!upload.ok) setLoadError(payload.error ?? "Upload foto profil gagal."); else { setProfilePhoto(payload.secureUrl); const storedSession = window.sessionStorage.getItem(STAFF_SESSION_KEY); const session = storedSession ? JSON.parse(storedSession) as { id?: string } : null; if (session?.id) await supabase.from("cm_employees").update({ foto_profil: payload.secureUrl }).eq("id", session.id); } setUploadingPhoto(false); event.target.value = ""; }} /></label></div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{name || "-"}</h2>
                        <p className="mt-1 text-sm text-slate-500">{role || "-"}</p>
                        <Badge className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />{status || "-"}</Badge>
            <div className="mt-6 w-full space-y-3 border-t pt-5 text-left text-sm"><div className="flex items-center gap-3 text-slate-600"><Mail className="h-4 w-4 text-sky-600" /><span className="truncate">{email || "-"}</span></div><div className="flex items-center gap-3 text-slate-600"><Phone className="h-4 w-4 text-sky-600" /><span>{phone || "-"}</span></div></div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Informasi Staff</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium text-slate-700">Nama lengkap<input value={name} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">ID karyawan<input value={employeeCode} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Email<input value={email} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Nomor telepon<input value={phone} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Peran TurkiUp<input value={role} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Spesialisasi<input value={specialization} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Status<input value={status} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Tanggal bergabung<input value={joinDate} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Nama bank<input value={bankName} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Nomor rekening<input value={accountNumber} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Nama pemilik rekening<input value={accountHolder} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700">Cabang bank<input value={bankBranch} readOnly className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm font-normal" /></label><label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">Spesialisasi / catatan kerja<textarea rows={3} value={bio} readOnly className="w-full resize-none rounded-md border bg-slate-50 px-3 py-2 text-sm font-normal" /></label></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-sky-600" />Keamanan Akun</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-slate-900">Password</p><p className="mt-1 text-xs text-slate-500">Kelola keamanan akun melalui administrator.</p></div></CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
