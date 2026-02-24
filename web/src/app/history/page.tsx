import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string;
    specialtyId?: string;
    doctorId?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedSearchParams = await searchParams;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/history");
  }

  const user = session.user as { id?: string; email?: string };

  if (!user.id) {
    redirect("/login?callbackUrl=/history");
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  if (!patient) {
    redirect("/dashboard");
  }

  const medicalRecord = await prisma.mockMedicalRecord.findFirst({
    where: { patientId: patient.id },
  });

  const pageSize = 10;
  const rawPage = resolvedSearchParams?.page
    ? Number(resolvedSearchParams.page)
    : 1;
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const specialtyId = resolvedSearchParams?.specialtyId || "";
  const doctorId = resolvedSearchParams?.doctorId || "";

  const where = {
    patientId: patient.id,
    status: "COMPLETED" as const,
    doctor: specialtyId
      ? {
          specialtyId,
        }
      : undefined,
    doctorId: doctorId || undefined,
  };

  const [totalCount, appointments, specialties, doctors] = await Promise.all([
    prisma.appointment.count({
      where,
    }),
    prisma.appointment.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { startTime: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        doctor: {
          include: {
            specialty: true,
          },
        },
      },
    }),
    prisma.specialty.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.doctor.findMany({
      where: specialtyId
        ? {
            specialtyId,
          }
        : undefined,
      orderBy: {
        fullName: "asc",
      },
    }),
  ]);

  const totalPages =
    totalCount === 0 ? 1 : Math.max(1, Math.ceil(totalCount / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (specialtyId) {
      params.set("specialtyId", specialtyId);
    }
    if (doctorId) {
      params.set("doctorId", doctorId);
    }
    const query = params.toString();
    return query ? `/history?${query}` : "/history";
  }

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Riwayat kunjungan
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Lihat daftar kunjungan yang sudah selesai dan filter berdasarkan
              poli atau dokter.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Kembali ke dashboard</Button>
          </Link>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-3" method="GET">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Poli / Spesialis
                </label>
                <select
                  name="specialtyId"
                  defaultValue={specialtyId}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="">Semua poli</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Dokter
                </label>
                <select
                  name="doctorId"
                  defaultValue={doctorId}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="">Semua dokter</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Terapkan filter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar kunjungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada kunjungan yang selesai dengan filter saat ini.
              </p>
            )}
            {appointments.length > 0 && (
              <ul className="space-y-3 text-sm">
                {appointments.map((visit) => (
                  <li
                    key={visit.id}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {visit.doctor.fullName}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {visit.doctor.specialty.name}
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
                    {medicalRecord &&
                      (medicalRecord.lastDiagnosis || medicalRecord.summary) && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Diagnosa terakhir:{" "}
                          {medicalRecord.lastDiagnosis || medicalRecord.summary}
                        </p>
                      )}
                    <p className="mt-1 text-xs">
                      <Link
                        href={`/booking/${visit.id}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        Lihat detail kunjungan
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {totalCount > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                  >
                    <Link href={hasPrev ? buildHref(page - 1) : "#"}>
                      Sebelumnya
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                  >
                    <Link href={hasNext ? buildHref(page + 1) : "#"}>
                      Berikutnya
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
