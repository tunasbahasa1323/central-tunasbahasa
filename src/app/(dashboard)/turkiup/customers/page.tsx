"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  source: string;
};

const sourceOptions = ["Shopee", "Instagram", "TikTok", "Website", "Carousell", "Teman", "Lainnya"];
const provinceOptions = [
  ["11", "Aceh"], ["12", "Sumatera Utara"], ["13", "Sumatera Barat"], ["14", "Riau"], ["15", "Jambi"], ["16", "Sumatera Selatan"], ["17", "Bengkulu"], ["18", "Lampung"], ["19", "Kepulauan Bangka Belitung"], ["21", "Kepulauan Riau"], ["31", "DKI Jakarta"], ["32", "Jawa Barat"], ["33", "Jawa Tengah"], ["34", "DI Yogyakarta"], ["35", "Jawa Timur"], ["36", "Banten"], ["51", "Bali"], ["52", "Nusa Tenggara Barat"], ["53", "Nusa Tenggara Timur"], ["61", "Kalimantan Barat"], ["62", "Kalimantan Tengah"], ["63", "Kalimantan Selatan"], ["64", "Kalimantan Timur"], ["65", "Kalimantan Utara"], ["71", "Sulawesi Utara"], ["72", "Sulawesi Tengah"], ["73", "Sulawesi Selatan"], ["74", "Sulawesi Tenggara"], ["75", "Gorontalo"], ["76", "Sulawesi Barat"], ["81", "Maluku"], ["82", "Maluku Utara"], ["91", "Papua"], ["92", "Papua Barat"], ["93", "Papua Selatan"], ["94", "Papua Tengah"], ["95", "Papua Pegunungan"], ["96", "Papua Barat Daya"],
] as const;

export default function TurkiUpCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerSource, setCustomerSource] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const filteredCustomers = useMemo(() => customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(query.toLowerCase()),
  ), [customers, query]);

  function openCreate() {
    setEditingCustomer(null);
    setCustomerSource("");
    setProvince("");
    setCity("");
    setCitySuggestions([]);
    setIsFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setCustomerSource(customer.source);
    setProvince("");
    setCity("");
    setCitySuggestions([]);
    setIsFormOpen(true);
  }

  async function loadCitySuggestions(value: string) {
    setCity(value);
    if (value.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }
    setIsLoadingCities(true);
    try {
      const response = await fetch("/api/wilayah/cities");
      const result = await response.json() as { data?: Array<{ code: string; name: string }> };
      setCitySuggestions((result.data ?? []).filter((item) => item.name.toLowerCase().includes(value.toLowerCase())).slice(0, 10));
    } catch {
      setCitySuggestions([]);
    } finally {
      setIsLoadingCities(false);
    }
  }

  function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer: Customer = {
      id: editingCustomer?.id ?? `CUS-${String(customers.length + 1).padStart(3, "0")}`,
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      address: [String(form.get("address") ?? "").trim(), `RT/RW ${String(form.get("rtRw") ?? "").trim()}`, String(form.get("village") ?? "").trim(), String(form.get("city") ?? "").trim(), String(form.get("district") ?? "").trim(), String(form.get("province") ?? "").trim(), String(form.get("postalCode") ?? "").trim()].filter((value) => value && !/^RT\/RW $/.test(value)).join(", "),
      source: customerSource === "Lainnya" ? String(form.get("customSource") ?? "").trim() : customerSource,
    };
    setCustomers((current) => editingCustomer ? current.map((item) => item.id === customer.id ? customer : item) : [customer, ...current]);
    setIsFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Sales & CRM</p><h1 className="text-2xl font-semibold tracking-tight">Data Customer</h1><p className="mt-1 text-sm text-muted-foreground">Kelola data customer TurkiUp secara ringkas.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Customer</Button>
      </div>

      <Card><CardHeader className="border-b border-border pb-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Daftar Customer</CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, nomor HP, atau email..." className="h-9 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" /></div></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">Nama</th><th className="px-4 py-3 font-medium">No. HP</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Alamat Lengkap</th><th className="px-4 py-3 font-medium">Sumber Customer</th><th className="px-4 py-3" /></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30"><td className="px-5 py-4 font-medium">{customer.name}</td><td className="px-4 py-4">{customer.phone}</td><td className="px-4 py-4">{customer.email || "-"}</td><td className="max-w-[280px] px-4 py-4 text-muted-foreground">{customer.address || "-"}</td><td className="px-4 py-4"><Badge variant="secondary">{customer.source || "-"}</Badge></td><td className="px-4 py-4"><DropdownMenu><DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(customer)}>Edit</DropdownMenuItem><DropdownMenuItem className="text-rose-600" onClick={() => setCustomers((current) => current.filter((item) => item.id !== customer.id))}><Trash2 className="h-4 w-4" /> Hapus</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr>)}</tbody></table>{filteredCustomers.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Belum ada data customer.</p>}</div></CardContent></Card>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}><form onSubmit={saveCustomer} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10"><h2 className="text-lg font-semibold">{editingCustomer ? "Edit Customer" : "Tambah Customer"}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span className="font-medium">Nama</span><input name="name" required defaultValue={editingCustomer?.name} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">No. Hp</span><input name="phone" required defaultValue={editingCustomer?.phone} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">Email</span><input name="email" type="email" defaultValue={editingCustomer?.email} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">Sumber Customer</span><select name="source" value={customerSource} onChange={(event) => setCustomerSource(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Pilih sumber</option>{sourceOptions.map((source) => <option key={source}>{source}</option>)}</select></label>{customerSource === "Lainnya" && <label className="space-y-1.5 text-sm"><span className="font-medium">Sumber Customer Lainnya</span><input name="customSource" required placeholder="Ketik sumber customer" defaultValue={editingCustomer?.source !== "Lainnya" ? editingCustomer?.source : ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>}<label className="space-y-1.5 text-sm sm:col-span-2"><span className="font-medium">Alamat lengkap</span><textarea name="address" required defaultValue={editingCustomer?.address} rows={4} placeholder="Tulis alamat lengkap customer" className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">RT/RW</span><input name="rtRw" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">Kelurahan/Desa</span><input name="village" placeholder="Tulis kelurahan/desa" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="space-y-1.5 text-sm"><span className="font-medium">Kecamatan</span><input name="district" placeholder="Tulis kecamatan" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label><label className="relative space-y-1.5 text-sm"><span className="font-medium">Kota/Kabupaten</span><input name="city" value={city} onChange={(event) => loadCitySuggestions(event.target.value)} autoComplete="off" placeholder="Ketik nama kota/kabupaten" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />{isLoadingCities && <span className="absolute right-2 top-8 text-xs text-muted-foreground">Memuat...</span>}{citySuggestions.length > 0 && <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">{citySuggestions.map((suggestion) => <button type="button" key={suggestion.code} onClick={() => { setCity(suggestion.name); setCitySuggestions([]); }} className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-muted">{suggestion.name}</button>)}</div>}</label><label className="space-y-1.5 text-sm"><span className="font-medium">Provinsi</span><input name="province" list="province-suggestions" value={province} onChange={(event) => setProvince(event.target.value)} placeholder="Pilih atau tulis provinsi" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /><datalist id="province-suggestions">{provinceOptions.map(([, name]) => <option key={name} value={name} />)}</datalist></label><label className="space-y-1.5 text-sm"><span className="font-medium">Kode Pos</span><input name="postalCode" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button><Button type="submit">Simpan Customer</Button></div></form></div>}
    </div>
  );
}
