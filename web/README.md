# Sistem Reservasi Rumah Sakit (Hospital Reservation System)

Sistem manajemen reservasi janji temu dokter untuk rumah sakit di Indonesia. Aplikasi ini dirancang untuk memudahkan pasien dalam melakukan booking jadwal dokter, serta membantu dokter dan admin dalam mengelola operasional harian rumah sakit.

## 🚀 Teknologi yang Digunakan

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) dengan [Prisma ORM](https://www.prisma.io/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Testing**: [Vitest](https://vitest.dev/)

## ✨ Fitur Utama

### 🏥 Pasien (Patient)
- **Pencarian Dokter**: Cari dokter berdasarkan spesialisasi.
- **Booking Jadwal**: Reservasi jadwal praktik dokter secara real-time.
- **Dukungan BPJS & Umum**: Mendukung sistem rujukan BPJS dan pasien umum.
- **Riwayat Janji Temu**: Pantau status reservasi dan riwayat kunjungan.
- **Check-in QR Code**: Proses check-in cepat di rumah sakit menggunakan QR Code.

### 👨‍⚕️ Dokter (Doctor)
- **Dashboard Praktik**: Pantau antrean pasien harian secara real-time.
- **Manajemen Status**: Perbarui status pemeriksaan pasien (Check-in, In Progress, Completed).
- **Riwayat Pemeriksaan**: Lihat riwayat pasien yang pernah ditangani.

### ⚙️ Admin
- **Manajemen Master Data**: Kelola data Dokter, Pasien, Spesialisasi, dan Jadwal Praktik.
- **Monitoring Reservasi**: Pantau seluruh janji temu yang ada di rumah sakit.
- **Sistem Otomasi**: Cron job untuk menangani pasien *no-show* dan pengiriman reminder.

## 🛠️ Persiapan & Instalasi

### 1. Prasyarat
- Node.js 20+
- Database PostgreSQL yang sedang berjalan

### 2. Instalasi Dependency
Masuk ke direktori `web` dan instal paket yang dibutuhkan:
```bash
cd web
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di dalam folder `web` dan sesuaikan dengan database Anda:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database & Seeding
Jalankan migrasi database dan isi dengan data awal (seed):
```bash
npx prisma migrate dev
npx prisma db seed
```
*Catatan: Perintah seed akan membuat akun contoh untuk Admin, Dokter, dan Pasien dengan password default `password123`.*

### 5. Menjalankan Aplikasi
```bash
npm run dev
```
Akses aplikasi di [http://localhost:3000](http://localhost:3000).

## 🧪 Pengujian (Testing)

Jalankan rangkaian tes menggunakan Vitest:
```bash
npm run test:run
```

## 👥 Akun Contoh (Hasil Seeding)

Setelah menjalankan `npx prisma db seed`, Anda dapat menggunakan akun berikut untuk mencoba aplikasi:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@rsud.go.id` | `password123` |
| **Dokter** | `dr.andi@rsud.go.id` | `password123` |
| **Pasien** | `pasien@example.com` | `password123` |

## 📝 Catatan Tambahan
- Aplikasi ini menggunakan Bahasa Indonesia sebagai bahasa utama.
- Sistem mendukung integrasi BPJS melalui nomor rujukan (simulasi).
- Gunakan endpoint `/api/cron/*` untuk mensimulasikan tugas terjadwal.
