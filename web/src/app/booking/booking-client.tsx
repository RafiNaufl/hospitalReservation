"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope, 
  Clock, 
  ClipboardList, 
  CheckCircle2, 
  UserCircle2,
  Building2,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Specialty {
  id: string;
  name: string;
  description?: string | null;
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
    if (initialDoctorId) return 3;
    if (initialSpecialtyId) return 2;
    return 1;
  });

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(initialSpecialtyId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<"GENERAL" | "BPJS">("GENERAL");
  const [notes, setNotes] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadSpecialties() {
      setLoading(true);
      try {
        const response = await fetch("/api/specialties");
        if (!response.ok) throw new Error("Gagal memuat daftar poli");
        const data = await response.json();
        setSpecialties(data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Gagal memuat data",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
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
      try {
        const response = await fetch(`/api/doctors?specialtyId=${encodeURIComponent(selectedSpecialtyId)}`);
        if (!response.ok) throw new Error("Gagal memuat daftar dokter");
        const data = await response.json();
        setDoctors(data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Gagal memuat data",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
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
      try {
        const response = await fetch(`/api/doctors/${encodeURIComponent(selectedDoctorId)}/slots?date=${encodeURIComponent(selectedDate)}`);
        if (!response.ok) throw new Error("Gagal memuat jadwal");
        const data = await response.json();
        setSlots(data);
        setSelectedSlot("");
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Gagal memuat jadwal",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, [selectedDoctorId, selectedDate, toast]);

  async function goNext() {
    setError("");
    if (step === 1 && !selectedSpecialtyId) {
      toast({ variant: "destructive", title: "Form belum lengkap", description: "Silakan pilih poli terlebih dahulu" });
      return;
    }
    if (step === 2 && !selectedDoctorId) {
      toast({ variant: "destructive", title: "Form belum lengkap", description: "Silakan pilih dokter terlebih dahulu" });
      return;
    }
    if (step === 3) {
      if (!selectedDate || !selectedSlot) {
        toast({ variant: "destructive", title: "Form belum lengkap", description: "Silakan pilih tanggal dan jam praktik" });
        return;
      }
      if (!notes.trim()) {
        toast({ variant: "destructive", title: "Form belum lengkap", description: "Keluhan wajib diisi" });
        return;
      }
    }

    if (step < 3) {
      setStep((current) => (current + 1) as Step);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialtyId: selectedSpecialtyId,
          doctorId: selectedDoctorId,
          date: selectedDate,
          slot: selectedSlot,
          notes: notes,
          appointmentType: appointmentType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Gagal menyimpan booking");
      }

      const data = await response.json();
      toast({
        variant: "success",
        title: "Booking berhasil!",
        description: "Janji temu Anda telah dijadwalkan.",
      });
      router.push(`/booking/${data.id}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (step > 1) {
      setStep((current) => (current - 1) as Step);
      window.scrollTo(0, 0);
    } else {
      router.push("/dashboard");
    }
  }

  const selectedSpecialty = specialties.find(s => s.id === selectedSpecialtyId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Stepper Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Booking Janji Temu</h1>
            <Badge variant="outline" className="bg-white dark:bg-zinc-900">Step {step} of 3</Badge>
          </div>
          
          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  step >= s 
                    ? "border-emerald-600 bg-emerald-600 text-white" 
                    : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold">{s}</span>}
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {s === 1 ? "Poli" : s === 2 ? "Dokter" : "Jadwal"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  onClick={() => setSelectedSpecialtyId(specialty.id)}
                  className={`group relative flex flex-col items-start gap-4 rounded-3xl border p-6 text-left transition-all hover:shadow-xl ${
                    selectedSpecialtyId === specialty.id
                      ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/20"
                      : "border-white bg-white hover:border-emerald-200 dark:border-zinc-900 dark:bg-zinc-900 dark:hover:border-emerald-800"
                  }`}
                >
                  <div className={`rounded-2xl p-3 transition-colors ${
                    selectedSpecialtyId === specialty.id ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 dark:bg-zinc-800"
                  }`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{specialty.name}</h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">Layanan medis spesialis {specialty.name.toLowerCase()}</p>
                  </div>
                  {selectedSpecialtyId === specialty.id && (
                    <div className="absolute right-4 top-4 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="mb-2 -ml-2 text-zinc-500">
                <ChevronLeft className="mr-1 h-4 w-4" /> Ganti Poli
              </Button>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    className={`group relative flex items-center gap-4 rounded-3xl border p-4 text-left transition-all hover:shadow-lg ${
                      selectedDoctorId === doctor.id
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/20"
                        : "border-white bg-white hover:border-emerald-200 dark:border-zinc-900 dark:bg-zinc-900 dark:hover:border-emerald-800"
                    }`}
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                      {doctor.photoUrl ? (
                        <Image src={doctor.photoUrl} alt={doctor.fullName} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-xl font-bold text-emerald-600">
                          {doctor.fullName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{doctor.fullName}</h3>
                      <p className="text-xs text-emerald-600 font-medium">{doctor.specialty.name}</p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{doctor.location || "RS Sehat Pusat"}</span>
                      </div>
                    </div>
                    {selectedDoctorId === doctor.id && (
                      <div className="absolute right-4 top-4 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      Pilih Waktu Kunjungan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tanggal Kunjungan</label>
                      <Input 
                        type="date" 
                        value={selectedDate} 
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-2xl border-zinc-200 bg-zinc-50/50 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Jam Praktik Tersedia
                      </label>
                      {slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                                selectedSlot === slot
                                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                                  : "bg-zinc-50 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 border border-dashed border-zinc-200 dark:border-zinc-700">
                          <AlertCircle className="h-8 w-8 text-zinc-300 mb-2" />
                          <p className="text-xs text-zinc-500">
                            {selectedDate ? "Tidak ada jadwal tersedia" : "Pilih tanggal terlebih dahulu"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-emerald-600" />
                      Detail Kunjungan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tipe Pasien</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAppointmentType("GENERAL")}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                            appointmentType === "GENERAL"
                              ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <UserCircle2 className={`h-6 w-6 ${appointmentType === "GENERAL" ? "text-emerald-600" : "text-zinc-400"}`} />
                          <span className="text-xs font-bold">Pasien Umum</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppointmentType("BPJS")}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                            appointmentType === "BPJS"
                              ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <CreditCard className={`h-6 w-6 ${appointmentType === "BPJS" ? "text-emerald-600" : "text-zinc-400"}`} />
                          <span className="text-xs font-bold">Pasien BPJS</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Keluhan Utama <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        placeholder="Tuliskan keluhan atau alasan kunjungan Anda secara detail..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none overflow-hidden sticky top-24">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Stethoscope className="h-24 w-24" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Ringkasan Booking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold">Dokter</p>
                      <p className="font-bold leading-tight">{selectedDoctor?.fullName}</p>
                      <p className="text-xs text-emerald-50 opacity-80">{selectedSpecialty?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold">Waktu</p>
                      <p className="font-bold">{selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : "-"}</p>
                      <p className="text-xs">{selectedSlot || "Jam belum dipilih"}</p>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Tipe Layanan</span>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                          {appointmentType === "BPJS" ? "BPJS Kesehatan" : "Mandiri/Umum"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Button variant="ghost" onClick={goBack} className="rounded-2xl px-8 font-bold">
            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Button 
            onClick={goNext} 
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-12 py-6 text-base font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 dark:shadow-none"
          >
            {loading ? "Memproses..." : step === 3 ? "Konfirmasi Booking" : "Lanjut"} 
            {step < 3 && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </div>
    </main>
  );
}
