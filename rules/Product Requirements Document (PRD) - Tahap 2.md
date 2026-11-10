# Product Requirements Document (PRD) - Tahap 2 (Revisi Split Menu)

**Nama Produk:** Central Management  
**Modul:** Menu Payroll (Komisi Karyawan) & Menu Finance (Biaya Operasional)  
**Tujuan Tahap 2:** Membangun sistem pencairan dana yang terpisah antara hak pendapatan karyawan (Payroll) dan arus kas keluar untuk biaya operasional/talangan (Finance).

---

## 1. Fitur Utama (Core Features)

### 1.1. Menu PAYROLL (Manajemen Komisi & Pendapatan)

Fokus pada hak finansial karyawan dari jasa yang mereka kerjakan.

- **Komisi Dinamis:** Manajer dapat memasukkan nominal "Komisi Tugas" yang berbeda-beda saat mendelegasikan tugas ke Staf. Saat tugas "Selesai", komisi mengendap di saldo staf.
- **Keranjang Pencairan Payroll:** Admin/Manajer membuka menu Payroll dan memilih staf. Sistem menampilkan daftar Tugas "Selesai" yang belum dibayar. Manajer dapat mencentang tugas mana saja yang akan ditransfer hari ini dan mengeklik "Cairkan Komisi".
- **Slip & Riwayat:** Staf dapat melihat riwayat pencairan komisi mereka di menu dompet pribadi.

### 1.2. Menu FINANCE (Operasional & Reimbursement)

Fokus pada uang operasional bisnis yang dikeluarkan staf di lapangan.

- **Pengajuan Reimbursement:** Staf mengajukan klaim uang talangan dengan mengisi form (Deskripsi, Nominal, Sektor Bisnis terkait) dan wajib mengunggah foto Bukti/Nota.
- **Approval Pipeline:** Manajer/Admin keuangan memverifikasi nota di menu Finance. Jika valid, status diubah menjadi "Disetujui".
- **Keranjang Pencairan Finance:** Dana _reimburse_ yang sudah disetujui akan masuk ke antrean pencairan. Admin dapat mencentang beberapa klaim _reimburse_ sekaligus untuk dicairkan ke rekening staf.

### 1.3. Integrasi WhatsApp (Fonnte API)

- Notifikasi pencairan berjalan terpisah.
  - _Trigger Payroll:_ "Dana Payroll sebesar Rp[X] untuk komisi [Y] tugas telah ditransfer."
  - _Trigger Finance:_ "Klaim Reimbursement Anda sebesar Rp[X] untuk operasional telah dicairkan."

### 1.4. Sistem E-Slip & Validasi QR Code (Pembaruan Fitur)

Setiap kali Manajer mengeksekusi pencairan (Payroll maupun Finance), sistem akan otomatis menerbitkan **Digital Payslip (E-Slip)**.

- **Token Unik:** Sistem men-generate URL unik yang sulit ditebak untuk setiap kuitansi (contoh: `domain.com/slip/a1b2c3d4-xxxx`).
- **Halaman Slip Resmi:** Halaman ini bersifat _read-only_ dan dirancang rapi (bisa di-_print_ atau _save as PDF_). Di bagian bawah/atas (header/footer) terdapat teks keterangan mandatori: _"Dokumen ini diterbitkan secara otomatis oleh sistem Central Management dan sah sebagai bukti resmi dari Perusahaan."_
- **QR Code:** Di dalam desain halaman E-Slip tersebut, sistem menyematkan komponen QR Code. Jika QR Code ini di-scan oleh kamera HP, ia akan mengarahkan (redirect) ke tautan E-Slip yang sama, bertindak sebagai fitur validasi keaslian dokumen.

### 1.5. Integrasi WhatsApp (Fonnte API) - Revisi Pesan

Pesan WhatsApp otomatis menyertakan _link_ E-Slip.

- _Trigger Payroll:_ "Halo [Nama], dana Payroll Anda sebesar Rp[Total] telah ditransfer. Lihat dan unduh slip gaji resmi Anda di sini: [URL_Slip]"
- _Trigger Finance:_ "Halo [Nama], klaim Reimbursement operasional sebesar Rp[Total] telah dicairkan. Lihat bukti pencairan resmi di sini: [URL_Slip]"

---

## 2. Pengguna & Hak Akses (RBAC)

