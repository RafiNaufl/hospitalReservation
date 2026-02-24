"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Modal } from "@/components/ui/modal";

interface Doctor {
  id: string;
  fullName: string;
}

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  maxPatientsPerSlot: number;
  location: string | null;
  doctor: Doctor & {
    specialty: {
      id: string;
      name: string;
    };
  };
}

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function AdminSchedulesPage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState("15");
  const [maxPatientsPerSlot, setMaxPatientsPerSlot] = useState("4");
  const [location, setLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [searchName, setSearchName] = useState("");
  const [filterSpecialtyId, setFilterSpecialtyId] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/schedules")
      .then((response) => response.json())
      .then((data: Schedule[]) => {
        if (!cancelled) {
          setSchedules(data);
        }
      })
      .catch(() => {});

    fetch("/api/admin/doctors")
      .then((response) => response.json())
      .then((data: Doctor[]) => {
        if (!cancelled) {
          setDoctors(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const specialtyOptions = Array.from(
    new Map(
      schedules.map((schedule) => [
        schedule.doctor.specialty.id,
        schedule.doctor.specialty,
      ])
    ).values()
  );

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesName =
      !searchName.trim() ||
      schedule.doctor.fullName
        .toLowerCase()
        .includes(searchName.trim().toLowerCase());
    const matchesSpecialty =
      !filterSpecialtyId ||
      schedule.doctor.specialty.id === filterSpecialtyId;
    return matchesName && matchesSpecialty;
  });

  function parseTime(value: string) {
    const [hourString, minuteString] = value.split(":");
    const hour = Number(hourString);
    const minute = Number(minuteString);
    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
    return hour * 60 + minute;
  }

  function resetForm() {
    setEditingId(null);
    setDoctorId("");
    setDayOfWeek("1");
    setStartTime("08:00");
    setEndTime("12:00");
    setSlotDurationMinutes("15");
    setMaxPatientsPerSlot("4");
    setLocation("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!doctorId) {
      const message = "Silakan pilih dokter";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    if (startMinutes === null || endMinutes === null) {
      const message = "Jam mulai dan jam selesai harus format HH:MM yang valid";
      setError(message);
      toast({
        variant: "destructive",
        title: "Jam tidak valid",
        description: message,
      });
      return;
    }

    if (endMinutes <= startMinutes) {
      const message = "Jam selesai harus setelah jam mulai";
      setError(message);
      toast({
        variant: "destructive",
        title: "Jam tidak valid",
        description: message,
      });
      return;
    }

    const slotDuration = Number(slotDurationMinutes);
    const maxPatients = Number(maxPatientsPerSlot);

    if (!Number.isFinite(slotDuration) || slotDuration < 5) {
      const message = "Durasi per slot minimal 5 menit";
      setError(message);
      toast({
        variant: "destructive",
        title: "Durasi tidak valid",
        description: message,
      });
      return;
    }

    const totalMinutes = endMinutes - startMinutes;
    if (slotDuration >= totalMinutes) {
      const message =
        "Durasi per slot harus lebih kecil dari total durasi praktik";
      setError(message);
      toast({
        variant: "destructive",
        title: "Durasi tidak valid",
        description: message,
      });
      return;
    }

    if (!Number.isFinite(maxPatients) || maxPatients < 1) {
      const message = "Maksimal pasien per slot minimal 1";
      setError(message);
      toast({
        variant: "destructive",
        title: "Kapasitas tidak valid",
        description: message,
      });
      return;
    }

    const payload = {
      doctorId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      slotDurationMinutes: slotDuration,
      maxPatientsPerSlot: maxPatients,
      location: location.trim() || undefined,
    };

    const url = editingId
      ? `/api/admin/schedules/${editingId}`
      : "/api/admin/schedules";
    const method = editingId ? "PATCH" : "POST";

    setLoading(true);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menyimpan jadwal, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan jadwal",
        description: message,
      });
      return;
    }

    resetForm();
    const schedulesResponse = await fetch("/api/admin/schedules");
    const schedulesData = (await schedulesResponse.json()) as Schedule[];
    setSchedules(schedulesData);

    toast({
      variant: "success",
      title: editingId ? "Jadwal diperbarui" : "Jadwal dibuat",
      description: editingId
        ? "Jadwal praktik dokter berhasil diperbarui."
        : "Jadwal praktik dokter baru berhasil dibuat.",
    });

    setFormModalOpen(false);
  }

  async function handleDelete(id: string) {
    setError("");
    const response = await fetch(`/api/admin/schedules/${id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menghapus jadwal, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menghapus jadwal",
        description: message,
      });
      return;
    }

    const schedulesResponse = await fetch("/api/admin/schedules");
    const schedulesData = (await schedulesResponse.json()) as Schedule[];
    setSchedules(schedulesData);

    toast({
      variant: "success",
      title: "Jadwal dihapus",
      description: "Jadwal praktik dokter berhasil dihapus.",
    });

    setDeleteModalOpen(false);
  }

  function handleEdit(schedule: Schedule) {
    setError("");
    setEditingId(schedule.id);
    setDoctorId(schedule.doctor.id);
    setDayOfWeek(String(schedule.dayOfWeek));
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setSlotDurationMinutes(String(schedule.slotDurationMinutes));
    setMaxPatientsPerSlot(String(schedule.maxPatientsPerSlot));
    setLocation(schedule.location ?? "");
    setSelectedSchedule(schedule);
    setFormModalOpen(true);
  }

  function handleCancelEdit() {
    resetForm();
    setFormModalOpen(false);
  }

  function reorderSchedules(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const current = [...schedules];
    const fromIndex = current.findIndex((item) => item.id === sourceId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setSchedules(current);
  }

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manajemen jadwal dokter
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Atur jadwal praktik dokter per hari, jam, dan kapasitas slot.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-sm font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40"
          onClick={() => {
            resetForm();
            setFormModalOpen(true);
          }}
        >
          Tambah jadwal
        </Button>
      </header>

      <section>
        <Card className="border-none bg-white/90 shadow-md shadow-emerald-500/10 ring-1 ring-zinc-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
          <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Daftar jadwal praktik
              </span>
              <div className="flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:gap-3">
                <span className="font-medium">
                  {filteredSchedules.length} dari {schedules.length} jadwal
                </span>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Cari nama dokter..."
                    value={searchName}
                    onChange={(event) => setSearchName(event.target.value)}
                    className="h-8 max-w-xs text-xs"
                  />
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={filterSpecialtyId}
                    onChange={(event) => setFilterSpecialtyId(event.target.value)}
                  >
                    <option value="">Semua poli</option>
                    {specialtyOptions.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {schedules.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada jadwal terdaftar.
              </p>
            )}
            {schedules.length > 0 && filteredSchedules.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tidak ada jadwal yang cocok dengan filter saat ini.
              </p>
            )}
            {filteredSchedules.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">Dokter</th>
                      <th className="px-3 py-2">Poli</th>
                      <th className="px-3 py-2">Hari</th>
                      <th className="px-3 py-2">Jam</th>
                      <th className="px-3 py-2">Slot x kapasitas</th>
                      <th className="px-3 py-2">Lokasi</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        draggable
                        onDragStart={() => setDraggingId(schedule.id)}
                        onDragOver={(event) => {
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggingId) {
                            reorderSchedules(draggingId, schedule.id);
                          }
                          setDraggingId(null);
                        }}
                        className={`border-b border-zinc-100 last:border-0 dark:border-zinc-800 ${
                          draggingId === schedule.id
                            ? "bg-emerald-50/60 dark:bg-zinc-900/80"
                            : "hover:bg-emerald-50/40 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <td className="px-3 py-2">
                          {schedule.doctor.fullName}
                        </td>
                        <td className="px-3 py-2">
                          {schedule.doctor.specialty.name}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              schedule.dayOfWeek === 0
                                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60"
                                : schedule.dayOfWeek === 6
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
                            }`}
                          >
                            {dayNames[schedule.dayOfWeek]}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {schedule.startTime} - {schedule.endTime}
                        </td>
                        <td className="px-3 py-2">
                          {schedule.slotDurationMinutes} menit x{" "}
                          {schedule.maxPatientsPerSlot} pasien
                        </td>
                        <td className="px-3 py-2">
                          {schedule.location || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleEdit(schedule)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setDeleteModalOpen(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Modal
        open={formModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit();
          } else {
            setFormModalOpen(true);
          }
        }}
        title={editingId ? "Ubah jadwal praktik" : "Tambah jadwal praktik"}
        description="Atur jadwal praktik dokter dengan jam dan kapasitas yang jelas."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Dokter
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
            >
              <option value="">Pilih dokter</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Hari
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dayOfWeek}
                onChange={(event) => setDayOfWeek(event.target.value)}
              >
                {dayNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Lokasi
              </label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Contoh: Poli Anak, Lantai 3"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Jam mulai
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Jam selesai
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Durasi per slot (menit)
              </label>
              <Input
                type="number"
                min={5}
                value={slotDurationMinutes}
                onChange={(event) =>
                  setSlotDurationMinutes(event.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Maksimal pasien per slot
            </label>
            <Input
              type="number"
              min={1}
              value={maxPatientsPerSlot}
              onChange={(event) => setMaxPatientsPerSlot(event.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Menyimpan..."
                : editingId
                ? "Simpan perubahan"
                : "Simpan jadwal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleCancelEdit}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false);
            setSelectedSchedule(null);
          } else {
            setDeleteModalOpen(true);
          }
        }}
        title="Hapus jadwal praktik"
        description="Tindakan ini akan menghapus jadwal praktik dari sistem."
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Apakah Anda yakin ingin menghapus jadwal{" "}
          <span className="font-semibold">
            {selectedSchedule
              ? `${selectedSchedule.doctor.fullName} - ${
                  dayNames[selectedSchedule.dayOfWeek]
                }`
              : ""}
          </span>
          ?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedSchedule(null);
            }}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-red-600 hover:bg-red-700"
            onClick={async () => {
              if (!selectedSchedule) return;
              await handleDelete(selectedSchedule.id);
              setDeleteModalOpen(false);
              setSelectedSchedule(null);
            }}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </>
  );
}
