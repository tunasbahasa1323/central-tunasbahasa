"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { ExternalLink, History, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Customer = {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  rtRw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  source: string;
};

type TransactionDemo = {
  date: string;
  code: string;
  service: string;
  quantity: number;
  total: string;
  status: "Selesai" | "Diproses" | "Dibatalkan";
  archiveUrl: string;
};

type CustomerRow = {
  id: string;
  customer_code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  rt_rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  source: string;
};

const sourceOptions = [
  "Shopee",
  "Instagram",
  "TikTok",
  "Website",
  "Carousell",
  "Teman",
  "Lainnya",
];

const demoTransactions: TransactionDemo[] = [
  { date: "11 Nov 2026", code: "TRX-202611-001", service: "Penerjemahan Dokumen", quantity: 2, total: "Rp 750.000", status: "Selesai", archiveUrl: "https://drive.google.com/" },
  { date: "02 Nov 2026", code: "TRX-202611-002", service: "Kursus Bahasa Indonesia", quantity: 4, total: "Rp 1.200.000", status: "Diproses", archiveUrl: "https://drive.google.com/" },
  { date: "18 Okt 2026", code: "TRX-202610-014", service: "Proofreading Dokumen", quantity: 1, total: "Rp 350.000", status: "Selesai", archiveUrl: "https://drive.google.com/" },
];

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "+62";

  // Preserve an explicitly entered international code, such as +1 or +65.
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "+62";
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "+62";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}

function uppercaseText(value: string) {
  return value.toUpperCase();
}

function uppercaseInput(
  event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
) {
  event.currentTarget.value = uppercaseText(event.currentTarget.value);
}

const provinceOptions = [
  ["11", "Aceh"],
  ["12", "Sumatera Utara"],
  ["13", "Sumatera Barat"],
  ["14", "Riau"],
  ["15", "Jambi"],
  ["16", "Sumatera Selatan"],
  ["17", "Bengkulu"],
  ["18", "Lampung"],
  ["19", "Kepulauan Bangka Belitung"],
  ["21", "Kepulauan Riau"],
  ["31", "DKI Jakarta"],
  ["32", "Jawa Barat"],
  ["33", "Jawa Tengah"],
  ["34", "DI Yogyakarta"],
  ["35", "Jawa Timur"],
  ["36", "Banten"],
  ["51", "Bali"],
  ["52", "Nusa Tenggara Barat"],
  ["53", "Nusa Tenggara Timur"],
  ["61", "Kalimantan Barat"],
  ["62", "Kalimantan Tengah"],
  ["63", "Kalimantan Selatan"],
  ["64", "Kalimantan Timur"],
  ["65", "Kalimantan Utara"],
  ["71", "Sulawesi Utara"],
  ["72", "Sulawesi Tengah"],
  ["73", "Sulawesi Selatan"],
  ["74", "Sulawesi Tenggara"],
  ["75", "Gorontalo"],
  ["76", "Sulawesi Barat"],
  ["81", "Maluku"],
  ["82", "Maluku Utara"],
  ["91", "Papua"],
  ["92", "Papua Barat"],
  ["93", "Papua Selatan"],
  ["94", "Papua Tengah"],
  ["95", "Papua Pegunungan"],
  ["96", "Papua Barat Daya"],
] as const;

