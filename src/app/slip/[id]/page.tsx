import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function generateStaticParams() {
  return [
    { id: "PAY-2026-11-001" },
    { id: "PAY-2026-10-001" },
    { id: "PAY-2026-10-002" },
  ];
}

export default async function SlipValidationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-900">Central Management</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">E-Slip Terverifikasi</h1>
        <p className="mt-2 text-sm text-slate-600">Dokumen dengan nomor slip berikut diterbitkan secara resmi oleh sistem.</p>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">{id}</div>
        <p className="mt-5 text-xs leading-5 text-slate-500">Dokumen ini diterbitkan secara otomatis oleh sistem Central Management dan sah sebagai bukti resmi dari Perusahaan.</p>
        <Link href="/payroll" className="mt-6 inline-flex h-8 items-center rounded-lg bg-blue-900 px-3 text-sm font-medium text-white hover:bg-blue-800">Kembali ke Payroll</Link>
      </div>
    </main>
  );
}
