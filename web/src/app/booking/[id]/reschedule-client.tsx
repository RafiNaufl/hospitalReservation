"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  appointmentId: string;
  doctorId: string;
}

export function RescheduleClient({ appointmentId, doctorId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLoadSlots() {
    setError("");
    setSlots([]);
    setSlot("");

    if (!date) {
      setError("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    setLoading(true);
    const response = await fetch(
      `/api/doctors/${encodeURIComponent(
        doctorId
      )}/slots?date=${encodeURIComponent(date)}`
    );
    setLoading(false);

    if (!response.ok) {
      setError("Gagal memuat jadwal untuk tanggal ini");
      return;
    }

    const data = (await response.json()) as string[];
    setSlots(data);

    if (data.length === 0) {
      setError(
        "Tidak ada slot tersedia pada tanggal ini. Silakan pilih tanggal lain."
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!date || !slot) {
      setError("Tanggal dan jam wajib dipilih");
      return;
    }

    setLoading(true);
    const response = await fetch(
      `/api/appointments/${encodeURIComponent(appointmentId)}/reschedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          slot,
        }),
      }
    );
    setLoading(false);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(
        data?.message ??
          "Terjadi kesalahan saat mengubah jadwal, silakan coba lagi"
      );
      return;
    }

    router.push(`/booking/${data.id}`);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        Ubah jadwal (reschedule)
      </Button>
    );
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Tanggal baru
        </label>
        <input
          type="date"
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Jam baru
          </label>
          <button
            type="button"
            onClick={handleLoadSlots}
            className="text-xs font-medium text-emerald-600 hover:underline"
          >
            Muat slot
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {slots.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSlot(value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                slot === value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          Batal
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan jadwal baru"}
        </Button>
      </div>
    </form>
  );
}

