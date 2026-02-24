"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export interface DoctorsClientSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
}

export interface DoctorsClientDoctor {
  id: string;
  fullName: string;
  location: string | null;
  specialtyId: string;
  specialtyName: string;
  acceptsBpjs: boolean;
  schedules: DoctorsClientSchedule[];
  photoUrl: string | null;
}

export default function DoctorsClient() {
  const [doctors, setDoctors] = useState<DoctorsClientDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Semua poli");
  const [search, setSearch] = useState("");
  const [onlyBpjs, setOnlyBpjs] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/doctors");

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message =
            data?.message ?? "Gagal memuat daftar dokter, silakan coba lagi";
          if (!cancelled) {
            setError(message);
          }
          return;
        }

        type ApiDoctor = {
          id: string;
          fullName: string;
          location: string | null;
          specialty: { id: string; name: string };
          acceptsBpjs: boolean;
          photoUrl: string | null;
          schedules: {
            id: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            location: string | null;
          }[];
        };

        const data = (await response.json()) as ApiDoctor[];

        if (!cancelled) {
          const mapped: DoctorsClientDoctor[] = data.map((doctor) => ({
            id: doctor.id,
            fullName: doctor.fullName,
            location: doctor.location,
            specialtyId: doctor.specialty.id,
            specialtyName: doctor.specialty.name,
            acceptsBpjs: doctor.acceptsBpjs,
            photoUrl: doctor.photoUrl,
            schedules: doctor.schedules.map((schedule) => ({
              id: schedule.id,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              location: schedule.location,
            })),
          }));
          setDoctors(mapped);
        }
      } catch {
        if (!cancelled) {
          setError("Gagal terhubung ke server. Silakan coba beberapa saat lagi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const specialtyOptions = useMemo(() => {
    const names = new Set<string>();
    for (const doctor of doctors) {
      if (doctor.specialtyName) {
        names.add(doctor.specialtyName);
      }
    }
    return ["Semua poli", ...Array.from(names).sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (
        selectedSpecialty !== "Semua poli" &&
        doctor.specialtyName !== selectedSpecialty
      ) {
        return false;
      }

      if (onlyBpjs && !doctor.acceptsBpjs) {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        if (!doctor.fullName.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [doctors, selectedSpecialty, onlyBpjs, search]);

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dokter &amp; Jadwal Praktik
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Lihat daftar dokter, poli, dan jadwal praktik yang tersedia di rumah
            sakit. Gunakan filter di bawah untuk mencari berdasarkan poli,
            nama dokter, dan kepesertaan BPJS.
          </p>
        </header>

        {loading && (
          <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Memuat daftar dokter dan jadwal praktik...
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-40 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="h-3 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-9 w-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-9 w-24 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-red-200 bg-red-50/80 p-5 text-sm text-red-800 shadow-sm dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </section>
        )}

        {!loading && !error && doctors.length === 0 && (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 p-5 text-sm text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-200">
            Belum ada data dokter yang terdaftar. Admin dapat menambahkan dokter
            dan jadwal melalui menu Admin &gt; Manajemen dokter dan Manajemen
            jadwal.
          </section>
        )}

        {!loading && !error && doctors.length > 0 && (
          <>
            <section className="grid gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-4 text-sm shadow-sm md:grid-cols-[2fr,2fr,1.4fr] dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Poli/Spesialis
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  value={selectedSpecialty}
                  onChange={(event) => setSelectedSpecialty(event.target.value)}
                >
                  {specialtyOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  Cari nama dokter
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  placeholder="Ketik minimal 2 huruf nama dokter"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="flex flex-col justify-between gap-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {filteredDoctors.length} dari {doctors.length} dokter sesuai
                  filter.
                </p>
                <label className="inline-flex cursor-pointer items-center justify-end gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <span>{onlyBpjs ? "Hanya dokter BPJS" : "Termasuk non-BPJS"}</span>
                  <button
                    type="button"
                    onClick={() => setOnlyBpjs((value) => !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                      onlyBpjs
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-zinc-400 bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        onlyBpjs ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {filteredDoctors.length} dokter sesuai filter.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Jadwal dapat berubah. Silakan konfirmasi kembali saat melakukan
                  reservasi dan check-in.
                </p>
              </div>
              {filteredDoctors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                  Tidak ada dokter yang cocok dengan filter saat ini. Coba ubah
                  kata kunci atau pilihan poli.
                </div>
              )}
              {filteredDoctors.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDoctors.map((doctor) => {
                    const schedules = doctor.schedules;

                    return (
                      <Card
                        key={doctor.id}
                        className="group flex h-full flex-col overflow-hidden border-zinc-200 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500/70 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90"
                      >
                        <CardHeader className="flex flex-row items-start gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/80 to-emerald-700/80 text-white">
                            {doctor.photoUrl ? (
                              <Image
                                src={doctor.photoUrl}
                                alt={doctor.fullName}
                                width={150}
                                height={150}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                                {doctor.fullName
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")}
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <CardTitle className="truncate text-base font-semibold text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                              {doctor.fullName}
                            </CardTitle>
                            <p className="truncate text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                              {doctor.specialtyName}
                            </p>
                            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                              {doctor.location || schedules[0]?.location || "-"}
                            </p>
                            <div className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  doctor.acceptsBpjs
                                    ? "bg-emerald-500"
                                    : "bg-zinc-400"
                                }`}
                              />
                              <span>
                                {doctor.acceptsBpjs
                                  ? "Menerima pasien BPJS"
                                  : "Hanya pasien umum"}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                          <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                              Jadwal praktik
                            </p>
                            {schedules.length === 0 && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                Jadwal praktik belum diatur.
                              </p>
                            )}
                            {schedules.length > 0 && (
                              <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                {schedules.map((schedule) => {
                                  const dayLabel =
                                    dayNames[schedule.dayOfWeek] ?? "";
                                  return (
                                    <li
                                      key={schedule.id}
                                      className="flex items-start justify-between gap-2 rounded-lg bg-zinc-50 px-2 py-1.5 text-xs ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {dayLabel}
                                        </span>
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                          {schedule.location ||
                                            doctor.location ||
                                            "-"}
                                        </span>
                                      </div>
                                      <span className="shrink-0 text-[11px] font-medium text-zinc-700 dark:text-zinc-200">
                                        {schedule.startTime} - {schedule.endTime}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                          <div className="mt-auto flex flex-wrap gap-2 pt-2">
                            <Button
                              asChild
                              size="sm"
                              className="flex-1 justify-center bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            >
                              <Link
                                href={`/booking?specialtyId=${encodeURIComponent(
                                  doctor.specialtyId
                                )}&doctorId=${encodeURIComponent(doctor.id)}`}
                              >
                                Booking sekarang
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="flex-1 justify-center border-zinc-300 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Link href={`/doctors/${doctor.id}`}>Lihat detail</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