| Peran (Role)    | Hak Akses Payroll                                                                 | Hak Akses Finance                                                                             |
| :-------------- | :-------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Super Admin** | Akses penuh eksekusi pencairan komisi semua karyawan.                             | Akses penuh persetujuan & pencairan _reimburse_, serta melihat beban biaya seluruh sektor.    |
| **Manajer**     | Dapat mengatur nominal komisi tugas dan mengeksekusi pencairan staf di sektornya. | Dapat menyetujui klaim _reimburse_ staf di sektornya, tetapi eksekusi transfer bisa dibatasi. |
| **Staf**        | Hanya melihat saldo komisi "Belum Cair" dan riwayat penerimaan komisi pribadinya. | Dapat membuat pengajuan klaim nota operasional dan memantau status persetujuannya.            |

---

## 3. Spesifikasi Antarmuka (UI/UX)

- **Perubahan Sidebar:** Menambahkan dua menu terpisah, yaitu **"Payroll"** (ikon uang/gaji) dan **"Finance"** (ikon grafik/kalkulator).
- **UI Payroll Admin:** Tabel berisi daftar staf dan indikator total komisi yang "Menunggu Dibayar". Klik nama staf akan membuka halaman _checklist_ tugas untuk di-payout.
- **UI Finance Admin:** Terdiri dari 2 tab:
  1. _Approval:_ Tabel daftar nota yang baru diajukan staf.
  2. _Payout:_ Tabel _checklist_ daftar nota yang sudah disetujui dan siap ditransfer.
- **UI Staf:** Tampilan "Dompet Saya" dibagi menjadi 2 _section_ (Tab Pendapatan Tugas & Tab Klaim Reimburse).

---

## 4. Model Data (Database Schema - Supabase PostgreSQL)

**1. Update Tabel `tasks`**

- Menambahkan kolom `commission_fee` (Decimal/Int, Default 0).

**2. Tabel `reimbursements` (Untuk Menu Finance)**

- `id` (UUID, PK)
- `user_id` (UUID, FK ke tabel `users`)
- `sector_id` (UUID, FK ke `business_sectors`) -- Agar ketahuan ini biaya operasional bisnis yang mana
- `description` (String)
- `amount` (Decimal/Int, Not Null)
- `receipt_url` (String, Not Null)
- `status` (Enum: pending, approved, rejected, paid)
- `created_at` (Timestamptz)

**3. Tabel `payouts` (Histori Kuitansi untuk Payroll & Finance)**

- `id` (UUID, PK)
- `user_id` (UUID, FK ke tabel `users`) -- Penerima dana
- `processed_by` (UUID, FK ke tabel `users`) -- Yang mengeksekusi
- `type` (Enum: payroll, finance) -- Penanda apakah ini kuitansi komisi atau kuitansi reimburse
- `total_amount` (Decimal/Int)
- `created_at` (Timestamptz)
- Tambahkan kolom `receipt_token` (UUID, Default: `gen_random_uuid()`, Unique). Kolom ini yang akan dijadikan ujung URL (slug) agar aman dan tidak mudah ditebak urutannya oleh orang lain.

**4. Tabel Pivot `payout_items`**

- `payout_id` (UUID, FK ke `payouts` ON DELETE CASCADE)
- `task_id` (UUID, FK ke `tasks`, Nullable)
- `reimbursement_id` (UUID, FK ke `reimbursements`, Nullable)
- `amount_paid` (Decimal/Int)

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

1. Staf menemukan menu pengajuan uang talangan (Reimbursement) yang terpisah dari riwayat komisi tugas mereka.
2. Admin dapat memproses pencairan _Payroll_ (komisi) dan _Finance_ (reimburse) pada waktu yang berbeda tanpa datanya tercampur.
3. Struktur database menggunakan kolom `type` pada tabel `payouts` untuk membedakan kuitansi pengeluaran operasional perusahaan (Finance) dengan kuitansi beban gaji (Payroll).
4. Pemilihan sektor bisnis saat Staf mengajukan _reimburse_ bersifat wajib, sehingga Admin Finance bisa membuat rekap "Total Pengeluaran Bulan Ini untuk Sektor Agensi", dsb.
5. Karyawan dapat mengklik tautan pada pesan WA dan langsung melihat halaman E-Slip di _browser_ HP mereka tanpa perlu _login_.
6. Halaman E-Slip menampilkan komponen QR Code yang dapat di-scan.
7. Saat QR Code di-scan menggunakan _scanner_ bawaan _smartphone_, ia mengarah ke alamat URL halaman yang persis sama untuk memvalidasi data.
8. Terdapat _watermark_ atau teks statis yang menyatakan dokumen ini resmi dikeluarkan oleh sistem perusahaan.