export default function TurkiUpCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [transactionCustomer, setTransactionCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerSource, setCustomerSource] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [provinceSuggestions, setProvinceSuggestions] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.phone} ${customer.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [customers, query],
  );

  useEffect(() => {
    let active = true;
    async function loadCustomers() {
      if (!isSupabaseConfigured) {
        setSaveMessage("Supabase belum dikonfigurasi.");
        setIsLoadingCustomers(false);
        return;
      }
      const result = await supabase
        .from("tu_customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) setSaveMessage(result.error.message);
      else
        setCustomers(
          ((result.data ?? []) as CustomerRow[]).map(mapCustomerRow),
        );
      setIsLoadingCustomers(false);
    }
    void loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  function mapCustomerRow(row: CustomerRow): Customer {
    return {
      id: row.id,
      customerCode: row.customer_code,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      rtRw: row.rt_rw,
      village: row.village,
      district: row.district,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      source: row.source,
    };
  }

  function openCreate() {
    setEditingCustomer(null);
    setCustomerSource("");
    setProvince("");
    setCity("");
    setCitySuggestions([]);
    setProvinceSuggestions([]);
    setIsFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setCustomerSource(
      sourceOptions.includes(customer.source) ? customer.source : "Lainnya",
    );
    setProvince(customer.province);
    setCity(customer.city);
    setCitySuggestions([]);
    setProvinceSuggestions([]);
    setIsFormOpen(true);
  }

  function loadProvinceSuggestions(value: string) {
    const capitalizedValue = value;
    setProvince(uppercaseText(value));
    const normalizedValue = value.trim().toLowerCase();
    setProvinceSuggestions(
      normalizedValue.length < 1
        ? []
        : provinceOptions
            .map(([, name]) => name)
            .filter((name) => name.toLowerCase().includes(normalizedValue))
            .slice(0, 10),
    );
  }

  async function loadCitySuggestions(value: string) {
    const capitalizedValue = value;
    setCity(uppercaseText(value));
    if (capitalizedValue.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }
    setIsLoadingCities(true);
    try {
      const response = await fetch("/api/wilayah/cities");
      const result = (await response.json()) as {
        data?: Array<{ code: string; name: string }>;
      };
      setCitySuggestions(
        (result.data ?? [])
          .filter((item) =>
            item.name.toLowerCase().includes(capitalizedValue.toLowerCase()),
          )
          .slice(0, 10),
      );
    } catch {
      setCitySuggestions([]);
    } finally {
      setIsLoadingCities(false);
    }
  }

  async function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields = {
      name: uppercaseText(String(form.get("name") ?? "").trim()),
      phone: normalizePhone(String(form.get("phone") ?? "").trim()),
      email: String(form.get("email") ?? "").trim(),
      address: uppercaseText(String(form.get("address") ?? "").trim()),
      rt_rw: String(form.get("rtRw") ?? "").trim(),
      village: uppercaseText(String(form.get("village") ?? "").trim()),
      district: uppercaseText(String(form.get("district") ?? "").trim()),
      city: uppercaseText(String(form.get("city") ?? "").trim()),
      province: uppercaseText(String(form.get("province") ?? "").trim()),
      postal_code: String(form.get("postalCode") ?? "").trim(),
      source:
        customerSource === "Lainnya"
          ? String(form.get("customSource") ?? "").trim()
          : customerSource,
      updated_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured) {
      setSaveMessage("Supabase belum dikonfigurasi.");
      return;
    }
    setSaveMessage("Menyimpan...");
    const result = editingCustomer
      ? await supabase
          .from("tu_customers")
          .update(fields)
          .eq("id", editingCustomer.id)
          .select("*")
          .single()
      : await supabase.from("tu_customers").insert(fields).select("*").single();
    if (result.error) {
      setSaveMessage(result.error.message);
      return;
    }
    const savedCustomer = mapCustomerRow(result.data as CustomerRow);
    setCustomers((current) =>
      editingCustomer
        ? current.map((item) =>
            item.id === savedCustomer.id ? savedCustomer : item,
          )
        : [savedCustomer, ...current],
    );
    setSaveMessage("");
    setIsFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Workspace TurkiUp · Sales & CRM
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Data Customer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data customer TurkiUp secara ringkas.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Customer</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama, nomor HP, atau email..."
                className="h-9 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">No. HP</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Kota/Kabupaten</th>
                  <th className="px-4 py-3 font-medium">Sumber Customer</th>
                  <th className="px-4 py-3 font-medium">Riwayat Transaksi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-5 py-4 font-medium text-primary">
                      {customer.customerCode}
                    </td>
                    <td className="px-4 py-4 font-medium">{customer.name}</td>
                    <td className="px-4 py-4">{customer.phone}</td>
                    <td className="px-4 py-4">{customer.email || "-"}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {customer.city || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary">
                        {customer.source || "-"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => setTransactionCustomer(customer)}>
                        <History className="h-4 w-4" /> Lihat
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(customer)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600"
                            onClick={async () => {
                              if (!isSupabaseConfigured) {
                                setSaveMessage("Supabase belum dikonfigurasi.");
                                return;
                              }
                              const result = await supabase
                                .from("tu_customers")
                                .delete()
                                .eq("id", customer.id);
                              if (result.error) {
                                setSaveMessage(result.error.message);
                                return;
                              }
                              setCustomers((current) =>
                                current.filter(
                                  (item) => item.id !== customer.id,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Belum ada data customer.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {transactionCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setTransactionCustomer(null); }}>
          <div className="w-full max-w-3xl rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Customer {transactionCustomer.customerCode}</p><h2 className="text-lg font-semibold">Riwayat Pembelian</h2><p className="mt-1 text-sm text-muted-foreground">{transactionCustomer.name}</p></div>
              <Button type="button" variant="outline" size="sm" onClick={() => setTransactionCustomer(null)}>Tutup</Button>
            </div>
            <div className="mt-5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Tanggal</th><th className="px-4 py-3 font-medium">No. Transaksi</th><th className="px-4 py-3 font-medium">Layanan</th><th className="px-4 py-3 font-medium">Jumlah</th><th className="px-4 py-3 text-right font-medium">Total</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Arsip</th></tr></thead><tbody>{demoTransactions.map((transaction) => <tr key={transaction.code} className="border-b last:border-0"><td className="px-4 py-4">{transaction.date}</td><td className="px-4 py-4 font-medium text-primary">{transaction.code}</td><td className="px-4 py-4">{transaction.service}</td><td className="px-4 py-4">{transaction.quantity}</td><td className="px-4 py-4 text-right font-medium">{transaction.total}</td><td className="px-4 py-4"><Badge variant={transaction.status === "Diproses" ? "outline" : "secondary"}>{transaction.status}</Badge></td><td className="px-4 py-4"><a href={transaction.archiveUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"><ExternalLink className="h-4 w-4" /> Lihat Arsip</a></td></tr>)}</tbody></table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Riwayat pembelian akan terisi setelah modul transaksi terhubung ke database.</p>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFormOpen(false);
          }}
        >
          <form
            onSubmit={saveCustomer}
            className="customer-form-scroll max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10"
          >
            <h2 className="text-lg font-semibold">
              {editingCustomer ? "Edit Customer" : "Tambah Customer"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Nama</span>
                <input
                  name="name"
                  required
                  defaultValue={editingCustomer?.name}
                  onInput={uppercaseInput}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">No. Hp</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  defaultValue={editingCustomer?.phone || "+62"}
                  placeholder="+62 81234567890 atau +65 81234567"
                  inputMode="tel"
                  autoComplete="tel"
                  onBlur={(event) => {
                    event.currentTarget.value = normalizePhone(
                      event.currentTarget.value,
                    );
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingCustomer?.email}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Sumber Customer</span>
                <select
                  name="source"
                  value={customerSource}
                  onChange={(event) => setCustomerSource(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Pilih sumber</option>
                  {sourceOptions.map((source) => (
                    <option key={source}>{source}</option>
                  ))}
                </select>
              </label>
              {customerSource === "Lainnya" && (
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Sumber Customer Lainnya</span>
                  <input
                    name="customSource"
                    required
                    onInput={uppercaseInput}
                    placeholder="Ketik sumber customer"
                    defaultValue={
                      editingCustomer?.source !== "Lainnya"
                        ? editingCustomer?.source
                        : ""
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </label>
              )}
              <label className="space-y-1.5 text-sm sm:col-span-2">
                <span className="font-medium">Alamat lengkap</span>
                <textarea
                  name="address"
                  required
                  defaultValue={editingCustomer?.address}
                  onInput={uppercaseInput}
                  rows={4}
                  placeholder="Tulis alamat lengkap customer"
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">RT/RW</span>
                <input
                  name="rtRw"
                  defaultValue={editingCustomer?.rtRw}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Kelurahan/Desa</span>
                <input
                  name="village"
                  defaultValue={editingCustomer?.village}
                  onInput={uppercaseInput}
                  placeholder="Tulis kelurahan/desa"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Kecamatan</span>
                <input
                  name="district"
                  defaultValue={editingCustomer?.district}
                  onInput={uppercaseInput}
                  placeholder="Tulis kecamatan"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="relative space-y-1.5 text-sm">
                <span className="font-medium">Kota/Kabupaten</span>
                <input
                  name="city"
                  value={city}
                  onChange={(event) => loadCitySuggestions(event.target.value)}
                  autoComplete="off"
                  placeholder="Ketik nama kota/kabupaten"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                {isLoadingCities && (
                  <span className="absolute right-2 top-8 text-xs text-muted-foreground">
                    Memuat...
                  </span>
                )}
                {citySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
                    {citySuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion.code}
                        onClick={() => {
                          setCity(suggestion.name);
                          setCitySuggestions([]);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-muted"
                      >
                        {suggestion.name}
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <label className="relative space-y-1.5 text-sm">
                <span className="font-medium">Provinsi</span>
                <input
                  name="province"
                  value={province}
                  onChange={(event) =>
                    loadProvinceSuggestions(event.target.value)
                  }
                  onBlur={() =>
                    setTimeout(() => setProvinceSuggestions([]), 150)
                  }
                  autoComplete="off"
                  placeholder="Ketik nama provinsi"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                {provinceSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
                    {provinceSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setProvince(suggestion);
                          setProvinceSuggestions([]);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-muted"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Kode Pos</span>
                <input
                  name="postalCode"
                  defaultValue={editingCustomer?.postalCode}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan Customer</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
