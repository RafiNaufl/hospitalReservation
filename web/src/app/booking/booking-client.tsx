"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Specialty {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  fullName: string;
  location: string | null;
  photoUrl: string | null;
  specialty: {
    id: string;
    name: string;
  };
}

type Step = 1 | 2 | 3;

interface BookingClientProps {
  initialSpecialtyId?: string;
  initialDoctorId?: string;
}

export function BookingClient({
  initialSpecialtyId = "",
  initialDoctorId = "",
}: BookingClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(() => {
    if (initialDoctorId) {
      return 3;
    }
    if (initialSpecialtyId) {
      return 2;
    }
    return 1;
  });
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] =
    useState<string>(initialSpecialtyId);
  const [selectedDoctorId, setSelectedDoctorId] =
    useState<string>(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadSpecialties() {
      setLoading(true);
      const response = await fetch("/api/specialties");
      setLoading(false);

      if (!response.ok) {
        const message = "Gagal memuat daftar poli";
        setError(message);
        toast({
          variant: "destructive",
          title: "Gagal memuat data",
          description: message,
        });
        return;
      }

      const data = (await response.json()) as Specialty[];
      setSpecialties(data);
    }

    loadSpecialties();
  }, [toast]);

  useEffect(() => {
    async function loadDoctors() {
      if (!selectedSpecialtyId) {
        setDoctors([]);
        return;
      }

      setLoading(true);
      const response = await fetch(
        `/api/doctors?specialtyId=${encodeURIComponent(selectedSpecialtyId)}`
      );
      setLoading(false);

      if (!response.ok) {
        const message = "Gagal memuat daftar dokter";
        setError(message);
        toast({
          variant: "destructive",
          title: "Gagal memuat data",
          description: message,
        });
        return;
      }

      const data = (await response.json()) as Doctor[];
      setDoctors(data);
    }

    loadDoctors();
  }, [selectedSpecialtyId, toast]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDoctorId || !selectedDate) {
        setSlots([]);
        setSelectedSlot("");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `/api/doctors/${encodeURIComponent(
          selectedDoctorId
        )}/slots?date=${encodeURIComponent(selectedDate)}`
      );
      setLoading(false);

      if (!response.ok) {
        const message = "Gagal memuat jadwal untuk tanggal ini";
        setError(message);
        setSlots([]);
        setSelectedSlot("");
        toast({
          variant: "destructive",
          title: "Gagal memuat jadwal",
          description: message,
        });
        return;
      }

      const data = (await response.json()) as string[];
      setSlots(data);
      setSelectedSlot("");
    }

    loadSlots();
  }, [selectedDoctorId, selectedDate, toast]);

  async function goNext() {
    setError("");
    if (step === 1 && !selectedSpecialtyId) {
      const message = "Silakan pilih poli terlebih dahulu";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }
    if (step === 2 && !selectedDoctorId) {
      const message = "Silakan pilih dokter terlebih dahulu";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }
    if (step === 3 && (!selectedDate || !selectedSlot)) {
      const message = "Silakan pilih tanggal dan jam praktik";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    if (step < 3) {
      setStep((current) => (current + 1) as Step);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        specialtyId: selectedSpecialtyId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        slot: selectedSlot,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data?.message ??
        "Terjadi kesalahan saat menyimpan booking, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan booking",
        description: message,
      });
      return;
    }

    const data = (await response.json()) as { id: string };

    toast({
      variant: "success",
      title: "Booking berhasil dibuat",
      description: "Kode booking dan QR code siap digunakan saat datang ke RS.",
    });

    router.push(`/booking/${data.id}`);
  }

  function goBack() {
    setError("");
    if (step > 1) {
      setStep((current) => (current - 1) as Step);
    } else {
      router.push("/dashboard");
    }
  }

  const selectedSpecialty = specialties.find(
    (item) => item.id === selectedSpecialtyId
  );
  const selectedDoctor = doctors.find((item) => item.id === selectedDoctorId);

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Booking janji temu
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Langkah {step} dari 3: pilih poli, dokter, dan jadwal praktik.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Pilih poli / spesialisasi"}
              {step === 2 && "Pilih dokter"}
              {step === 3 && "Pilih tanggal dan jam praktik"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Memuat data...
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    type="button"
                    onClick={() => setSelectedSpecialtyId(specialty.id)}
                    className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm ${
                      selectedSpecialtyId === specialty.id
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950"
                        : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="font-medium">{specialty.name}</span>
                  </button>
                ))}
                {specialties.length === 0 && !loading && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Belum ada data poli.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                      selectedDoctorId === doctor.id
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950"
                        : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {doctor.photoUrl ? (
                        <Image
                          src={doctor.photoUrl}
                          alt={doctor.fullName}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                          {doctor.fullName
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="truncate font-medium">
                        {doctor.fullName}
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {doctor.location ?? doctor.specialty.name}
                      </span>
                    </div>
                  </button>
                ))}
                {doctors.length === 0 && !loading && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Belum ada data dokter untuk poli ini.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    Tanggal kunjungan
                  </label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    Pilih jam praktik
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full border px-4 py-2 text-xs font-medium ${
                          selectedSlot === slot
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950"
                            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {selectedDate && slots.length === 0 && !loading && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Tidak ada slot tersedia pada tanggal ini. Silakan pilih
                      tanggal lain.
                    </p>
                  )}
                </div>
                {selectedSpecialty && selectedDoctor && (
                  <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                    <p className="font-medium">Ringkasan pilihan</p>
                    <p>
                      Poli:{" "}
                      <span className="font-medium">
                        {selectedSpecialty.name}
                      </span>
                    </p>
                    <p>
                      Dokter:{" "}
                      <span className="font-medium">
                        {selectedDoctor.fullName}
                      </span>
                    </p>
                    <p>
                      Jadwal:{" "}
                      <span className="font-medium">
                        {selectedDate || "-"} {selectedSlot && `• ${selectedSlot}`}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Pada tahap berikutnya, sistem akan membuat kode booking dan
                      QR code.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={goBack}>
                Kembali
              </Button>
              <Button type="button" onClick={goNext}>
                {step === 3 ? "Simpan booking" : "Lanjut"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
