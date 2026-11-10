# Product Requirements Document (PRD) - Tahap 3

**Nama Produk:** Central Management  
**Modul:** Workspace "TurkiUP" (Sistem CRM, Operasional, & Invoicing Terintegrasi)  
**Tujuan Tahap 3:** Membangun antarmuka (_dashboard_) eksklusif untuk sektor bisnis TurkiUP yang memiliki alur penjualan (Order -> Invoice -> Task) sendiri, namun tetap terpusat dengan modul Karyawan dan Keuangan Utama (Central).

---

## 1. Fitur Utama (Core Features)

### 1.1. Modul Sales & Master Data

- **Katalog Jasa:** Admin TurkiUP dapat menambah, mengedit, dan menghapus daftar layanan/produk jasa beserta harga standarnya (Master Data).
- **CRM Pelanggan TurkiUP:** Database profil pelanggan yang pernah bertransaksi dengan TurkiUP.
- **Generate Order (Pembelian):** Form transaksi terpadu. Admin memilih Pelanggan, memilih Jasa dari katalog, menyesuaikan harga (jika ada diskon), dan langsung menetapkan (assign) siapa Staf yang akan mengerjakan layanan ini.

### 1.2. Modul Invoicing & Pembayaran

- **Generate Invoice Otomatis:** Setiap Order yang dibuat akan otomatis menghasilkan dokumen Invoice berbasis Web (_viewable_) dan berformat PDF yang profesional dengan logo TurkiUP.
- **Smart QR Code terintegrasi:** Setiap dokumen Invoice wajib menyematkan kode QR.
  - Jika QR di-scan oleh Pelanggan: Akan membuka halaman tagihan _online_ dinamis (misal: `domain.com/inv/trk-001`) yang menampilkan status pembayaran (_Unpaid/Paid_) secara _real-time_.
  - Jika QR di-scan oleh Admin: Membantu pencarian data pesanan dengan cepat di sistem untuk proses pelunasan/update.
- **Pelacakan Status Pembayaran:** Invoice memiliki status: _Unpaid_ (Belum Bayar), _Partial_ (DP), dan _Paid_ (Lunas).
- **Kirim Tagihan via WA:** Tombol 1-klik untuk mengirim link Invoice _online_ (Web-view) ke WhatsApp pelanggan menggunakan Fonnte API.

### 1.3. Integrasi Operasional (Ke Central Management)

- **Auto-Task Creation:** Setelah Order/Pembelian dibuat, sistem otomatis membuatkan baris data di menu "Tugas" milik Staf yang ditugaskan (terhubung ke modul Tahap 1).
- **Monitoring Board:** Manajer TurkiUP dapat melihat progres kerja stafnya dalam bentuk tabel atau papan Kanban (Ditugaskan -> Proses -> Selesai).
- **Direktori Tim Terfilter:** Menampilkan daftar karyawan yang memiliki akses/ditempatkan di sektor TurkiUP (menarik data dari tabel `profiles` Pusat).

### 1.4. Laba/Rugi Sektor (Profitability Dashboard)

- Menyatukan arus kas masuk dan keluar khusus TurkiUP.
- **Pemasukan:** Dihitung dari total nilai Invoice yang berstatus _Paid_.
- **Pengeluaran:** Menarik data dari Central Finance (Tahap 2), yaitu Komisi Staf TurkiUP dan _Reimbursement_ operasional TurkiUP.
- **Net Profit:** Kalkulasi otomatis (Pemasukan - Pengeluaran).

---

## 2. Pengguna & Hak Akses (RBAC) Khusus TurkiUP

| Peran (Role)          | Hak Akses di Workspace TurkiUP                                                                     |
| :-------------------- | :------------------------------------------------------------------------------------------------- |
| **Super Admin Pusat** | Akses penuh ke seluruh menu TurkiUP (Bisa melihat profitabilitas dan mengubah master data).        |
| **Manajer TurkiUP**   | Bisa membuat Order, men-_generate_ Invoice, mengelola pelanggan, dan memonitor tugas staf TurkiUP. |
| **Staf TurkiUP**      | Hanya melihat Order/Tugas yang ditugaskan kepadanya di _dashboard_ staf reguler.                   |

---

## 3. Spesifikasi Antarmuka (UI/UX)

- **Switch Workspace:** Pada _header_ aplikasi utama (Central), terdapat _dropdown_ atau _tab_ untuk berpindah dari "Central Management" ke "Workspace: TurkiUP".
- **Tema Visual:** Mempertahankan _layout_ utama, namun bisa diberikan aksen warna sekunder atau logo TurkiUP di _sidebar_ agar user sadar sedang berada di ruang kerja spesifik.
- **Invoice Template:** Desain invoice _clean_, menampilkan Logo TurkiUP, Nomor Invoice unik (misal: `TRK-202611-001`), rincian jasa, total tagihan, dan instruksi pembayaran.

---

## 4. Model Data Tambahan (Database Schema - Supabase)

**1. Tabel `turkiup_services` (Katalog Jasa)**

- `id` (UUID, PK)
- `name` (String)
- `description` (Text)
- `base_price` (Decimal/Int)
- `is_active` (Boolean)

**2. Tabel `turkiup_orders` (Transaksi / Pembelian)**

- `id` (UUID, PK)
- `invoice_number` (String, Unique) -- Contoh: TRK-001
- `customer_id` (UUID, FK ke tabel `customers` pusat)
- `service_id` (UUID, FK ke `turkiup_services`)
- `assigned_staff_id` (UUID, FK ke `users`)
- `final_price` (Decimal/Int)
- `payment_status` (Enum: unpaid, partial, paid)
- `created_at` (Timestamptz)

**3. Update Tabel `tasks` (Dari Tahap 1)**

- Tambahkan kolom `order_id` (UUID, FK ke `turkiup_orders`, Nullable). Ini berfungsi sebagai pengait: tugas ini berasal dari invoice/pembelian yang mana.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

1. Sistem menghasilkan Nomor Invoice (_Invoice Number_) yang unik secara berurutan saat order dibuat.
2. QR Code pada Invoice merujuk ke halaman URL spesifik dari tagihan tersebut.
3. Halaman Invoice _online_ yang dituju oleh QR Code dapat diakses oleh publik (pelanggan) tanpa perlu _login_, namun bersifat _read-only_ (hanya menampilkan rincian pesanan dan instruksi pembayaran).
4. Saat Admin mengubah status pembayaran menjadi _Paid_ di _dashboard_, halaman Invoice _online_ milik pelanggan tersebut otomatis menampilkan cap/stempel "LUNAS".
