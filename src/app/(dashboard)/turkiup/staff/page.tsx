"use client";

import { useEffect, useState } from "react";
import { Search, UserRound, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
type StaffMember = {
  databaseId: string;
  name: string;
  initials: string;
  employeeCode: string;
  role: string;
  specialization: string;
  status: string;
  profileId?: string;
  nik?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  joinDate?: string;
  sectors: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankBranch?: string;
};

function formatEmployeeCode(code: string | null | undefined, createdAt: string, role: string, sequence: number) {
  if (code) return code;
  const date = new Date(createdAt);
  const division = role === "manager" || role === "superadmin" ? "MG" : "OP";
  return `BLB-${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}-${division}-${String(sequence).padStart(3, "0")}`;
}

function sortStaffByEmployeeCode(staff: StaffMember[]) {
  return [...staff].sort((a, b) => {
    const sequenceA = Number(a.employeeCode.match(/-(\d+)$/)?.[1] ?? Number.MAX_SAFE_INTEGER);
    const sequenceB = Number(b.employeeCode.match(/-(\d+)$/)?.[1] ?? Number.MAX_SAFE_INTEGER);
    return sequenceA - sequenceB || a.employeeCode.localeCompare(b.employeeCode);
  });
}

export default function TurkiUpStaffPage() {
  const [search, setSearch] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffRole, setStaffRole] = useState("");
  const [staffSpecialization, setStaffSpecialization] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStaff() {
      if (!isSupabaseConfigured) {
        setLoadError("Environment Supabase belum dikonfigurasi.");
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("cm_employees")
        .select("*, cm_user_sectors(sector_id, cm_business_sectors(name)), tu_staff_profiles(id, role, specialization)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setIsLoading(false);
        return;
      }
      const mapped = (data ?? []).map((row, index) => {
        const sectors = (row.cm_user_sectors ?? []).map((relation: { cm_business_sectors?: { name?: string } | null }) => relation.cm_business_sectors?.name).filter(Boolean) as string[];
        const turkiUpProfile = Array.isArray(row.tu_staff_profiles) ? row.tu_staff_profiles[0] : row.tu_staff_profiles;
        return {
          databaseId: row.id,
          name: row.nama_lengkap,
          initials: row.nama_lengkap.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(),
          employeeCode: formatEmployeeCode(row.employee_code, row.created_at, row.role, index + 1),
          role: turkiUpProfile?.role || "Belum ditentukan",
          specialization: turkiUpProfile?.specialization || "-",
          profileId: turkiUpProfile?.id,
          status: row.is_active ? "Aktif" : "Tidak aktif",
          nik: row.nik,
          email: row.email,
          whatsapp: row.no_wa,
          phone: row.no_tlp,
          birthPlace: row.tempat_lahir,
          birthDate: row.tanggal_lahir,
          gender: row.jenis_kelamin,
          address: row.alamat,
          joinDate: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.created_at)),
          sectors,
          bankName: row.nama_bank,
          accountNumber: row.nomor_rekening,
          accountHolder: row.nama_pemilik_rekening,
          bankBranch: row.cabang_bank,
        } satisfies StaffMember;
      });
      setStaffMembers(sortStaffByEmployeeCode(mapped.filter((staff) =>
        staff.sectors.some((sector) => sector.trim().toLowerCase() === "turkiup"),
      )));
      setIsLoading(false);
    }
    loadStaff();
    return () => { cancelled = true; };
  }, []);

  const filteredStaff = staffMembers.filter((staff) =>
    `${staff.name} ${staff.role} ${staff.specialization}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Operasional</p>
        <h1 className="text-2xl font-semibold tracking-tight">Data Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lihat data staff yang sama dengan Employee, lengkap dengan profil dan beban tugas tim TurkiUp.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-3 p-5"><UserRound className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Total Staff</p><p className="text-xl font-bold">{isLoading ? "-" : staffMembers.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><UserRound className="h-5 w-5 text-emerald-500" /><div><p className="text-xs text-muted-foreground">Staff Aktif</p><p className="text-xl font-bold">{isLoading ? "-" : staffMembers.filter((staff) => staff.status === "Aktif").length}</p></div></CardContent></Card>
      </div>

      {loadError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Gagal memuat data staff: {loadError}</p>}

            <Card>
              <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Direktori Staff TurkiUp</CardTitle><CardDescription>Data staff yang terlibat dalam operasional TurkiUp</CardDescription></div>
            <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau peran..." className="h-9 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Staff</th><th className="px-4 py-3 font-medium">Peran</th><th className="px-4 py-3 font-medium">Spesialisasi</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
              <tbody>{filteredStaff.map((staff) => <tr key={staff.databaseId} onClick={() => { setSelectedStaff(staff); setStaffRole(staff.role === "Belum ditentukan" ? "" : staff.role); setStaffSpecialization(staff.specialization === "-" ? "" : staff.specialization); setSaveMessage(null); }} className="cursor-pointer border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary">{staff.initials}</AvatarFallback></Avatar><span className="font-medium">{staff.name}</span></div></td><td className="px-4 py-4">{staff.role}</td><td className="px-4 py-4 text-muted-foreground">{staff.specialization}</td><td className="px-4 py-4"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{staff.status}</Badge></td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedStaff(null); }}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div><p className="text-xs font-medium text-primary">Data Staff · Employee</p><h2 className="mt-1 text-xl font-semibold">{selectedStaff.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedStaff.employeeCode}</p></div>
              <button type="button" onClick={() => setSelectedStaff(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Tutup detail staff"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 min-h-0 overflow-y-auto pr-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Peran & Spesialisasi TurkiUp</p>
                <p className="mt-1 text-xs text-muted-foreground">Atur profil operasional staff secara khusus untuk workspace TurkiUp.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium">Peran<select value={staffRole} onChange={(event) => setStaffRole(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"><option value="">Pilih peran</option><option>CEO</option><option>COO</option><option>Operasional</option><option>Tutor</option><option>Staff</option></select></label>
                  <label className="text-xs font-medium">Spesialisasi<input value={staffSpecialization} onChange={(event) => setStaffSpecialization(event.target.value)} placeholder="Contoh: Penerjemahan dokumen" className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" /></label>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{saveMessage}</span><Button size="sm" onClick={async () => { if (!selectedStaff || !staffRole || !staffSpecialization.trim()) { setSaveMessage("Peran dan spesialisasi wajib diisi."); return; } const payload = { employee_id: selectedStaff.databaseId, role: staffRole, specialization: staffSpecialization.trim(), updated_at: new Date().toISOString() }; const result = selectedStaff.profileId ? await supabase.from("tu_staff_profiles").update(payload).eq("id", selectedStaff.profileId) : await supabase.from("tu_staff_profiles").upsert(payload, { onConflict: "employee_id" }); if (result.error) { setSaveMessage(result.error.message); return; } const updated = { ...selectedStaff, role: staffRole, specialization: staffSpecialization.trim() }; setSelectedStaff(updated); setStaffMembers((current) => current.map((staff) => staff.databaseId === updated.databaseId ? updated : staff)); setSaveMessage("Profil TurkiUp berhasil disimpan."); }}><Save className="h-4 w-4" /> Simpan Profil</Button></div>
              </div>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["Nama lengkap", selectedStaff.name], ["ID karyawan", selectedStaff.employeeCode], ["NIK", selectedStaff.nik], ["Email", selectedStaff.email],
                  ["Nomor WhatsApp", selectedStaff.whatsapp], ["Nomor telepon", selectedStaff.phone], ["Tempat lahir", selectedStaff.birthPlace], ["Tanggal lahir", selectedStaff.birthDate],
                  ["Jenis kelamin", selectedStaff.gender], ["Role", selectedStaff.role], ["Status", selectedStaff.status], ["Tanggal bergabung", selectedStaff.joinDate],
                  ["Business sector", selectedStaff.sectors.join(", ") || "-"], ["Alamat", selectedStaff.address], ["Nama bank", selectedStaff.bankName], ["Nomor rekening", selectedStaff.accountNumber],
                  ["Nama pemilik rekening", selectedStaff.accountHolder], ["Cabang bank", selectedStaff.bankBranch],
                ].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value || "-"}</p></div>)}
              </div>
            </div>
            <div className="mt-5 flex justify-end border-t border-border pt-4"><button type="button" onClick={() => setSelectedStaff(null)} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Tutup</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
