"use client";

import { TrendingUp, Activity, Users, CalendarClock } from "lucide-react";

interface StatusStats {
  total: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  noShow: number;
  checkedInRate: number;
  completionRate: number;
}

interface Props {
  stats: StatusStats;
}

export function AdminDashboardClient({ stats }: Props) {
  const distribution = [
    {
      key: "BOOKED",
      label: "Booked",
      value:
        stats.total -
        stats.checkedIn -
        stats.completed -
        stats.cancelled -
        stats.noShow,
      color: "#0ea5e9",
    },
    {
      key: "CHECKED_IN",
      label: "Check-in",
      value: stats.checkedIn,
      color: "#10b981",
    },
    {
      key: "COMPLETED",
      label: "Selesai",
      value: stats.completed,
      color: "#6366f1",
    },
    {
      key: "CANCELLED",
      label: "Batal",
      value: stats.cancelled,
      color: "#f97316",
    },
    {
      key: "NO_SHOW",
      label: "No-show",
      value: stats.noShow,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const maxValue =
    distribution.length > 0
      ? Math.max(...distribution.map((item) => item.value))
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-emerald-600 p-4 text-white shadow-xl shadow-emerald-500/40">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-black/10" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-50/80">
                  Hari ini
                </p>
                <p className="mt-1 text-sm text-emerald-50/80">
                  Total booking terdaftar
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-50">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight">
                {stats.total}
              </span>
              <span className="text-xs text-emerald-50/80">
                booking terjadwal
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-emerald-50/80">
                    Check-in rate
                  </span>
                  <span className="text-sm font-semibold">
                    {stats.checkedInRate}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-emerald-50/80">
                    Completion rate
                  </span>
                  <span className="text-sm font-semibold">
                    {stats.completionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-emerald-500/10 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Sudah check-in
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.checkedIn}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${stats.checkedInRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Dari {stats.total} booking, {stats.checkedIn} pasien sudah check-in.
          </p>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-emerald-500/10 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Selesai dilayani
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.completed}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Persentase booking yang sudah selesai diperiksa dokter.
          </p>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-emerald-500/10 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Batal / No-show
          </p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {stats.cancelled + stats.noShow}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-2 py-1.5 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <span>Batal: {stats.cancelled}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-2 py-1.5 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>No-show: {stats.noShow}</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Pantau tren pembatalan untuk perbaikan proses reminder.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md shadow-emerald-500/10 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Distribusi status booking
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Grafik batang interaktif untuk melihat sebaran status booking hari
              ini.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Selesai</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Batal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>No-show</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="relative flex flex-1 items-end gap-3 overflow-hidden rounded-xl bg-zinc-50 px-3 py-4 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
            {distribution.length === 0 && (
              <p className="w-full text-center text-xs text-zinc-500 dark:text-zinc-400">
                Belum ada data booking untuk ditampilkan.
              </p>
            )}
            {distribution.map((item) => {
              const height =
                maxValue > 0 ? 20 + (item.value / maxValue) * 60 : 0;
              return (
                <div
                  key={item.key}
                  className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
                >
                  <div
                    className="relative flex w-full items-end justify-center rounded-full bg-gradient-to-t from-zinc-200/60 to-zinc-100/10 p-0.5 dark:from-zinc-800/70 dark:to-zinc-900/10"
                    style={{ height }}
                  >
                    <div
                      className="relative w-full rounded-full bg-gradient-to-t shadow-md shadow-emerald-500/10 transition-all group-hover:scale-[1.03]"
                      style={{
                        backgroundImage: `linear-gradient(to top, ${item.color}, ${item.color}AA)`,
                      }}
                    />
                    <div className="pointer-events-none absolute -top-6 rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-zinc-50 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-zinc-50 dark:text-zinc-900">
                      {item.value} booking
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex w-full flex-col gap-2 rounded-xl bg-zinc-50 p-3 text-xs ring-1 ring-zinc-100 md:w-56 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                Total booking
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                Aktif (booked + check-in)
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {stats.total - stats.cancelled - stats.noShow}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                Tidak hadir / batal
              </span>
              <span className="font-semibold text-red-600 dark:text-red-300">
                {stats.cancelled + stats.noShow}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

