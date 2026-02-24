import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function DoctorDetailPage({ params }: Params) {
  const session = await getServerSession(authOptions);

  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  const resolvedParams = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id: resolvedParams.id },
    include: {
      specialty: true,
      schedules: true,
    },
  });

  if (!doctor) {
    notFound();
  }

  const sortedSchedules = [...doctor.schedules].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Detail dokter
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Informasi lengkap dokter dan jadwal praktik di rumah sakit.
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,1.4fr]">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/80 to-emerald-700/80 text-white">
                {doctor.photoUrl ? (
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.fullName}
                    width={150}
                    height={150}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                    {doctor.fullName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {doctor.fullName}
                </CardTitle>
                <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {doctor.specialty.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {doctor.location || "Lokasi praktik belum diatur"}
                </p>
                <div className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      doctor.acceptsBpjs ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                  <span>
                    {doctor.acceptsBpjs
                      ? "Menerima pasien BPJS"
                      : "Hanya pasien umum"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Pengalaman
                </span>
                <span>
                  {doctor.experienceYears
                    ? `${doctor.experienceYears} tahun`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Rating pasien
                </span>
                <span>
                  {doctor.ratingAverage && doctor.ratingAverage > 0
                    ? `${doctor.ratingAverage.toFixed(1)} / 5`
                    : "Belum ada rating"}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Data ini hanya contoh. Integrasi rating dan pengalaman dapat
                disesuaikan dengan sistem rumah sakit Anda.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jadwal praktik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              {sortedSchedules.length === 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Jadwal praktik belum diatur untuk dokter ini. Silakan cek
                  kembali atau hubungi rumah sakit.
                </p>
              )}
              {sortedSchedules.length > 0 && (
                <ul className="space-y-2">
                  {sortedSchedules.map((schedule) => {
                    const dayLabel = dayNames[schedule.dayOfWeek] ?? "";
                    return (
                      <li
                        key={schedule.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-800 dark:text-zinc-100">
                            {dayLabel}
                          </span>
                          <span className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {schedule.location ||
                              doctor.location ||
                              "Lokasi belum diatur"}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-zinc-800 dark:text-zinc-100">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Jadwal dapat berubah sewaktu-waktu. Konfirmasi kembali saat
                melakukan booking atau check-in.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  className="flex-1 justify-center bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Link
                    href={`/booking?specialtyId=${encodeURIComponent(
                      doctor.specialtyId
                    )}&doctorId=${encodeURIComponent(doctor.id)}`}
                  >
                    Booking sekarang
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 justify-center border-zinc-300 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Link href="/doctors">Lihat dokter lain</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
