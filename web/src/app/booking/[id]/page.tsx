import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RescheduleClient } from "./reschedule-client";
import { QrCodeClient } from "./qr-code-client";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingDetailPage({ params }: Params) {
  const resolvedParams = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    redirect(`/login?callbackUrl=/booking/${resolvedParams.id}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    notFound();
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  if (!patient) {
    notFound();
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      doctor: {
        include: {
          specialty: true,
        },
      },
    },
  });

  if (!appointment || appointment.patientId !== patient.id) {
    notFound();
  }

  const visitDate = new Date(appointment.date);

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Detail booking
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Tunjukkan QR code ini saat check-in di rumah sakit.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Kode booking & QR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <QrCodeClient value={appointment.qrCodeData} />
              </div>
              <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <p>
                  Kode booking:{" "}
                  <span className="font-mono font-semibold">
                    {appointment.bookingCode}
                  </span>
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Simpan screenshot halaman ini atau catat kode booking. Anda
                  dapat melakukan check-in dengan scan QR atau memasukkan kode
                  booking di kiosk.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail janji temu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Dokter
                </span>
                <span className="font-medium text-right">
                  {appointment.doctor.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Poli / Spesialis
                </span>
                <span className="text-right">
                  {appointment.doctor.specialty.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Tanggal
                </span>
                <span className="text-right">
                  {visitDate.toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Jam praktik
                </span>
                <span className="text-right">
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Status
                </span>
                <span className="text-right">
                  {appointment.status.toLowerCase()}
                </span>
              </div>
              {(appointment.status === "BOOKED" ||
                appointment.status === "CHECKED_IN") && (
                <RescheduleClient
                  appointmentId={appointment.id}
                  doctorId={appointment.doctorId}
                />
              )}
              <div className="mt-3">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Kembali ke dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
