# Product Requirements Document (PRD) - Tahap 1

**Nama Produk:** Central Management  
**Modul:** Manajemen Karyawan & Sektor Bisnis (Multi-Bisnis)  
**Tujuan Tahap 1:** Membangun direktori karyawan dengan data demografi lengkap, penempatan multi-sektor bisnis, dan sistem autentikasi kustom mandiri (tanpa integrasi Supabase Auth).

---

## 1. Fitur Utama (Core Features)

### 1.1. Manajemen Sektor Bisnis

Sistem untuk memisahkan operasional antara Jasa, Agensi, dan Preloved.

- **Create:** Admin dapat menambahkan nama sektor bisnis baru beserta deskripsinya.
- **Read:** Menampilkan daftar sektor bisnis dalam bentuk tabel.
- **Update:** Mengubah nama atau deskripsi sektor.
- **Status Toggle:** Menonaktifkan sektor bisnis tanpa menghapus data (_soft delete_).

### 1.2. Manajemen Data Karyawan (Multi-Sektor)

Sistem direktori pengguna mandiri dengan pendataan detail dan penempatan sektor bisnis yang fleksibel.

- **Create:** Menambahkan data karyawan baru dengan parameter lengkap (NIK, demografi, kontak). Sistem dapat menetapkan lebih dari satu Sektor Bisnis untuk satu karyawan (misal: Bekerja di Agensi dan Jasa sekaligus).
- **Read:** Menampilkan tabel direktori karyawan. Memiliki filter untuk menyaring tampilan berdasarkan Role atau Sektor Bisnis (menampilkan karyawan yang terkait dengan sektor yang dipilih).
- **Update:** Mengedit profil karyawan, mengubah daftar penempatan sektor bisnis, atau menyesuaikan Role.
- **Status Toggle:** Menonaktifkan akun karyawan untuk mencabut hak akses sistem.

### 1.3. Sistem Autentikasi Kustom Internal

- **Default Password:** Pembuatan akun tidak memerlukan registrasi via email pihak ketiga (Supabase Auth). Saat Admin membuatkan akun, sistem otomatis men-_generate_ password _default_ berupa `Tuba2023` dan menyimpannya langsung di tabel database internal.
- **Login Custom:** Halaman _login_ menggunakan kombinasi NIK/No. WA dan _password_ yang dicocokkan langsung ke tabel internal, lalu dikonversi menjadi sesi _login_ di aplikasi (misalnya menggunakan JWT atau NextAuth).

---

## 2. Pengguna & Hak Akses (RBAC) pada Tahap 1

| Peran (Role)    | Hak Akses Modul Karyawan & Sektor Bisnis                                                                                                                                                                  |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin** | Akses penuh (CRUD) ke tabel Sektor Bisnis dan Direktori Karyawan. Dapat mengatur _role_ dan penempatan multi-sektor karyawan lain.                                                                        |
| **Manajer**     | Hanya dapat melihat (Read) daftar Sektor Bisnis. Dapat melihat daftar karyawan, tetapi hanya bisa menambah/mengedit karyawan dengan _role_ "Staf" yang memiliki irisan sektor bisnis yang sama dengannya. |
| **Staf**        | Hanya dapat melihat profilnya sendiri dan daftar kontak (_read-only_) rekan kerja yang memiliki irisan minimal satu sektor bisnis yang sama.                                                              |

---

## 3. Spesifikasi Antarmuka (UI/UX)

- **Tema:** Profesional, _clean_, dominasi warna biru _navy/ocean_.
- **Layout Utama:** Sidebar navigasi (Dashboard, Sektor Bisnis, Karyawan) dan Header.
- **Komponen Spesifik:**
  - Form input menggunakan _Multi-Select Dropdown_ atau _Checkboxes_ untuk memilih Sektor Bisnis agar karyawan bisa ditempatkan di lebih dari satu bisnis.
  - Tabel _responsive_ dengan _badge_ warna untuk menandai _Role_ (Merah: Super Admin, Kuning: Manajer, Biru: Staf) dan label multi-sektor yang dimiliki.

---

## 4. Alur Kerja (User Flow)

**Skenario: Admin Menambahkan Karyawan Baru**

1. Super Admin masuk ke menu "Karyawan" dan klik tombol "Tambah Karyawan".
2. Muncul _form modal_. Admin mengisi kelengkapan data: Nama Lengkap, NIK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Alamat, No. WA, No. Tlp, dan memilih _Role_.
3. Admin memilih satu atau beberapa Sektor Bisnis (misal: dicentang 'Jasa' dan 'Preloved').
4. Klik "Simpan".
5. Sistem menyimpan data ke tabel `users` (menyertakan _password default_ `Tuba2023`) dan mencatat relasi multi-sektor di tabel penghubung (pivot).
6. Karyawan langsung dapat _login_ menggunakan kredensial (NIK/WA) dan _password_ `Tuba2023`.

---

## 5. Model Data (Database Schema - Supabase PostgreSQL)

Karena satu karyawan bisa berada di banyak bisnis, sistem menggunakan skema **Many-to-Many** dengan tabel perantara (`user_sectors`).

**1. Tabel `business_sectors`**

- `id` (UUID, PK)
- `name` (String, Not Null)
- `description` (Text)
- `is_active` (Boolean, Default: True)
- `created_at` (Timestamptz)

**2. Tabel `users` (Database Karyawan Internal)**

- `id` (UUID, PK)
- `nama_lengkap` (String, Not Null)
- `nik` (String, Unique, Not Null)
- `tempat_lahir` (String)
- `tanggal_lahir` (Date)
- `jenis_kelamin` (Enum: Laki-laki, Perempuan)
- `alamat` (Text)
- `no_wa` (String, Unique)
- `no_tlp` (String)
- `role` (Enum: superadmin, manager, staff)
- `password` (String, Default: 'Tuba2023') _(Catatan: Di tahap produksi sebaiknya di-hash)_
- `is_active` (Boolean, Default: True)
- `created_at` (Timestamptz)

**3. Tabel Pivot `user_sectors` (Relasi Multi-Bisnis)**

- `user_id` (UUID, FK ke tabel `users` ON DELETE CASCADE)
- `sector_id` (UUID, FK ke tabel `business_sectors` ON DELETE CASCADE)
- _(Primary Key Gabungan: `user_id` + `sector_id`)_

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

1. Sistem tidak lagi membutuhkan verifikasi/registrasi _user_ dari _dashboard_ Supabase Auth.
2. Admin dapat memasukkan profil karyawan secara detail (termasuk NIK, Tempat/Tanggal Lahir, Alamat, dll).
3. Pada saat formulir penambahan karyawan disimpan, satu karyawan dapat dikaitkan dengan lebih dari satu Sektor Bisnis tanpa _error_.
4. Karyawan yang baru didaftarkan dapat langsung masuk (_login_) menggunakan kombinasi identitas (seperti NIK atau No. WA) dengan kata sandi bawaan `Tuba2023`.
5. Saat data Sektor Bisnis dihapus atau dinonaktifkan, relasi sektor pada profil karyawan yang bersangkutan ikut terlepas atau tersembunyi tanpa merusak data utama karyawan.
