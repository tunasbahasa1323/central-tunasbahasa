"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const employees = [
  {
    name: "Ahmad Fauzi",
    id: "EMP-024",
    role: "Staff",
    sectors: ["Tunas Bahasa", "TurkiUp"],
    status: "Aktif",
    joinDate: "05 Nov 2026",
    initials: "AF",
  },
  {
    name: "Siti Rahmawati",
    id: "EMP-023",
    role: "Manager",
    sectors: ["TurkiUp"],
    status: "Aktif",
    joinDate: "02 Nov 2026",
    initials: "SR",
  },
  {
    name: "Budi Santoso",
    id: "EMP-022",
    role: "Staff",
    sectors: ["Tunas Bahasa"],
    status: "Aktif",
    joinDate: "28 Okt 2026",
    initials: "BS",
  },
  {
    name: "Diana Putri",
    id: "EMP-021",
    role: "Staff",
    sectors: ["Alkapreloved", "Tunas Bahasa", "TurkiUp"],
    status: "Aktif",
    joinDate: "25 Okt 2026",
    initials: "DP",
  },
  {
    name: "Eko Prasetyo",
    id: "EMP-020",
    role: "Staff",
    sectors: ["Tunas Bahasa"],
    status: "Tidak aktif",
    joinDate: "20 Okt 2026",
    initials: "EP",
  },
  {
    name: "Fajar Nugraha",
    id: "EMP-019",
    role: "Staff",
    sectors: ["TurkiUp"],
    status: "Aktif",
    joinDate: "15 Okt 2026",
    initials: "FN",
  },
  {
    name: "Gita Lestari",
    id: "EMP-018",
    role: "Manager",
    sectors: ["Alkapreloved"],
    status: "Aktif",
    joinDate: "10 Okt 2026",
    initials: "GL",
  },
];

