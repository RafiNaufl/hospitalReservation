"use client";

import Link from "next/link";
import { useState } from "react";

export type HomeDoctor = {
  id: string;
  fullName: string;
  specialtyName: string;
  days: string[];
  timeRange: string | null;
  acceptsBpjs: boolean;
};

export type HomeSpecialty = {
  id: string;
  name: string;
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Siti, 32 tahun",
    role: "Pasien BPJS",
    text: "Proses reservasi sangat mudah, saya tidak perlu antre lama di loket. Tinggal datang sesuai jadwal dan langsung diperiksa.",
  },
  {
    id: 2,
    name: "Andi, 40 tahun",
    role: "Pasien umum",
    text: "Reminder WhatsApp-nya membantu sekali supaya tidak lupa jadwal. Petugas juga sudah siap karena data saya sudah tercatat.",
  },
  {
    id: 3,
    name: "Maya, 29 tahun",
    role: "Ibu pasien anak",
    text: "Bisa cek jadwal dokter anak dulu sebelum datang, jadi saya bisa atur waktu cuti dan perjalanan lebih tenang.",
  },
];

interface HomeClientProps {
  doctors: HomeDoctor[];
  specialties: HomeSpecialty[];
}

export default function HomeClient({ doctors, specialties }: HomeClientProps) {
  const allSpecialtyNames = [
    "Semua Spesialisasi",
    ...specialties.map((specialty) => specialty.name),
  ];

  const [selectedSpecialty, setSelectedSpecialty] = useState(
    "Semua Spesialisasi"
  );
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const filteredDoctors =
    selectedSpecialty === "Semua Spesialisasi"
      ? doctors
      : doctors.filter((doctor) => doctor.specialtyName === selectedSpecialty);

  const currentTestimonial = testimonials[testimonialIndex];

  return (
    <div className="bg-gradient-to-b from-emerald-50/40 to-white dark:from-zinc-950 dark:to-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-16 px-4 py-10 md:py-16">
        <section className="grid gap-10 md:grid-cols-[1.15fr,0.85fr] md:items-center">
          <div>
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">
              Reservasi dokter online · Dukungan BPJS &amp; umum
            </p>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl dark:text-zinc-50">
              Reservasi Dokter Online Tanpa Antre Panjang di RS Contoh Sehat
            </h1>
            <p className="mt-4 max-w-xl text-balance text-sm text-zinc-600 md:text-base dark:text-zinc-400">
              Pilih dokter, atur jadwal, dan lakukan check-in digital dari mana
              saja. Mendukung pasien umum dan BPJS, dengan reminder WhatsApp
              otomatis sebelum kunjungan.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/login?callbackUrl=/booking"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Buat Reservasi Sekarang
              </Link>
              <Link
                href="/doctors"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Lihat Jadwal Dokter
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ★
                </span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    4.8/5 rating pasien
                  </p>
                  <p>Berbasis survei kepuasan internal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Terintegrasi BPJS
                  </p>
                  <p>Dukungan rujukan dan verifikasi kepesertaan</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-white blur-2xl dark:from-emerald-900/30 dark:via-zinc-900 dark:to-zinc-950" />
            <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-100 backdrop-blur-sm dark:border-emerald-900/40 dark:bg-zinc-950/90 dark:shadow-none">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Ringkasan kunjungan hari ini
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Antrian klinik
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    27
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Pasien sudah reservasi online
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    No-show turun
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    32%
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Dengan reminder WhatsApp otomatis
                  </p>
                </div>
              </div>
              <div className="mt-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-3 text-xs text-zinc-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-zinc-200">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Siap untuk pasien berikutnya
                </p>
                <p className="mt-1">
                  Sistem otomatis mengirim reminder H-1 dan H-1 jam sebelum
                  jadwal. Pasien cukup menunjukkan QR check-in di lobby.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="layanan"
          className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 md:text-xl dark:text-zinc-50">
                Layanan utama untuk memudahkan alur kunjungan pasien
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Dirancang untuk mendukung operasional rumah sakit dan pengalaman
                pasien yang lebih nyaman.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Booking mudah
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Pasien memilih poli, dokter, dan jam praktik langsung dari HP
                tanpa perlu telepon.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Check-in digital
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                QR code check-in di lobby, nomor antrean langsung terbentuk di
                sistem.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Reminder otomatis
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Notifikasi WhatsApp dan email H-1 dan H-1 jam sebelum jadwal
                kontrol pasien.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Integrasi BPJS
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Input dan validasi nomor rujukan, sehingga proses administrasi
                di loket lebih cepat.
              </p>
            </div>
          </div>
        </section>

        <section
          id="dokter-jadwal"
          className="grid gap-8 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm md:grid-cols-[1.1fr,0.9fr] dark:border-zinc-800 dark:bg-zinc-950/90"
        >
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 md:text-xl dark:text-zinc-50">
              Mini doctor finder
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Lihat jadwal praktik dokter berdasarkan spesialisasi sebelum
              melakukan reservasi. Data diambil dari jadwal dokter di sistem
              rumah sakit.
            </p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Pilih spesialisasi
                </label>
                <select
                  className="flex h-10 w-full max-w-sm rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  value={selectedSpecialty}
                  onChange={(event) => setSelectedSpecialty(event.target.value)}
                >
                  {allSpecialtyNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-500">
                <p>
                  Informasi jadwal bersumber dari modul jadwal dokter. Silakan
                  masuk ke menu Reservasi Online untuk melihat ketersediaan slot
                  per tanggal.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            {filteredDoctors.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Belum ada jadwal untuk spesialisasi ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {filteredDoctors.map((doctor) => (
                  <li
                    key={doctor.id}
                    className="rounded-2xl border border-zinc-200 bg-white/90 p-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {doctor.fullName}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {doctor.specialtyName}
                    </p>
                    {doctor.days.length > 0 ? (
                      <>
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Jadwal: {doctor.days.join(", ")}
                        </p>
                        {doctor.timeRange && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Jam praktik: {doctor.timeRange}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        Jadwal praktik belum diatur.
                      </p>
                    )}
                    <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {doctor.acceptsBpjs
                        ? "Menerima pasien BPJS & umum"
                        : "Khusus pasien umum"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          id="tentang-kami"
          className="grid gap-8 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm md:grid-cols-[1.1fr,0.9fr] dark:border-zinc-800 dark:bg-zinc-950/90"
        >
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 md:text-xl dark:text-zinc-50">
              Tentang RS Contoh Sehat
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              RS Contoh Sehat adalah rumah sakit umum yang berfokus pada
              pelayanan ramah pasien dengan dukungan teknologi digital. Mulai
              dari pendaftaran, rekam medis, hingga hasil laboratorium, semua
              dapat diakses lebih mudah.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Fasilitas meliputi IGD 24 jam, ICU, NICU, kamar operasi modern,
              klinik spesialis lengkap, serta laboratorium dan radiologi yang
              terintegrasi. Sistem reservasi online ini membantu mengurangi
              penumpukan antrean di lobby dan loket.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Lokasi dan rute
            </p>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <iframe
                title="Lokasi RS Contoh Sehat"
                src="https://www.google.com/maps?q=-6.175392,106.827153&z=15&output=embed"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Lokasi pada peta ini hanya sebagai contoh. Silakan sesuaikan
              dengan alamat resmi rumah sakit Anda.
            </p>
          </div>
        </section>

        <section
          id="testimoni"
          className="grid gap-8 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm md:grid-cols-[1.1fr,0.9fr] dark:border-zinc-800 dark:bg-zinc-950/90"
        >
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 md:text-xl dark:text-zinc-50">
              Apa kata pasien tentang reservasi online
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Testimoni berikut menggambarkan manfaat utama dari sistem reservasi
              dokter bagi pasien dan keluarga.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ★
                </span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    92% pasien
                  </p>
                  <p>Merasa waktu tunggu di lobby lebih singkat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    80% keluarga
                  </p>
                  <p>Lebih mudah mengatur jadwal kontrol rutin</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              “{currentTestimonial.text}”
            </p>
            <div className="mt-1 text-sm">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {currentTestimonial.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentTestimonial.role}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setTestimonialIndex(index)}
                    className={`h-2.5 rounded-full transition ${
                      index === testimonialIndex
                        ? "w-6 bg-emerald-600"
                        : "w-2.5 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    }`}
                    aria-label={`Lihat testimoni ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {testimonialIndex + 1} / {testimonials.length}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-5 text-sm text-zinc-800 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-zinc-100">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Siap menerapkan reservasi dokter online di rumah sakit Anda?
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                Integrasikan sistem ini dengan alur pendaftaran, BPJS, dan
                rekam medis Anda untuk pengalaman pasien yang lebih baik.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login?callbackUrl=/booking"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                Mulai dari Reservasi
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
              >
                Daftar Akun Pasien
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

