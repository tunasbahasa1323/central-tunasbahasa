import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";

const highlights = [
  {
    icon: Users,
    title: "Mandarin",
    description: "Bangun fondasi percakapan, pelafalan, dan karakter Mandarin bersama pengajar berpengalaman.",
  },
  {
    icon: Building2,
    title: "Prancis & English",
    description: "Tingkatkan kemampuan komunikasi untuk sekolah, karier, perjalanan, dan kebutuhan profesional.",
  },
  {
    icon: BarChart3,
    title: "Bahasa Turki",
    description: "Kenali bahasa dan budaya Turki melalui kelas yang praktis, terarah, dan menyenangkan.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8fc] text-[#0b1f3a]">
      <div className="relative isolate">
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-72 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2c55] text-sm font-bold text-white shadow-lg shadow-blue-950/15">
              TB
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">Tunas Bahasa</span>
              <span className="block text-[11px] font-medium text-slate-500">Pusat Les Bahasa Asing</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#0b2c55]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b2c55] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b2c55]/30 hover:shadow-md"
          >
            Konsultasi program
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-cyan-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Belajar bahasa asing dengan percaya diri
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#092747] sm:text-6xl">
              Buka dunia lebih luas lewat bahasa.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Tunas Bahasa menghadirkan les Mandarin, Prancis, English, dan Turki untuk membantu Anda berkomunikasi lintas budaya dengan lebih lancar, percaya diri, dan terarah.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2c55] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-[#123f73]"
              >
                Lihat program belajar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Kenali kelas kami
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              {["Pengajar berpengalaman", "Materi terstruktur", "Kelas fleksibel"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mr-0">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-cyan-200/60 via-blue-100/30 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#0b2c55] p-3 shadow-2xl shadow-blue-950/20">
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#164a7e] to-[#071d3a] p-6 text-white sm:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs font-medium text-cyan-200">Pilihan kelas Tunas Bahasa</p>
                    <p className="mt-1 text-xl font-semibold">Temukan kelas yang tepat</p>
                  </div>
                  <ShieldCheck className="h-7 w-7 text-cyan-200" />
                </div>
                <div className="grid grid-cols-2 gap-3 py-6">
                  <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-blue-100">Pilihan bahasa</p><p className="mt-2 text-3xl font-bold">04</p><p className="mt-1 text-xs text-emerald-300">Kelas tersedia</p></div>
                                    <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-blue-100">Format belajar</p><p className="mt-2 text-3xl font-bold">Fleksibel</p><p className="mt-1 text-xs text-cyan-200">Sesuai kebutuhan</p></div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4"><div className="mb-4 flex items-center justify-between text-xs text-blue-100"><span>Perjalanan belajar</span><span>Level pemula - mahir</span></div><div className="flex h-24 items-end gap-2">{[38, 52, 44, 70, 61, 86, 74, 95, 78, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-400 to-sky-200 opacity-90" style={{ height: `${height}%` }} />)}</div></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="fitur" className="border-y border-slate-200/80 bg-white/70 px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">Belajar dengan cara yang lebih menyenangkan</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#092747]">Pilih bahasa, mulai perjalananmu.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{highlights.map(({ icon: Icon, title, description }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></div><h3 className="mt-5 font-semibold text-[#092747]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>)}</div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span>© 2026 Tunas Bahasa. Les bahasa asing untuk masa depan yang lebih luas.</span><Link href="/login" className="font-semibold text-[#0b2c55] hover:underline">Akses Central Management</Link></footer>
    </main>
  );
}
