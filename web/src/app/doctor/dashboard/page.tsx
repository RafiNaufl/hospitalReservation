import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { AutoRefreshClient } from "./auto-refresh-client";

function buildSlotStart(date: Date, time: string) {
  const [hour, minute] = time.split(":").map((value) => Number(value));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return date;
  }
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

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

async function updateAppointmentStatus(formData: FormData) {
  "use server";

  const appointmentId = formData.get("appointmentId");
  const status = formData.get("status");
  const diagnosisValue = formData.get("diagnosis");

  const diagnosis =
    typeof diagnosisValue === "string" ? diagnosisValue.trim() : "";

  if (typeof appointmentId !== "string" || typeof status !== "string") {
    return;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "DOCTOR") {
    return;
  }

  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    return;
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId },
  });

  if (!doctor) {
    return;
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.doctorId !== doctor.id) {
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
          lastDiagnosis: diagnosis || existingRecord.lastDiagnosis,
          summary: diagnosis || existingRecord.summary,
        },
      });
    } else {
      await prisma.mockMedicalRecord.create({
        data: {
          patientId: appointment.patientId,
          lastVisitDate: new Date(),
          lastDiagnosis: diagnosis || null,
          summary: diagnosis || null,
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
        cancelledReason: "Dibatalkan melalui dashboard dokter",
      },
    });
  }

  if (status === "NO_SHOW") {
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
        status: "NO_SHOW",
      },
    });
  }

  revalidatePath("/doctor/dashboard");
}

