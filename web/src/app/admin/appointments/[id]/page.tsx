import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminAppointmentDetailPage({
  params,
}: PageProps) {
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/appointments/${resolvedParams.id}`);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      patient: true,
      doctor: {
        include: {
          specialty: true,
        },
      },
      doctorSchedule: true,
    },
  });

  if (!appointment) {
    notFound();
  }

  const visitDate = new Date(appointment.date);

  function formatAppointmentStatus(status: string) {
    if (status === "BOOKED") return "Booked";
    if (status === "CHECKED_IN") return "Sudah check-in";
    if (status === "COMPLETED") return "Selesai";
    if (status === "CANCELLED") return "Dibatalkan";
    if (status === "NO_SHOW") return "Tidak hadir";
    return status;
  }

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Detail appointment pasien
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Lihat informasi lengkap janji temu pasien dan dokter terkait.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="hidden text-xs font-medium text-emerald-600 hover:underline md:inline"
          >
            Kembali ke dashboard admin
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
          <Card className="border-none bg-white/95 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
            <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Informasi janji temu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Kode booking
                </span>
                <span className="font-mono font-semibold">
                  {appointment.bookingCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Tanggal kunjungan
                </span>
                <span>
                  {visitDate.toLocaleDateString("id-ID")} •{" "}
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Dokter
                </span>
                <span className="max-w-[60%] text-right font-medium">
                  {appointment.doctor.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Poli / Spesialis
                </span>
                <span className="max-w-[60%] text-right">
                  {appointment.doctor.specialty.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Jenis appointment
                </span>
                <span className="text-right">
                  {appointment.appointmentType === "BPJS"
                    ? "BPJS"
                    : "Umum / pribadi"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Status
                </span>
                <span className="text-right">
                  {formatAppointmentStatus(appointment.status)}
                </span>
              </div>
              {appointment.doctorSchedule && (
                <div className="mt-2 rounded-lg bg-zinc-50/80 p-3 text-xs text-zinc-600 ring-1 ring-zinc-100 dark:bg-zinc-900/80 dark:text-zinc-300 dark:ring-zinc-800">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Info jadwal praktik
                  </p>
                  <p>
                    Lokasi:{" "}
                    {appointment.doctorSchedule.location || "Tidak ditentukan"}
                  </p>
                  <p>
                    Durasi per slot:{" "}
                    {appointment.doctorSchedule.slotDurationMinutes} menit
                  </p>
                  <p>
                    Kapasitas per slot:{" "}
                    {appointment.doctorSchedule.maxPatientsPerSlot} pasien
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-white/95 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
            <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Data pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Nama</span>
                <span className="max-w-[60%] text-right font-medium">
                  {appointment.patient.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">NIK</span>
                <span className="max-w-[60%] text-right">
                  {appointment.patient.nik}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  No. rekam medis
                </span>
                <span className="max-w-[60%] text-right">
                  {appointment.patient.rmNumber ?? "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Tanggal lahir
                </span>
                <span className="max-w-[60%] text-right">
                  {appointment.patient.dateOfBirth
                    ? new Date(
                        appointment.patient.dateOfBirth
                      ).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Jenis kelamin
                </span>
                <span className="max-w-[60%] text-right">
                  {appointment.patient.gender === "L"
                    ? "Laki-laki"
                    : appointment.patient.gender === "P"
                    ? "Perempuan"
                    : appointment.patient.gender}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  No. BPJS
                </span>
                <span className="max-w-[60%] text-right">
                  {appointment.patient.bpjsNumber
                    ? `${appointment.patient.bpjsNumber}${
                        appointment.patient.bpjsClass
                          ? ` (${appointment.patient.bpjsClass})`
                          : ""
                      }`
                    : "-"}
                </span>
              </div>
              {appointment.patient.address && (
                <div className="mt-2 rounded-lg bg-zinc-50/80 p-3 text-xs text-zinc-600 ring-1 ring-zinc-100 dark:bg-zinc-900/80 dark:text-zinc-300 dark:ring-zinc-800">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Alamat pasien
                  </p>
                  <p>{appointment.patient.address}</p>
                </div>
              )}
              <div className="mt-3">
                <Link
                  href="/admin/patients"
                  className="inline-flex h-9 w-full items-center justify-center rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm shadow-emerald-500/30 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Kembali ke manajemen pasien
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

