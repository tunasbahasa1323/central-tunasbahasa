"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  MoreHorizontal,
  Eye,
  KeyRound,
  Pencil,
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

type Employee = {
  name: string;
  id: string;
  databaseId?: string;
  role: string;
  sectors: string[];
  status: string;
  joinDate: string;
  initials: string;
  nik?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankBranch?: string;
};

const roleStyles: Record<string, string> = {
  Staff: "bg-blue-100 text-blue-700 border-blue-200",
  Manager: "bg-amber-100 text-amber-700 border-amber-200",
  "Super Admin": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function sortEmployeesByCode(rows: Employee[]) {
  return [...rows].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

function formatEmployeeCode(
  storedCode: string | null | undefined,
  createdAt: string,
  databaseRole: string,
  fallbackSequence: number,
) {
  const createdDate = new Date(createdAt);
  const expectedDivision = databaseRole === "superadmin" || databaseRole === "manager" ? "MG" : "OP";
  const storedMatch = storedCode?.match(/^BLB-(\d{6})-(MG|OP)-(\d{3})$/);
  if (storedMatch && storedMatch[2] === expectedDivision) return storedMatch[0];

  const yearMonth = `${createdDate.getUTCFullYear()}${String(createdDate.getUTCMonth() + 1).padStart(2, "0")}`;
  const divisionCode = expectedDivision;
  const storedSequence = storedCode?.match(/(\d+)$/)?.[1];
  const sequence = Number(storedSequence ?? fallbackSequence);

  return `BLB-${yearMonth}-${divisionCode}-${String(sequence).padStart(3, "0")}`;
}

export default function EmployeePage() {
  const [employeeRows, setEmployeeRows] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeeLoadError, setEmployeeLoadError] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Semua role");
  const [sector, setSector] = useState("Semua sektor");
  const [status, setStatus] = useState("Semua status");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employeeFormStep, setEmployeeFormStep] = useState<1 | 2>(1);
  const [employeeAction, setEmployeeAction] = useState<
    "view" | "reset" | "edit" | null
  >(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const employeeDraftRef = useRef(new FormData());
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [saveEmployeeMessage, setSaveEmployeeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadEmployees() {
      setIsLoadingEmployees(true);
      if (!isSupabaseConfigured) {
        setEmployeeLoadError(
          "Environment Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.",
        );
        setIsLoadingEmployees(false);
        return;
      }
      const { data, error } = await supabase
        .from("cm_employees")
        .select("*, cm_user_sectors(sector_id, cm_business_sectors(name))")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setEmployeeLoadError(error.message);
        setEmployeeRows([]);
        setIsLoadingEmployees(false);
        return;
      }
      const mapped = (data ?? []).map((row, index) => {
        const sectors = (row.cm_user_sectors ?? [])
          .map(
            (relation: { cm_business_sectors?: { name?: string } | null }) =>
              relation.cm_business_sectors?.name,
          )
          .filter(Boolean) as string[];
        return {
          name: row.nama_lengkap,
          id: formatEmployeeCode(
            row.employee_code,
            row.created_at,
            row.role,
            index + 1,
          ),
          databaseId: row.id,
          role:
            row.role === "superadmin"
              ? "Super Admin"
              : row.role === "manager"
                ? "Manager"
                : "Staff",
          sectors,
          status: row.is_active ? "Aktif" : "Tidak aktif",
          joinDate: new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(row.created_at)),
          initials: row.nama_lengkap
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          nik: row.nik,
          email: row.email,
          whatsapp: row.no_wa,
          phone: row.no_tlp,
          birthPlace: row.tempat_lahir,
          birthDate: row.tanggal_lahir,
          gender: row.jenis_kelamin,
          address: row.alamat,
          bankName: row.nama_bank,
          accountNumber: row.nomor_rekening,
          accountHolder: row.nama_pemilik_rekening,
          bankBranch: row.cabang_bank,
        } satisfies Employee;
      });
      setEmployeeRows(sortEmployeesByCode(mapped));
      setEmployeeLoadError(null);
      setIsLoadingEmployees(false);
    }
    void loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return employeeRows.filter((employee) => {
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
  }, [employeeRows, query, role, sector, status]);

  const pageSize = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize),
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [employeeRows, query, role, sector, status]);
  const visibleEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
          <Button
            size="sm"
            onClick={() => {
              setSaveEmployeeMessage(null);
              setEmployeeFormStep(1);
              setIsAddEmployeeOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Tambah karyawan
          </Button>
        </div>
      </div>

      {employeeLoadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Data karyawan dari Supabase belum dapat dimuat: {employeeLoadError}
        </p>
      )}
      {saveEmployeeMessage && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${saveEmployeeMessage.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {saveEmployeeMessage.text}
        </p>
      )}
      {isLoadingEmployees && (
        <p className="text-sm text-muted-foreground">
          Memuat data karyawan dari Supabase...
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total karyawan</p>
              <p className="text-xl font-bold">{employeeRows.length}</p>
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
              <p className="text-xl font-bold">
                {
                  employeeRows.filter((employee) => employee.status === "Aktif")
                    .length
                }
              </p>
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
                {visibleEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      {isLoadingEmployees
                        ? "Memuat data karyawan..."
                        : employeeLoadError
                          ? "Data karyawan belum tersedia dari Supabase."
                          : "Belum ada data karyawan"}
                    </td>
                  </tr>
                ) : (
                  visibleEmployees.map((employee) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                            aria-label={`Aksi untuk ${employee.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-44">
                            <DropdownMenuItem
                              onClick={() => {
                                    setSaveEmployeeMessage(null);
                                    setSelectedEmployee(employee);
                                    setEmployeeAction("view");
                                  }}
                            >
                              <Eye className="h-4 w-4" /> Lihat data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                    setSaveEmployeeMessage(null);
                                    setSelectedEmployee(employee);
                                    setEmployeeAction("edit");
                                  }}
                            >
                              <Pencil className="h-4 w-4" /> Edit karyawan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                    setSaveEmployeeMessage(null);
                                    setSelectedEmployee(employee);
                                    setEmployeeAction("reset");
                                  }}
                            >
                              <KeyRound className="h-4 w-4" /> Reset password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filteredEmployees.length === 0 &&
              !isLoadingEmployees &&
              employeeLoadError && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada data karyawan dari Supabase.
                </div>
              )}
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-6 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan {visibleEmployees.length} dari{" "}
              {filteredEmployees.length} karyawan
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Sebelumnya
              </Button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {employeeAction && selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEmployeeAction(null);
              setSelectedEmployee(null);
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <h2 className="shrink-0 text-lg font-semibold">
              {employeeAction === "view"
                ? "Data karyawan"
                : employeeAction === "edit"
                  ? "Edit karyawan"
                  : "Reset password"}
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              {employeeAction === "view" ? (
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <DetailItem
                    label="Nama lengkap"
                    value={selectedEmployee.name}
                  />
                  <DetailItem label="ID karyawan" value={selectedEmployee.id} />
                  <DetailItem label="NIK" value={selectedEmployee.nik} />
                  <DetailItem label="Email" value={selectedEmployee.email} />
                  <DetailItem
                    label="Nomor WhatsApp"
                    value={selectedEmployee.whatsapp}
                  />
                  <DetailItem
                    label="Nomor telepon"
                    value={selectedEmployee.phone}
                  />
                  <DetailItem
                    label="Tempat lahir"
                    value={selectedEmployee.birthPlace}
                  />
                  <DetailItem
                    label="Tanggal lahir"
                    value={selectedEmployee.birthDate}
                  />
                  <DetailItem
                    label="Jenis kelamin"
                    value={selectedEmployee.gender}
                  />
                  <DetailItem label="Role" value={selectedEmployee.role} />
                  <DetailItem label="Status" value={selectedEmployee.status} />
                  <DetailItem
                    label="Tanggal bergabung"
                    value={selectedEmployee.joinDate}
                  />
                  <DetailItem
                    label="Business sector"
                    value={selectedEmployee.sectors.join(", ")}
                  />
                  <DetailItem
                    label="Alamat"
                    value={selectedEmployee.address}
                    fullWidth
                  />
                  <div className="sm:col-span-2 border-t border-border pt-4">
                    <p className="mb-3 font-medium">Data rekening</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem
                        label="Nama bank"
                        value={selectedEmployee.bankName}
                      />
                      <DetailItem
                        label="Nomor rekening"
                        value={selectedEmployee.accountNumber}
                      />
                      <DetailItem
                        label="Nama pemilik rekening"
                        value={selectedEmployee.accountHolder}
                      />
                      <DetailItem
                        label="Cabang bank"
                        value={selectedEmployee.bankBranch}
                      />
                    </div>
                  </div>
                </div>
              ) : employeeAction === "edit" ? (
                <form
                  id="edit-employee-form"
                  className="mt-4 grid gap-4 text-sm sm:grid-cols-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setSaveEmployeeMessage(null);
                    if (!isSupabaseConfigured || !selectedEmployee.databaseId) {
                      setSaveEmployeeMessage({
                        type: "error",
                        text: "Data karyawan tidak memiliki ID database yang valid.",
                      });
                      return;
                    }

                    const formData = new FormData(event.currentTarget);
                    const roleValue = String(formData.get("role") ?? "Staff");
                    const sectorNames = formData
                      .getAll("business-sector")
                      .map(String);
                    const nextDivision = roleValue === "Super Admin" || roleValue === "Manager" ? "MG" : "OP";
                    const currentCodeMatch = selectedEmployee.id.match(/^BLB-(\d{6})-(MG|OP)-(\d{3})$/);
                    const yearMonth = currentCodeMatch?.[1] ?? `${new Date().getUTCFullYear()}${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
                    const { data: existingCodes, error: codeError } = await supabase
                      .from("cm_employees")
                      .select("employee_code")
                      .neq("id", selectedEmployee.databaseId);
                    if (codeError) {
                      setSaveEmployeeMessage({ type: "error", text: codeError.message });
                      return;
                    }
                    const usedSequences = new Set(
                      (existingCodes ?? [])
                        .map((row) => String(row.employee_code).match(new RegExp(`^BLB-${yearMonth}-${nextDivision}-(\\d{3})$`))?.[1])
                        .filter(Boolean),
                    );
                    let nextSequence = 1;
                    while (usedSequences.has(String(nextSequence).padStart(3, "0"))) nextSequence += 1;
                    const nextEmployeeCode = `BLB-${yearMonth}-${nextDivision}-${String(nextSequence).padStart(3, "0")}`;
                    const updates = {
                      employee_code: nextEmployeeCode,
                      nama_lengkap: String(
                        formData.get("nama_lengkap") ?? "",
                      ).trim(),
                      nik: String(formData.get("nik") ?? "").trim(),
                      email: String(formData.get("email") ?? "").trim() || null,
                      no_wa: String(formData.get("no_wa") ?? "") || null,
                      no_tlp: String(formData.get("no_tlp") ?? "") || null,
                      tempat_lahir:
                        String(formData.get("tempat_lahir") ?? "") || null,
                      tanggal_lahir:
                        String(formData.get("tanggal_lahir") ?? "") || null,
                      jenis_kelamin:
                        String(formData.get("jenis_kelamin") ?? "") || null,
                      alamat: String(formData.get("alamat") ?? "") || null,
                      role:
                        roleValue === "Super Admin"
                          ? "superadmin"
                          : roleValue === "Manager"
                            ? "manager"
                            : "staff",
                      nama_bank:
                        String(formData.get("nama_bank") ?? "") || null,
                      nomor_rekening:
                        String(formData.get("nomor_rekening") ?? "") || null,
                      nama_pemilik_rekening:
                        String(formData.get("nama_pemilik_rekening") ?? "") ||
                        null,
                      cabang_bank:
                        String(formData.get("cabang_bank") ?? "") || null,
                    };

                    setIsSavingEmployee(true);
                    const { error: employeeError } = await supabase
                      .from("cm_employees")
                      .update(updates)
                      .eq("id", selectedEmployee.databaseId);
                    if (employeeError) {
                      setSaveEmployeeMessage({
                        type: "error",
                        text: employeeError.message,
                      });
                      setIsSavingEmployee(false);
                      return;
                    }

                    const { data: sectors, error: sectorError } = await supabase
                      .from("cm_business_sectors")
                      .select("id, name")
                      .in("name", sectorNames);
                    if (sectorError) {
                      setSaveEmployeeMessage({
                        type: "error",
                        text: sectorError.message,
                      });
                      setIsSavingEmployee(false);
                      return;
                    }

                    const { error: deleteSectorError } = await supabase
                      .from("cm_user_sectors")
                      .delete()
                      .eq("user_id", selectedEmployee.databaseId);
                    if (deleteSectorError) {
                      setSaveEmployeeMessage({
                        type: "error",
                        text: deleteSectorError.message,
                      });
                      setIsSavingEmployee(false);
                      return;
                    }

                    if (sectors?.length) {
                      const { error: relationError } = await supabase
                        .from("cm_user_sectors")
                        .insert(
                          sectors.map((sectorRow) => ({
                            user_id: selectedEmployee.databaseId,
                            sector_id: sectorRow.id,
                          })),
                        );
                      if (relationError) {
                        setSaveEmployeeMessage({
                          type: "error",
                          text: relationError.message,
                        });
                        setIsSavingEmployee(false);
                        return;
                      }
                    }

                    const nextEmployee: Employee = {
                      ...selectedEmployee,
                      name: updates.nama_lengkap,
                      id: nextEmployeeCode || selectedEmployee.id,
                      role: roleValue,
                      sectors: sectorNames,
                      nik: updates.nik,
                      email: updates.email ?? undefined,
                      whatsapp: updates.no_wa ?? undefined,
                      phone: updates.no_tlp ?? undefined,
                      birthPlace: updates.tempat_lahir ?? undefined,
                      birthDate: updates.tanggal_lahir ?? undefined,
                      gender: updates.jenis_kelamin ?? undefined,
                      address: updates.alamat ?? undefined,
                      bankName: updates.nama_bank ?? undefined,
                      accountNumber: updates.nomor_rekening ?? undefined,
                      accountHolder: updates.nama_pemilik_rekening ?? undefined,
                      bankBranch: updates.cabang_bank ?? undefined,
                    };
                    setEmployeeRows((rows) =>
                      sortEmployeesByCode(
                        rows.map((row) =>
                          row.databaseId === selectedEmployee.databaseId
                            ? nextEmployee
                            : row,
                        ),
                      ),
                    );
                    setSaveEmployeeMessage({
                      type: "success",
                      text: "Perubahan karyawan berhasil disimpan",
                    });
                    setIsSavingEmployee(false);
                    setEmployeeAction(null);
                    setSelectedEmployee(null);
                  }}
                >
                  <FormField
                    label="Nama lengkap"
                    name="nama_lengkap"
                    defaultValue={selectedEmployee.name}
                  />
                  <FormField
                    label="NIK"
                    name="nik"
                    defaultValue={selectedEmployee.nik}
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={selectedEmployee.email}
                  />
                  <FormField
                    label="Nomor WhatsApp"
                    name="no_wa"
                    defaultValue={selectedEmployee.whatsapp}
                  />
                  <FormField
                    label="Nomor telepon"
                    name="no_tlp"
                    defaultValue={selectedEmployee.phone}
                  />
                  <FormField
                    label="Tempat lahir"
                    name="tempat_lahir"
                    defaultValue={selectedEmployee.birthPlace}
                  />
                  <FormField
                    label="Tanggal lahir"
                    name="tanggal_lahir"
                    type="date"
                    defaultValue={toDateInputValue(selectedEmployee.birthDate)}
                  />
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-foreground">
                      Jenis kelamin
                    </span>
                    <select
                      name="jenis_kelamin"
                      defaultValue={selectedEmployee.gender}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-foreground">Role</span>
                    <select
                      name="role"
                      defaultValue={selectedEmployee.role}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option>Staff</option>
                      <option>Manager</option>
                      <option>Super Admin</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-foreground">Alamat</span>
                    <textarea
                      name="alamat"
                      defaultValue={selectedEmployee.address}
                      rows={3}
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </label>
                  <fieldset className="space-y-2 sm:col-span-2">
                    <legend className="text-sm font-medium text-foreground">
                      Business sector
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {["Tunas Bahasa", "TurkiUp", "Alkapreloved"].map(
                        (businessSector) => (
                          <label
                            key={businessSector}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                          >
                            <input
                              type="checkbox"
                              name="business-sector"
                              value={businessSector}
                              defaultChecked={selectedEmployee.sectors.includes(
                                businessSector,
                              )}
                              className="h-4 w-4 accent-primary"
                            />
                            <span>{businessSector}</span>
                          </label>
                        ),
                      )}
                    </div>
                  </fieldset>
                  <div className="sm:col-span-2 border-t border-border pt-4">
                    <p className="mb-3 font-medium">Data rekening</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Nama bank"
                        name="nama_bank"
                        defaultValue={selectedEmployee.bankName}
                      />
                      <FormField
                        label="Nomor rekening"
                        name="nomor_rekening"
                        defaultValue={selectedEmployee.accountNumber}
                      />
                      <FormField
                        label="Nama pemilik rekening"
                        name="nama_pemilik_rekening"
                        defaultValue={selectedEmployee.accountHolder}
                      />
                      <FormField
                        label="Cabang bank"
                        name="cabang_bank"
                        required={false}
                        defaultValue={selectedEmployee.bankBranch}
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Password untuk {selectedEmployee.name} akan direset ke
                    password default.
                  </p>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Password default: <strong>Tuba2023</strong>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 shrink-0 border-t border-border pt-4">
              {saveEmployeeMessage && (
                <p
                  className={`mb-3 text-right text-xs ${saveEmployeeMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {saveEmployeeMessage.text}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmployeeAction(null);
                    setSelectedEmployee(null);
                    setSaveEmployeeMessage(null);
                  }}
                >
                  Tutup
                </Button>
                {employeeAction === "edit" && (
                  <Button
                    type="submit"
                    form="edit-employee-form"
                    disabled={isSavingEmployee}
                  >
                    <Pencil className="h-4 w-4" />{" "}
                    {isSavingEmployee ? "Menyimpan..." : "Simpan perubahan"}
                  </Button>
                )}
                {employeeAction === "reset" && (
                  <Button
                    onClick={() => {
                      setEmployeeAction(null);
                      setSelectedEmployee(null);
                    }}
                  >
                    Reset password
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {isAddEmployeeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-employee-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSaveEmployeeMessage(null);
              setIsAddEmployeeOpen(false);
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 id="add-employee-title" className="text-lg font-semibold">
                  {employeeFormStep === 1
                    ? "Tambah karyawan"
                    : "Data nomor rekening"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Langkah {employeeFormStep} dari 2 ·{" "}
                  {employeeFormStep === 1
                    ? "Data pribadi dan penempatan sektor"
                    : "Informasi rekening untuk kebutuhan payroll"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setSaveEmployeeMessage(null);
                  setIsAddEmployeeOpen(false);
                }}
                aria-label="Tutup popup"
              >
                ×
              </Button>
            </div>
            <form
              className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-2"
              onChange={(event) => {
                const target = event.target as unknown as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                if (target.name === "business-sector") {
                  const values = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[name="business-sector"]:checked')).map((input) => input.value);
                  employeeDraftRef.current.delete("business-sector");
                  values.forEach((value) => employeeDraftRef.current.append("business-sector", value));
                } else if (target.name) {
                  employeeDraftRef.current.set(target.name, target.value);
                }
              }}
              onSubmit={async (event) => {
                event.preventDefault();
                setSaveEmployeeMessage(null);
                if (!isSupabaseConfigured) {
                  setSaveEmployeeMessage({
                    type: "error",
                    text: "Supabase belum dikonfigurasi. Periksa file .env.local.",
                  });
                  return;
                }

                const formData = new FormData(event.currentTarget);
                for (const [key, value] of employeeDraftRef.current.entries()) {
                  if (key === "business-sector") continue;
                  formData.set(key, value);
                }
                formData.delete("business-sector");
                employeeDraftRef.current.getAll("business-sector").forEach((value) => formData.append("business-sector", value));
                const fullName = String(
                  formData.get("nama_lengkap") ?? "",
                ).trim();
                const nik = String(formData.get("nik") ?? "").trim();
                const email = String(formData.get("email") ?? "").trim();
                const roleValue = String(formData.get("role") ?? "Staff");
                const sectorNames = formData
                  .getAll("business-sector")
                  .map(String);
                const createdAt = new Date().toISOString();
                const employeeCode = `BLB-${createdAt.slice(0, 7).replace("-", "")}-${roleValue === "Manager" ? "MG" : "OP"}-001`;

                setIsSavingEmployee(true);
                const { data: insertedEmployee, error: employeeError } =
                  await supabase
                    .from("cm_employees")
                    .insert({
                      employee_code: employeeCode,
                      nama_lengkap: fullName,
                      nik,
                      email: email || null,
                      no_wa: String(formData.get("no_wa") ?? "") || null,
                      no_tlp: String(formData.get("no_tlp") ?? "") || null,
                      tempat_lahir:
                        String(formData.get("tempat_lahir") ?? "") || null,
                      tanggal_lahir:
                        String(formData.get("tanggal_lahir") ?? "") || null,
                      jenis_kelamin:
                        String(formData.get("jenis_kelamin") ?? "") || null,
                      alamat: String(formData.get("alamat") ?? "") || null,
                      role: roleValue === "Manager" ? "manager" : "staff",
                      nama_bank:
                        String(formData.get("nama_bank") ?? "") || null,
                      nomor_rekening:
                        String(formData.get("nomor_rekening") ?? "") || null,
                      nama_pemilik_rekening:
                        String(formData.get("nama_pemilik_rekening") ?? "") ||
                        null,
                      cabang_bank:
                        String(formData.get("cabang_bank") ?? "") || null,
                    })
                    .select("id")
                    .single();

                if (employeeError || !insertedEmployee) {
                  setSaveEmployeeMessage({
                    type: "error",
                    text:
                      employeeError?.message ?? "Data karyawan gagal disimpan.",
                  });
                  setIsSavingEmployee(false);
                  return;
                }

                const { data: sectors, error: sectorError } = await supabase
                  .from("cm_business_sectors")
                  .select("id, name")
                  .in("name", sectorNames);
                if (sectorError) {
                  setSaveEmployeeMessage({
                    type: "error",
                    text: sectorError.message,
                  });
                  setIsSavingEmployee(false);
                  return;
                }

                if (sectors?.length) {
                  const { error: relationError } = await supabase
                    .from("cm_user_sectors")
                    .insert(
                      sectors.map((sectorRow) => ({
                        user_id: insertedEmployee.id,
                        sector_id: sectorRow.id,
                      })),
                    );
                  if (relationError) {
                    setSaveEmployeeMessage({
                      type: "error",
                      text: relationError.message,
                    });
                    setIsSavingEmployee(false);
                    return;
                  }
                }

                const displayRole =
                  roleValue === "Manager" ? "Manager" : "Staff";
                setEmployeeRows((currentRows) => sortEmployeesByCode([
                  {
                    name: fullName,
                    id: employeeCode,
                    role: displayRole,
                    sectors: sectorNames,
                    status: "Aktif",
                    joinDate: new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(createdAt)),
                    initials: fullName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
                    nik,
                    email: email || undefined,
                    whatsapp: String(formData.get("no_wa") ?? "") || undefined,
                    phone: String(formData.get("no_tlp") ?? "") || undefined,
                    birthPlace:
                      String(formData.get("tempat_lahir") ?? "") || undefined,
                    birthDate:
                      String(formData.get("tanggal_lahir") ?? "") || undefined,
                    gender:
                      String(formData.get("jenis_kelamin") ?? "") || undefined,
                    address: String(formData.get("alamat") ?? "") || undefined,
                    bankName:
                      String(formData.get("nama_bank") ?? "") || undefined,
                    accountNumber:
                      String(formData.get("nomor_rekening") ?? "") || undefined,
                    accountHolder:
                      String(formData.get("nama_pemilik_rekening") ?? "") ||
                      undefined,
                    bankBranch:
                      String(formData.get("cabang_bank") ?? "") || undefined,
                  },
                  ...currentRows,
                ]));
                setSaveEmployeeMessage({
                  type: "success",
                  text: "Karyawan berhasil disimpan ke Database",
                });
                setIsSavingEmployee(false);
                setIsAddEmployeeOpen(false);
                setEmployeeFormStep(1);
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
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="nama@contoh.com"
                  />
                  <FormField
                    label="Nomor WhatsApp"
                    name="no_wa"
                    placeholder="08xxxxxxxxxx"
                  />
                  <FormField
                    label="Nomor telepon"
                    name="no_tlp"
                    placeholder="Nomor telepon"
                  />
                  <FormField
                    label="Tempat lahir"
                    name="tempat_lahir"
                    placeholder="Contoh: Jakarta"
                  />
                  <FormField
                    label="Tanggal lahir"
                    name="tanggal_lahir"
                    type="date"
                  />
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-foreground">
                      Jenis kelamin
                    </span>
                    <select
                      name="jenis_kelamin"
                      required
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-foreground">Role</span>
                    <select
                      name="role"
                      required
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option>Staff</option>
                      <option>Manager</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-foreground">Alamat</span>
                    <textarea
                      name="alamat"
                      required
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
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
                    <FormField
                      label="Nama bank"
                      name="nama_bank"
                      placeholder="Contoh: Bank BCA"
                    />
                    <FormField
                      label="Nomor rekening"
                      name="nomor_rekening"
                      placeholder="Masukkan nomor rekening"
                    />
                    <FormField
                      label="Nama pemilik rekening"
                      name="nama_pemilik_rekening"
                      placeholder="Sesuai buku rekening"
                    />
                    <FormField
                      label="Cabang bank"
                      name="cabang_bank"
                      placeholder="Opsional"
                      required={false}
                    />
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Pastikan nomor rekening dan nama pemilik sudah sesuai untuk
                    proses payroll.
                  </div>
                </div>
              )}
              <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-card pt-4">
                {employeeFormStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmployeeFormStep(1)}
                  >
                    Kembali
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSaveEmployeeMessage(null);
                    setIsAddEmployeeOpen(false);
                  }}
                >
                  Batal
                </Button>
                {employeeFormStep === 1 ? (
                  <Button type="button" onClick={() => setEmployeeFormStep(2)}>
                    Lanjut ke data rekening
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSavingEmployee}>
                    {isSavingEmployee ? "Menyimpan..." : "Simpan karyawan"}
                  </Button>
                )}
                {saveEmployeeMessage && (
                  <p
                    className={`self-center text-xs ${saveEmployeeMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {saveEmployeeMessage.text}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium">{value || "Belum diisi"}</p>
    </div>
  );
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normalizeIndonesianPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+62") || digits.startsWith("62")) {
    return `+62${digits.slice(2)}`;
  }
  if (digits.startsWith("0")) {
    return `+62${digits.slice(1)}`;
  }
  return digits ? `+62${digits}` : "";
}

function getFieldValidation(name: string, value: string) {
  if (name === "nik" && value.length > 0 && value.length !== 16) {
    return "NIK harus terdiri dari 16 digit.";
  }
  if (
    name === "email" &&
    value.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return "Format email tidak valid. Gunakan contoh nama@domain.com.";
  }
  return "";
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const initialValue = defaultValue ?? "";
  const [value, setValue] = useState(initialValue);
  const [validationMessage, setValidationMessage] = useState(
    getFieldValidation(name, initialValue),
  );
  const isPhone = name === "no_wa" || name === "no_tlp";
  const isNik = name === "nik";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = isPhone
      ? normalizeIndonesianPhone(event.target.value)
      : isNik
        ? event.target.value.replace(/\D/g, "").slice(0, 16)
        : event.target.value;
    const message = getFieldValidation(name, nextValue);
    setValue(nextValue);
    setValidationMessage(message);
    event.target.setCustomValidity(message);
  }

  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        required={required}
        name={name}
        type={type}
        inputMode={
          isPhone || isNik ? "numeric" : type === "email" ? "email" : undefined
        }
        maxLength={isNik ? 16 : undefined}
        pattern={isNik ? "[0-9]{16}" : undefined}
        title={isNik ? "NIK harus terdiri dari 16 digit." : undefined}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`h-9 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 ${validationMessage ? "border-red-400 focus:border-red-500 focus:ring-red-500/30" : "border-input"}`}
      />
      {validationMessage && (
        <span className="block text-xs text-red-600">{validationMessage}</span>
      )}
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
