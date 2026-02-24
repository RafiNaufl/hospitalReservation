import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user as { id?: string; email?: string };

  if (!user.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  const upcomingAppointments = patient
    ? await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        take: 5,
        include: {
          doctor: true,
        },
      })
    : [];

  const lastRecord = patient
    ? await prisma.mockMedicalRecord.findFirst({
        where: { patientId: patient.id },
      })
    : null;

  const visitHistory = patient
    ? await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          status: "COMPLETED",
        },
        orderBy: [
          { date: "desc" },
          { startTime: "desc" },
        ],
        take: 5,
        include: {
          doctor: true,
        },
      })
    : [];

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard Pasien
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Selamat datang, {patient?.fullName ?? user.email}
            </p>
          </div>
          <Link href="/booking">
            <Button size="lg">Buat booking baru</Button>
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Janji temu mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Belum ada booking. Silakan buat janji temu baru.
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
                        {appointment.doctor.fullName}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(appointment.date).toLocaleDateString("id-ID")}{" "}
                        • {appointment.startTime} - {appointment.endTime}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Status: {appointment.status.toLowerCase()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profil singkat</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Nama</dt>
                  <dd>{patient?.fullName ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">NIK</dt>
                  <dd>{patient?.nik ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Nomor BPJS
                  </dt>
                  <dd>{patient?.bpjsNumber ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Nomor HP
                  </dt>
                  <dd>{patient?.phone ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Kunjungan terakhir
                  </dt>
                  <dd>
                    {lastRecord?.lastVisitDate
                      ? new Date(lastRecord.lastVisitDate).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Alasan kunjungan terakhir
                  </dt>
                  <dd>
                    {lastRecord?.lastDiagnosis ||
                      lastRecord?.summary ||
                      "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Riwayat kunjungan terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {visitHistory.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Belum ada kunjungan yang selesai.
                </p>
              )}
              {visitHistory.length > 0 && (
                <>
                  <ul className="space-y-3 text-sm">
                    {visitHistory.map((visit) => (
                      <li
                        key={visit.id}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {visit.doctor.fullName}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {new Date(visit.date).toLocaleDateString("id-ID")} •{" "}
                          {visit.startTime} - {visit.endTime}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Tipe kunjungan:{" "}
                          {visit.appointmentType === "BPJS"
                            ? "BPJS"
                            : "Umum / pribadi"}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-right">
                    <Link
                      href="/history"
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Lihat semua riwayat
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