interface SearchParams {
  status?: string;
  q?: string;
  month?: string;
}

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as { role?: string }).role) {
    redirect("/login?callbackUrl=/doctor/dashboard");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "DOCTOR") {
    redirect("/dashboard");
  }

  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    redirect("/login?callbackUrl=/doctor/dashboard");
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId },
  });

  if (!doctor) {
    redirect("/dashboard");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthParam = resolvedSearchParams.month;

  const currentMonth = monthParam
    ? new Date(`${monthParam}-01T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const [appointments, monthlyAppointmentDates, recentCheckIns, recentReschedules] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          patient: true,
          checkInLogs: true,
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      }),
      prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          date: true,
        },
      }),
      prisma.checkInLog.findMany({
        where: {
          appointment: {
            doctorId: doctor.id,
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
        include: {
          appointment: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: {
          checkedInAt: "desc",
        },
        take: 10,
      }),
      prisma.notificationLog.findMany({
        where: {
          type: "RESCHEDULED",
          appointment: {
            doctorId: doctor.id,
          },
        },
        include: {
          appointment: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: {
          sentAt: "desc",
        },
        take: 10,
      }),
    ]);

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      date: {
        gt: todayEnd,
      },
    },
    include: {
      patient: true,
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
    ],
    take: 5,
  });

  const totalToday = appointments.length;
  const checkedIn = appointments.filter(
    (item) => item.status === "CHECKED_IN"
  ).length;
  const completed = appointments.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const noShow = appointments.filter(
    (item) => item.status === "NO_SHOW"
  ).length;

  const bpjsCount = appointments.filter(
    (item) => item.appointmentType === "BPJS"
  ).length;
  const generalCount = appointments.filter(
    (item) => item.appointmentType === "GENERAL"
  ).length;

  const noShowRate =
    totalToday > 0 ? Math.round((noShow / totalToday) * 100) : 0;

  const queue = appointments
    .filter((item) => item.status === "CHECKED_IN")
    .map((item) => {
      const queueNumber =
        item.checkInLogs.length > 0
          ? item.checkInLogs[0].queueNumber
          : null;
      return { ...item, queueNumber };
    })
    .sort((a, b) => {
      if (a.queueNumber == null && b.queueNumber == null) return 0;
      if (a.queueNumber == null) return 1;
      if (b.queueNumber == null) return -1;
      return a.queueNumber - b.queueNumber;
    });

  const selectedStatus = resolvedSearchParams.status;

  const filteredAppointments =
    selectedStatus && selectedStatus !== "ALL"
      ? appointments.filter((item) => item.status === selectedStatus)
      : appointments;

  const monthlyDatesSet = new Set(
    monthlyAppointmentDates.map((item) =>
      new Date(item.date).toISOString().slice(0, 10)
    )
  );

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  for (
    let cursor = calendarStart;
    cursor <= calendarEnd;
    cursor = addDays(cursor, 1)
  ) {
    days.push(cursor);
  }

  const searchQuery = resolvedSearchParams.q?.trim() ?? "";

  const patientSearchResults =
    searchQuery.length > 0
      ? await prisma.patient.findMany({
          where: {
            AND: [
              {
                appointments: {
                  some: {
                    doctorId: doctor.id,
                  },
                },
              },
              {
                OR: [
                  { nik: searchQuery },
                  {
                    fullName: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    appointments: {
                      some: {
                        bookingCode: searchQuery,
                        doctorId: doctor.id,
                      },
                    },
                  },
                ],
              },
            ],
          },
          include: {
            appointments: {
              where: {
                doctorId: doctor.id,
              },
              orderBy: [
                { date: "desc" },
                { startTime: "desc" },
              ],
              take: 1,
            },
            medicalRecords: true,
          },
          take: 5,
        })
      : [];

  function formatStatusLabel(
    status: string,
    date: Date,
    startTime: string
  ): { label: string; className: string } {
    const slotStart = buildSlotStart(date, startTime);
    const nowDate = new Date();
    const isLate =
      slotStart.getTime() + 15 * 60000 < nowDate.getTime() &&
      (status === "BOOKED" || status === "CHECKED_IN");

    if (status === "CHECKED_IN") {
      return {
        label: isLate ? "Check-in (terlambat)" : "Sudah check-in",
        className:
          "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
      };
    }

    if (status === "COMPLETED") {
      return {
        label: "Selesai",
        className:
          "inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
      };
    }

    if (status === "CANCELLED") {
      return {
        label: "Dibatalkan",
        className:
          "inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60",
      };
    }

    if (status === "NO_SHOW") {
      return {
        label: "Tidak hadir",
        className:
          "inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60",
      };
    }

    if (status === "BOOKED") {
      if (isLate) {
        return {
          label: "Terlambat",
          className:
            "inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/60",
        };
      }

      return {
        label: "Upcoming",
        className:
          "inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
      };
    }

    return {
      label: status.toLowerCase(),
      className:
        "inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700",
    };
  }

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-6xl space-y-6">
        <AutoRefreshClient />
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard dokter
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Dokter: {doctor.fullName}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total appointment hari ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Check-in / selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                <span className="font-semibold">{checkedIn}</span> check-in
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                <span className="font-semibold">{completed}</span> selesai
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>No-show rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{noShowRate}%</p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  dari {totalToday} appointment
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${noShowRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>BPJS vs Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>BPJS</span>
                <span className="font-semibold">{bpjsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Umum</span>
                <span className="font-semibold">{generalCount}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width:
                      totalToday > 0
                        ? `${Math.round(
                            (bpjsCount / totalToday) * 100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr,1.2fr]">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Appointment hari ini</CardTitle>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredAppointments.length} dari {totalToday} appointment
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/doctor/dashboard"
                  className={`inline-flex items-center rounded-full px-3 py-1 ${
                    !selectedStatus || selectedStatus === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  Semua
                </Link>
                <Link
                  href="/doctor/dashboard?status=BOOKED"
                  className={`inline-flex items-center rounded-full px-3 py-1 ${
                    selectedStatus === "BOOKED"
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  Upcoming
                </Link>
                <Link
                  href="/doctor/dashboard?status=CHECKED_IN"
                  className={`inline-flex items-center rounded-full px-3 py-1 ${
                    selectedStatus === "CHECKED_IN"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  Sudah check-in
                </Link>
                <Link
                  href="/doctor/dashboard?status=COMPLETED"
                  className={`inline-flex items-center rounded-full px-3 py-1 ${
                    selectedStatus === "COMPLETED"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  Selesai
                </Link>
                <Link
                  href="/doctor/dashboard?status=NO_SHOW"
                  className={`inline-flex items-center rounded-full px-3 py-1 ${
                    selectedStatus === "NO_SHOW"
                      ? "bg-red-600 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  No-show
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {totalToday === 0 && (
                <p className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
                  Belum ada pasien terdaftar untuk hari ini.
                </p>
              )}
              {totalToday > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      <tr>
                        <th className="px-3 py-2">Jam</th>
                        <th className="px-3 py-2">Pasien</th>
                        <th className="px-3 py-2">Pembayaran</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Keluhan / ringkasan</th>
                        <th className="px-3 py-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((item) => {
                        const statusProps = formatStatusLabel(
                          item.status,
                          item.date,
                          item.startTime
                        );

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-zinc-100 last:border-0 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
                          >
                            <td className="px-3 py-2">
                              {item.startTime} - {item.endTime}
                            </td>
                            <td className="px-3 py-2">
                              {item.patient.fullName}
                            </td>
                            <td className="px-3 py-2">
                              {item.appointmentType === "BPJS"
                                ? "BPJS"
                                : "Umum"}
                            </td>
                            <td className="px-3 py-2">
                              <span className={statusProps.className}>
                                {statusProps.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                              <span className="line-clamp-2">
                                Ringkasan diagnosa terakhir akan terisi
                                otomatis setelah kunjungan selesai.
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex flex-col items-end gap-1">
                                {item.status === "CHECKED_IN" && (
                                  <form
                                    action={updateAppointmentStatus}
                                    className="flex flex-col items-end gap-1"
                                  >
                                    <input
                                      type="text"
                                      name="diagnosis"
                                      placeholder="Ringkasan diagnosa"
                                      className="h-8 w-40 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                    />
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
                                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                      Mulai konsultasi
                                    </button>
                                  </form>
                                )}
                                {(item.status === "BOOKED" ||
                                  item.status === "CHECKED_IN") && (
                                  <div className="flex gap-2">
                                    <form action={updateAppointmentStatus}>
                                      <input
                                        type="hidden"
                                        name="appointmentId"
                                        value={item.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="status"
                                        value="NO_SHOW"
                                      />
                                      <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-md border border-amber-500 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                                      >
                                        Tandai no-show
                                      </button>
                                    </form>
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
                                        className="inline-flex items-center justify-center rounded-md border border-red-500 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                      >
                                        Batalkan
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Antrean saat ini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {queue.length === 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Belum ada pasien yang sudah check-in.
                  </p>
                )}
                {queue.length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {queue.map((item, index) => {
                      const estimatedWaitMinutes = index * 15;
                      return (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
                      >
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            No antrean{" "}
                            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {item.queueNumber ?? "-"}
                            </span>
                          </p>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {item.patient.fullName}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.startTime} - {item.endTime}
                            {estimatedWaitMinutes > 0 && (
                              <>
                                {" "}
                                • Est. tunggu ± {estimatedWaitMinutes} menit
                              </>
                            )}
                          </p>
                        </div>
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
                            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Tandai selesai
                          </button>
                        </form>
                      </li>
                    );
                  })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle>Notifikasi</CardTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                    {recentCheckIns.length +
                      recentReschedules.length +
                      noShow}
                  </span>
                  <span>Hari ini</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {recentCheckIns.length === 0 &&
                  recentReschedules.length === 0 &&
                  noShow === 0 && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Belum ada notifikasi penting hari ini.
                    </p>
                  )}
                {recentCheckIns.length > 0 && (
                  <div>
                    <p className="mb-1 font-medium text-zinc-800 dark:text-zinc-100">
                      Check-in baru
                    </p>
                    <ul className="space-y-1">
                      {recentCheckIns.map((log) => (
                        <li key={log.id}>
                          <span className="font-semibold">
                            {log.appointment.patient.fullName}
                          </span>{" "}
                          melakukan check-in (no antrean{" "}
                          {log.queueNumber})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {noShow > 0 && (
                  <div>
                    <p className="mt-2 mb-1 font-medium text-zinc-800 dark:text-zinc-100">
                      No-show hari ini
                    </p>
                    <p>
                      Terdapat{" "}
                      <span className="font-semibold">{noShow}</span>{" "}
                      pasien yang tidak hadir sesuai jadwal.
                    </p>
                  </div>
                )}
                {recentReschedules.length > 0 && (
                  <div>
                    <p className="mt-2 mb-1 font-medium text-zinc-800 dark:text-zinc-100">
                      Permintaan reschedule
                    </p>
                    <ul className="space-y-1">
                      {recentReschedules.map((item) => (
                        <li key={item.id}>
                          <span className="font-semibold">
                            {item.appointment.patient.fullName}
                          </span>{" "}
                          melakukan penjadwalan ulang untuk tanggal{" "}
                          {new Date(
                            item.appointment.date
                          ).toLocaleDateString("id-ID")}{" "}
                          jam {item.appointment.startTime}.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.6fr,1.4fr]">
          <Card>
            <CardHeader className="flex items-center justify-between pb-3">
              <div>
                <CardTitle>Mini kalender</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Titik hijau menandakan hari dengan jadwal terisi.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href={`/doctor/dashboard?month=${format(
                    addDays(monthStart, -1),
                    "yyyy-MM"
                  )}`}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Sebelumnya
                </Link>
                <Link
                  href={`/doctor/dashboard?month=${format(
                    addDays(monthEnd, 1),
                    "yyyy-MM"
                  )}`}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Berikutnya
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
                <span>Min</span>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
                {days.map((day) => {
                  const iso = day.toISOString().slice(0, 10);
                  const isToday =
                    iso === now.toISOString().slice(0, 10);
                  const inCurrentMonth =
                    day.getMonth() === currentMonth.getMonth();
                  const hasBooking = monthlyDatesSet.has(iso);

                  return (
                    <div
                      key={iso}
                      className={`flex h-9 flex-col items-center justify-center rounded-md border text-[11px] ${
                        isToday
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                          : inCurrentMonth
                          ? "border-zinc-200 text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                          : "border-zinc-100 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {hasBooking && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Belum ada appointment terjadwal setelah hari ini.
                </p>
              )}
              {upcomingAppointments.length > 0 && (
                <ul className="space-y-3 text-sm">
                  {upcomingAppointments.map((appointment) => (
                    <li
                      key={appointment.id}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {appointment.patient.fullName}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(
                          appointment.date
                        ).toLocaleDateString("id-ID")}{" "}
                        • {appointment.startTime} - {appointment.endTime}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Tipe appointment:{" "}
                        {appointment.appointmentType === "BPJS"
                          ? "BPJS"
                          : "Umum"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Pencarian cepat pasien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex flex-col gap-2 md:flex-row" method="GET">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Cari dengan NIK, nama, atau kode booking"
                  className="flex h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Cari
                </button>
              </form>

              {searchQuery && patientSearchResults.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tidak ditemukan pasien untuk kata kunci tersebut.
                </p>
              )}

              {patientSearchResults.length > 0 && (
                <ul className="space-y-3 text-sm">
                  {patientSearchResults.map((patient) => {
                    const lastAppointment = patient.appointments[0];
                    const record = patient.medicalRecords[0];

                    return (
                      <li
                        key={patient.id}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          NIK: {patient.nik}
                        </p>
                        {lastAppointment && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Appointment terakhir:{" "}
                            {new Date(
                              lastAppointment.date
                            ).toLocaleDateString("id-ID")}{" "}
                            • {lastAppointment.startTime} -{" "}
                            {lastAppointment.endTime}
                          </p>
                        )}
                        {record && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Diagnosa utama: {record.lastDiagnosis || "-"} •
                            Alergi: {record.allergies || "-"}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
