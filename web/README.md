## Sistem Reservasi Dokter Rumah Sakit

Aplikasi ini adalah sistem reservasi dokter untuk rumah sakit di Indonesia, dibangun dengan:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- NextAuth untuk autentikasi

## Menjalankan secara lokal

Install dependency di folder `web`:

```bash
cd web
npm install
```

Jalankan development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Pastikan file `.env` di folder `web` sudah berisi `DATABASE_URL` Postgres yang valid.

## Build & cek TypeScript

Di folder `web`:

```bash
npm run lint    # cek linting
npm run build   # build production + type-checking
```

## Testing (Vitest)

Untuk menjalankan seluruh test Vitest:

```bash
cd web
npm run test:run
```

Saat ini test mencakup:

- `tests/api-doctors.test.ts`  
  - Menguji endpoint `/api/doctors` termasuk seeding otomatis dan filter `specialtyId`.
- `tests/api-endpoints-existence.test.ts`  
  - Memastikan semua file `src/app/api/**/route.ts` memiliki handler HTTP (`GET`/`POST`/dll) dan dapat di-import tanpa error.

Untuk mode interactive/watch:

```bash
npm run test
```

## Fitur utama

- Reservasi dokter untuk pasien (role `PATIENT`)
- Dashboard dokter (role `DOCTOR`)
- Panel admin untuk mengelola:
  - Dokter & jadwal praktik
  - Pasien
  - Janji temu (appointments)
  - Poli/spesialis
- Endpoint check-in dan cron sederhana untuk:
  - Menandai `NO_SHOW`
  - Mengirim reminder (simulasi)

## Catatan role akses

- Pasien:
  - Mengakses halaman publik dan dashboard pasien.
  - Dapat melihat halaman “Dokter & Jadwal Praktik”.
- Dokter:
  - Email : dokter@example.com
  - Password : dokter12345
  - Menggunakan `/doctor/dashboard` untuk memantau jadwal dan pasien.
  - Tidak dapat mengakses halaman publik “Dokter & Jadwal Praktik” (`/doctors` dan `/doctors/[id]` akan di-redirect ke dashboard dokter).
- Admin:
  - Email : admin@example.com
  - Password : admin12345
  - Mengakses halaman `/admin/**` dan endpoint `/api/admin/**`.

## Deploy

Aplikasi dapat dideploy seperti aplikasi Next.js pada umumnya (misalnya ke Vercel atau server Node.js biasa) dengan langkah standar:

```bash
cd web
npm run build
npm run start
```
