import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardClient } from "./dashboard-client";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

interface SearchParams {
  from?: string;
  to?: string;
  specialtyId?: string;
}

async function updateAppointmentStatus(formData: FormData) {
  "use server";

  const appointmentId = formData.get("appointmentId");
  const status = formData.get("status");

  if (typeof appointmentId !== "string" || typeof status !== "string") {
    return;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return;
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return;
  }

  if (status === "COMPLETED") {
    if (appointment.status !== "CHECKED_IN") {
      return;
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED",
      },
    });

    const existingRecord = await prisma.mockMedicalRecord.findFirst({
      where: { patientId: appointment.patientId },
    });

    if (existingRecord) {
      await prisma.mockMedicalRecord.update({
        where: { id: existingRecord.id },
        data: {
          lastVisitDate: new Date(),
        },
      });
    } else {
      await prisma.mockMedicalRecord.create({
        data: {
          patientId: appointment.patientId,
          lastVisitDate: new Date(),
        },
      });
    }
  }

  if (status === "CANCELLED") {
    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED" ||
      appointment.status === "NO_SHOW"
    ) {
      return;
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledReason: "Dibatalkan melalui dashboard admin",
      },
    });
  }

  revalidatePath("/admin/dashboard");
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as { role?: string }).role) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const now = new Date();
  const defaultFrom = startOfDay(now);
  const defaultTo = endOfDay(now);

  const from = resolvedSearchParams.from
    ? startOfDay(new Date(resolvedSearchParams.from))
    : defaultFrom;
  const to = resolvedSearchParams.to
    ? endOfDay(new Date(resolvedSearchParams.to))
    : defaultTo;

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: from,
        lte: to,
      },
      doctor: resolvedSearchParams.specialtyId
        ? {
            specialtyId: resolvedSearchParams.specialtyId,
          }
        : undefined,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialty: true,
        },
      },
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
      { doctor: { fullName: "asc" } },
    ],
  });

  const specialties = await prisma.specialty.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const total = appointments.length;
  const checkedIn = appointments.filter(
    (item) => item.status === "CHECKED_IN"
  ).length;
  const completed = appointments.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const cancelled = appointments.filter(
    (item) => item.status === "CANCELLED"
  ).length;
  const noShow = appointments.filter(
    (item) => item.status === "NO_SHOW"
  ).length;

  const checkedInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard admin
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pantau aktivitas booking pasien dan performa operasional rumah sakit.
        </p>
      </header>

      <section className="mt-4">
        <Card className="overflow-hidden border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/50">
          <CardHeader className="border-b border-zinc-100/80 pb-4 dark:border-zinc-800/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Filter data booking
                </CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Saring data berdasarkan rentang waktu dan poliklinik
                </p>
              </div>
              <span className="inline-flex w-fit items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/60">
                ● Realtime
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Dari tanggal
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="from"
                    defaultValue={from.toISOString().slice(0, 10)}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Sampai tanggal
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="to"
                    defaultValue={to.toISOString().slice(0, 10)}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Poliklinik
                </label>
                <select
                  name="specialtyId"
                  defaultValue={resolvedSearchParams.specialtyId ?? ""}
                  className="flex h-10 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">Semua poli</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-zinc-900/20 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Terapkan Filter
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <AdminDashboardClient
        stats={{
          total,
          checkedIn,
          completed,
          cancelled,
          noShow,
          checkedInRate,
          completionRate,
        }}
      />

      <section className="mt-4">
        <Card className="overflow-hidden border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-100/80 pb-4 dark:border-zinc-800/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Daftar Booking Terpilih
                </CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Menampilkan data kunjungan pada rentang waktu yang difilter
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {total} Data
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tidak ada data</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Belum ada booking pada rentang tanggal ini.</p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
                      <tr>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Informasi Dokter</th>
                        <th className="px-6 py-4">Data Pasien</th>
                        <th className="px-6 py-4">Status Kunjungan</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {appointments.map((item) => (
                        <tr
                          key={item.id}
                          className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                                {item.startTime} - {item.endTime}
                              </span>
                              <span className="text-[10px] text-zinc-500">WIB</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                                {item.doctor.fullName}
                              </span>
                              <span className="inline-flex w-fit items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-400">
                                {item.doctor.specialty.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {item.patient.fullName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight ${
                                item.status === "CHECKED_IN"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : item.status === "COMPLETED"
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                                  : item.status === "CANCELLED"
                                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                                  : item.status === "NO_SHOW"
                                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                item.status === "CHECKED_IN" ? "bg-emerald-500" :
                                item.status === "COMPLETED" ? "bg-indigo-500" :
                                item.status === "CANCELLED" ? "bg-orange-500" :
                                item.status === "NO_SHOW" ? "bg-red-500" : "bg-zinc-400"
                              }`} />
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {item.status === "CHECKED_IN" && (
                                <form action={updateAppointmentStatus}>
                                  <input type="hidden" name="appointmentId" value={item.id} />
                                  <input type="hidden" name="status" value="COMPLETED" />
                                  <button
                                    type="submit"
                                    className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-600 px-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                                  >
                                    Selesai
                                  </button>
                                </form>
                              )}
                              {(item.status === "BOOKED" || item.status === "CHECKED_IN") && (
                                <form action={updateAppointmentStatus}>
                                  <input type="hidden" name="appointmentId" value={item.id} />
                                  <input type="hidden" name="status" value="CANCELLED" />
                                  <button
                                    type="submit"
                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-[11px] font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 dark:border-red-900/30 dark:bg-zinc-900 dark:hover:bg-red-950/20 active:scale-95"
                                  >
                                    Batal
                                  </button>
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 p-4 md:hidden">
                  {appointments.map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Waktu</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${
                            item.status === "CHECKED_IN"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : item.status === "COMPLETED"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                              : item.status === "CANCELLED"
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                              : item.status === "NO_SHOW"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          <span className={`h-1 w-1 rounded-full ${
                            item.status === "CHECKED_IN" ? "bg-emerald-500" :
                            item.status === "COMPLETED" ? "bg-indigo-500" :
                            item.status === "CANCELLED" ? "bg-orange-500" :
                            item.status === "NO_SHOW" ? "bg-red-500" : "bg-zinc-400"
                          }`} />
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 grid gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dokter & Poli</span>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.doctor.fullName}</span>
                            <span className="inline-flex w-fit items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {item.doctor.specialty.name}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pasien</span>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.patient.fullName}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                        {item.status === "CHECKED_IN" && (
                          <form action={updateAppointmentStatus} className="flex-1">
                            <input type="hidden" name="appointmentId" value={item.id} />
                            <input type="hidden" name="status" value="COMPLETED" />
                            <button
                              type="submit"
                              className="inline-flex w-full h-10 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                            >
                              Selesaikan Kunjungan
                            </button>
                          </form>
                        )}
                        {(item.status === "BOOKED" || item.status === "CHECKED_IN") && (
                          <form action={updateAppointmentStatus} className="flex-1">
                            <input type="hidden" name="appointmentId" value={item.id} />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <button
                              type="submit"
                              className="inline-flex w-full h-10 items-center justify-center rounded-xl border border-red-200 bg-white text-xs font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 dark:border-red-900/30 dark:bg-zinc-900 dark:hover:bg-red-950/20 active:scale-95"
                            >
                              Batalkan
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

    </>
  );
}
