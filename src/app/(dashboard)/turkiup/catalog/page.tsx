"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const formatPriceInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
};

type Service = { id: string; serviceCode: string; name: string; description: string; basePrice: number; isActive: boolean; category: string };
type ServiceRow = { id: string; service_code: string; name: string; description: string; base_price: number; is_active: boolean; category: string };


export default function TurkiUpCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  function mapService(row: ServiceRow): Service {
    return { id: row.id, serviceCode: row.service_code, name: row.name, description: row.description, basePrice: row.base_price, isActive: row.is_active, category: row.category };
  }

  useEffect(() => {
    let active = true;
    async function loadServices() {
      if (!isSupabaseConfigured) { setSaveMessage("Supabase belum dikonfigurasi."); return; }
      const result = await supabase.from("tu_services").select("*").order("created_at", { ascending: true });
      if (!active) return;
      if (result.error) setSaveMessage(result.error.message);
      else setServices(((result.data ?? []) as ServiceRow[]).map(mapService));
    }
    void loadServices();
    return () => { active = false; };
  }, []);

  async function toggleActive(id: string) {
    const service = services.find((item) => item.id === id);
    if (!service || !isSupabaseConfigured) return;
    const result = await supabase.from("tu_services").update({ is_active: !service.isActive, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (result.error) { setSaveMessage(`Gagal memperbarui status: ${result.error.message}`); return; }
    setServices((prev) => prev.map((item) => item.id === id ? mapService(result.data as ServiceRow) : item));
    setSaveMessage(`Status layanan ${service.serviceCode} berhasil diperbarui.`);
  }

  async function deleteService(id: string) {
    if (!isSupabaseConfigured) return;
    const result = await supabase.from("tu_services").delete().eq("id", id);
    if (result.error) { setSaveMessage(`Gagal menghapus layanan: ${result.error.message}`); return; }
    setServices((prev) => prev.filter((item) => item.id !== id));
    setSaveMessage("Layanan berhasil dihapus.");
  }

  function openEdit(service: Service) {
    setEditTarget(service);
    setCategory(service.category);
    setIsCategoryMenuOpen(false);
    setIsFormOpen(true);
  }

  function openCreate() {
    setEditTarget(null);
    setCategory("");
    setIsCategoryMenuOpen(false);
    setIsFormOpen(true);
  }

  const categorySuggestions = [...new Set(services.map((service) => service.category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id"));

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Workspace TurkiUp · Master Data</p>
          <h1 className="text-2xl font-semibold tracking-tight">Katalog Jasa</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola daftar layanan TurkiUp dan harga standarnya.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Jasa
        </Button>
      </div>

      {saveMessage && !isFormOpen && <div role="status" className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">{saveMessage}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Layanan", value: services.length },
          { label: "Aktif", value: services.filter((s) => s.isActive).length, className: "text-emerald-600" },
          { label: "Nonaktif", value: services.filter((s) => !s.isActive).length, className: "text-muted-foreground" },
          { label: "Kategori", value: categories.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.className ?? ""}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nama Layanan</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Deskripsi</th>
                  <th className="px-4 py-3 font-medium">Harga Dasar</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className={`border-b last:border-0 hover:bg-muted/30 ${service.isActive ? "" : "opacity-60"}`}>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{service.serviceCode}</td>
                    <td className="px-4 py-4 font-medium">{service.name}</td>
                    <td className="px-4 py-4"><Badge variant="secondary" className="text-xs">{service.category}</Badge></td>
                    <td className="max-w-[280px] px-4 py-4 text-xs text-muted-foreground"><span className="line-clamp-2">{service.description}</span></td>
                    <td className="px-4 py-4 font-semibold text-primary">{formatRupiah(service.basePrice)}</td>
                    <td className="px-4 py-4">
                      {service.isActive
                        ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3 w-3" />Aktif</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3 w-3" />Nonaktif</span>}
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label={`Aksi ${service.id}`}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(service)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(service.id)}>{service.isActive ? <><XCircle className="h-4 w-4" /> Nonaktifkan</> : <><CheckCircle2 className="h-4 w-4" /> Aktifkan</>}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => deleteService(service.id)}><Trash2 className="h-4 w-4" /> Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsFormOpen(false); }}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold">{editTarget ? "Edit Jasa" : "Tambah Jasa Baru"}</h2>
            {saveMessage && <p className="mt-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{saveMessage}</p>}
            <p className="mt-1 text-sm text-muted-foreground">Isi detail layanan yang akan ditawarkan TurkiUp.</p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Nama layanan</span>
                <input name="name" placeholder="Contoh: Jasa Penerjemahan Dokumen" defaultValue={editTarget?.name} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </label>
              <label className="relative block space-y-1.5 text-sm">
                <span className="font-medium">Kategori</span>
                <input name="category" value={category} onChange={(event) => setCategory(event.target.value)} onFocus={() => setIsCategoryMenuOpen(true)} onBlur={() => setTimeout(() => setIsCategoryMenuOpen(false), 150)} placeholder="Contoh: Penerjemahan" autoComplete="off" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
                {isCategoryMenuOpen && categorySuggestions.filter((suggestion) => suggestion.toLowerCase().includes(category.toLowerCase())).length > 0 && <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">{categorySuggestions.filter((suggestion) => suggestion.toLowerCase().includes(category.toLowerCase())).map((suggestion) => <button type="button" key={suggestion} onMouseDown={(event) => event.preventDefault()} onClick={() => { setCategory(suggestion); setIsCategoryMenuOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-muted">{suggestion}</button>)}</div>}
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Harga jual mulai dari (Rp)</span>
                <input name="basePrice" placeholder="Contoh: 150.000" defaultValue={editTarget?.basePrice ? formatPriceInput(editTarget.basePrice.toString()) : ""} onInput={(event) => { event.currentTarget.value = formatPriceInput(event.currentTarget.value); }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Deskripsi</span>
                <textarea name="description" defaultValue={editTarget?.description} rows={3} placeholder="Deskripsi singkat layanan" className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
              <Button disabled={isSaving} onClick={async () => { setIsSaving(true); setSaveMessage(""); const name = (document.querySelector('input[name="name"]') as HTMLInputElement)?.value.trim(); const categoryValue = category.trim(); const basePrice = Number((document.querySelector('input[name="basePrice"]') as HTMLInputElement)?.value.replace(/\D/g, "") || 0); const description = (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value.trim(); if (!name || !isSupabaseConfigured) { setSaveMessage(!isSupabaseConfigured ? "Supabase belum dikonfigurasi." : "Nama layanan wajib diisi."); setIsSaving(false); return; } const payload = { name, category: categoryValue, base_price: basePrice, description, updated_at: new Date().toISOString() }; const result = editTarget ? await supabase.from("tu_services").update(payload).eq("id", editTarget.id).select("*").single() : await supabase.from("tu_services").insert(payload).select("*").single(); if (result.error) { setSaveMessage(`Gagal menyimpan layanan: ${result.error.message}`); setIsSaving(false); return; } const saved = mapService(result.data as ServiceRow); setServices((current) => editTarget ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setSaveMessage(editTarget ? "Perubahan layanan berhasil disimpan." : "Layanan berhasil ditambahkan."); setIsSaving(false); setIsFormOpen(false); }}>{isSaving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah Jasa"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