const roleStyles: Record<string, string> = {
  Staff: "bg-blue-100 text-blue-700 border-blue-200",
  Manager: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function EmployeePage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Semua role");
  const [sector, setSector] = useState("Semua sektor");
  const [status, setStatus] = useState("Semua status");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employeeFormStep, setEmployeeFormStep] = useState<1 | 2>(1);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return employees.filter((employee) => {
      const matchesQuery =
        !normalizedQuery ||
        [employee.name, employee.id, ...employee.sectors].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesSector =
        sector === "Semua sektor" || employee.sectors.includes(sector);
      return (
        matchesQuery &&
        (role === "Semua role" || employee.role === role) &&
        matchesSector &&
        (status === "Semua status" || employee.status === status)
      );
    });
  }, [query, role, sector, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            People directory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data karyawan dan penempatan sektor bisnis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => { setEmployeeFormStep(1); setIsAddEmployeeOpen(true); }}>
            <Plus className="h-4 w-4" /> Tambah karyawan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total karyawan</p>
              <p className="text-xl font-bold">48</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Karyawan aktif</p>
              <p className="text-xl font-bold">45</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <SlidersHorizontal className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sektor terisi</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama, ID, atau sektor..."
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterMenu
                label={role}
                options={["Semua role", "Staff", "Manager"]}
                onChange={setRole}
              />
              <FilterMenu
                label={sector}
                options={[
                  "Semua sektor",
                  "Tunas Bahasa",
                  "TurkiUp",
                  "Alkapreloved",
                ]}
                onChange={setSector}
              />
              <FilterMenu
                label={status}
                options={["Semua status", "Aktif", "Tidak aktif"]}
                onChange={setStatus}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Karyawan</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Sektor bisnis</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Tanggal masuk</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleStyles[employee.role]}`}
                      >
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="group relative flex w-fit items-center gap-1.5"
                        title={employee.sectors.join(", ")}
                      >
                        <Badge variant="secondary" className="font-normal">
                          {employee.sectors[0]}
                        </Badge>
                        {employee.sectors.length > 1 && (
                          <>
                            <span className="text-xs font-medium text-muted-foreground">
                              +{employee.sectors.length - 1}
                            </span>
                            <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 min-w-36 rounded-lg border border-border bg-popover p-2.5 text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                              <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                                Sektor bisnis
                              </p>
                              <div className="flex flex-col gap-1">
                                {employee.sectors.map((item) => (
                                  <span key={item} className="text-xs">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${employee.status === "Aktif" ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${employee.status === "Aktif" ? "bg-emerald-500" : "bg-muted-foreground"}`}
                        />
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {employee.joinDate}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Aksi untuk ${employee.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEmployees.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                Tidak ada karyawan yang cocok dengan filter.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
            <span>Menampilkan {filteredEmployees.length} dari 48 karyawan</span>
            <span>Halaman 1 dari 5</span>
          </div>
        </CardContent>
      </Card>
      {isAddEmployeeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-employee-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setIsAddEmployeeOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 id="add-employee-title" className="text-lg font-semibold">
                  {employeeFormStep === 1 ? "Tambah karyawan" : "Data nomor rekening"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Langkah {employeeFormStep} dari 2 · {employeeFormStep === 1 ? "Data pribadi dan penempatan sektor" : "Informasi rekening untuk kebutuhan payroll"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsAddEmployeeOpen(false)}
                aria-label="Tutup popup"
              >
                ×
              </Button>
            </div>
            <form
              className="mt-5 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setIsAddEmployeeOpen(false);
              }}
            >
              {employeeFormStep === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Nama lengkap"
                  name="nama_lengkap"
                  placeholder="Contoh: Ahmad Fauzi"
                />
                <FormField
                  label="NIK"
                  name="nik"
                  placeholder="Masukkan NIK"
                />
                <FormField label="Email" name="email" type="email" placeholder="nama@contoh.com" />
                <FormField label="Nomor WhatsApp" name="no_wa" placeholder="08xxxxxxxxxx" />
                <FormField label="Nomor telepon" name="no_tlp" placeholder="Nomor telepon" />
                <FormField label="Tempat lahir" name="tempat_lahir" placeholder="Contoh: Jakarta" />
                <FormField label="Tanggal lahir" name="tanggal_lahir" type="date" />
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-foreground">Jenis kelamin</span>
                  <select name="jenis_kelamin" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                    <option value="">Pilih jenis kelamin</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-foreground">Role</span>
                  <select name="role" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                    <option>Staff</option>
                    <option>Manager</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-foreground">Alamat</span>
                  <textarea name="alamat" required rows={3} placeholder="Masukkan alamat lengkap" className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
                </label>
                <fieldset className="space-y-2 sm:col-span-2">
                  <legend className="text-sm font-medium text-foreground">
                    Business sector
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {["Tunas Bahasa", "TurkiUp", "Alkapreloved"].map(
                      (sector) => (
                        <label
                          key={sector}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            name="business-sector"
                            value={sector}
                            defaultChecked={sector === "Tunas Bahasa"}
                            className="h-4 w-4 accent-primary"
                          />{" "}
                          <span>{sector}</span>
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
              </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Nama bank" name="nama_bank" placeholder="Contoh: Bank BCA" />
                    <FormField label="Nomor rekening" name="nomor_rekening" placeholder="Masukkan nomor rekening" />
                    <FormField label="Nama pemilik rekening" name="nama_pemilik_rekening" placeholder="Sesuai buku rekening" />
                    <FormField label="Cabang bank" name="cabang_bank" placeholder="Opsional" required={false} />
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Pastikan nomor rekening dan nama pemilik sudah sesuai untuk proses payroll.
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                {employeeFormStep === 2 && <Button type="button" variant="outline" onClick={() => setEmployeeFormStep(1)}>Kembali</Button>}
                <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Batal</Button>
                {employeeFormStep === 1 ? <Button type="button" onClick={() => setEmployeeFormStep(2)}>Lanjut ke data rekening</Button> : <Button type="submit">Simpan karyawan</Button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        required={required}
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function FilterMenu({
  label,
  options,
  onChange,
}: {
  label: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
