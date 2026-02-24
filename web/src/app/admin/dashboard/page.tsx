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

      <section className="mt-2">
        <Card className="overflow-hidden border-none bg-gradient-to-r from-emerald-50/80 via-sky-50/80 to-emerald-50/80 shadow-none ring-1 ring-emerald-100/60 dark:from-zinc-900 dark:via-emerald-950/30 dark:to-zinc-900 dark:ring-emerald-900/60">
          <CardHeader className="border-b border-emerald-100/70 bg-white/60 pb-4 backdrop-blur-sm dark:border-emerald-900/70 dark:bg-zinc-950/60">
            <CardTitle className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Filter data booking
              </span>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70">
                Realtime
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Dari tanggal
                </label>
                <input
                  type="date"
                  name="from"
                  defaultValue={from.toISOString().slice(0, 10)}
                  className="flex h-9 w-full rounded-xl border border-emerald-100 bg-white/80 px-2 text-xs text-zinc-900 shadow-sm shadow-emerald-500/5 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Sampai tanggal
                </label>
                <input
                  type="date"
                  name="to"
                  defaultValue={to.toISOString().slice(0, 10)}
                  className="flex h-9 w-full rounded-xl border border-emerald-100 bg-white/80 px-2 text-xs text-zinc-900 shadow-sm shadow-emerald-500/5 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Poli
                </label>
                <select
                  name="specialtyId"
                  defaultValue={resolvedSearchParams.specialtyId ?? ""}
                  className="flex h-9 w-full rounded-xl border border-emerald-100 bg-white/80 px-2 text-xs text-zinc-900 shadow-sm shadow-emerald-500/5 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50"
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
                  className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Terapkan filter
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

      <section className="rounded-2xl border border-white/80 bg-white/90 shadow-md shadow-emerald-500/10 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <CardHeader className="border-b border-zinc-100/70 pb-3 dark:border-zinc-800/70">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Daftar booking pada rentang tanggal terpilih
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {total} booking ditemukan
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {appointments.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Belum ada booking pada rentang tanggal ini.
            </p>
          )}
          {appointments.length > 0 && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-200/80 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">Jam</th>
                      <th className="px-3 py-2">Dokter</th>
                      <th className="px-3 py-2">Poli</th>
                      <th className="px-3 py-2">Pasien</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
                      >
                        <td className="px-3 py-2">
                          {item.startTime} - {item.endTime}
                        </td>
                        <td className="px-3 py-2">{item.doctor.fullName}</td>
                        <td className="px-3 py-2">
                          {item.doctor.specialty.name}
                        </td>
                        <td className="px-3 py-2">{item.patient.fullName}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                              item.status === "CHECKED_IN"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
                                : item.status === "COMPLETED"
                                ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60"
                                : item.status === "CANCELLED"
                                ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60"
                                : item.status === "NO_SHOW"
                                ? "bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60"
                                : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
                            }`}
                          >
                            {item.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "CHECKED_IN" && (
                              <form action={updateAppointmentStatus}>
                                <input
                                  type="hidden"
                                  name="appointmentId"
                                  value={item.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="COMPLETED"
                                />
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-sm shadow-emerald-500/30 transition hover:translate-y-px hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/40"
                                >
                                  Selesaikan
                                </button>
                              </form>
                            )}
                            {(item.status === "BOOKED" ||
                              item.status === "CHECKED_IN") && (
                              <form action={updateAppointmentStatus}>
                                <input
                                  type="hidden"
                                  name="appointmentId"
                                  value={item.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="CANCELLED"
                                />
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-xl border border-red-500 px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition hover:translate-y-px hover:bg-red-50 hover:shadow-md hover:shadow-red-500/20 dark:border-red-500/70 dark:text-red-300 dark:hover:bg-red-950/40"
                                >
                                  Batalkan
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
              <div className="mt-3 space-y-2 md:hidden">
                {appointments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-100 bg-white/95 p-3 text-xs shadow-sm shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-950/90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Jam
                        </div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {item.startTime} - {item.endTime}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                          item.status === "CHECKED_IN"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
                            : item.status === "COMPLETED"
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60"
                            : item.status === "CANCELLED"
                            ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60"
                            : item.status === "NO_SHOW"
                            ? "bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60"
                            : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
                        }`}
                      >
                        {item.status.toLowerCase()}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2">
                      <div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Dokter
                        </div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {item.doctor.fullName}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {item.doctor.specialty.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Pasien
                        </div>
                        <div className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.patient.fullName}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      {item.status === "CHECKED_IN" && (
                        <form action={updateAppointmentStatus}>
                          <input
                            type="hidden"
                            name="appointmentId"
                            value={item.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="COMPLETED"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm shadow-emerald-500/30 transition hover:translate-y-px hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/40"
                          >
                            Selesaikan
                          </button>
                        </form>
                      )}
                      {(item.status === "BOOKED" ||
                        item.status === "CHECKED_IN") && (
                        <form action={updateAppointmentStatus}>
                          <input
                            type="hidden"
                            name="appointmentId"
                            value={item.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="CANCELLED"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-red-500 px-3 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:translate-y-px hover:bg-red-50 hover:shadow-md hover:shadow-red-500/20 dark:border-red-500/70 dark:text-red-300 dark:hover:bg-red-950/40"
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
      </section>
    </>
  );
}
