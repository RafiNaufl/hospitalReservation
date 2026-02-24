import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import HomeClient, { HomeDoctor, HomeSpecialty } from "./home-client";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

type DoctorWithRelations = Prisma.DoctorGetPayload<{
  include: {
    specialty: true;
    schedules: true;
  };
}>;

function buildHomeDoctor(doctor: DoctorWithRelations): HomeDoctor | null {
  const schedules = doctor.schedules;

  if (!schedules || schedules.length === 0) {
    return null;
  }

  const daysSet = new Set<string>();
  let earliestStart: string | null = null;
  let latestEnd: string | null = null;

  for (const schedule of schedules) {
    const name = dayNames[schedule.dayOfWeek] ?? "";
    if (name) {
      daysSet.add(name);
    }

    if (!earliestStart || schedule.startTime < earliestStart) {
      earliestStart = schedule.startTime;
    }

    if (!latestEnd || schedule.endTime > latestEnd) {
      latestEnd = schedule.endTime;
    }
  }

  const days = Array.from(daysSet);
  const timeRange =
    earliestStart && latestEnd ? `${earliestStart} - ${latestEnd}` : null;

  return {
    id: doctor.id,
    fullName: doctor.fullName,
    specialtyName: doctor.specialty.name,
    days,
    timeRange,
    acceptsBpjs: doctor.acceptsBpjs,
  };
}

export default async function Home() {
  const [doctors, specialties] = await Promise.all([
    prisma.doctor.findMany({
      include: {
        specialty: true,
        schedules: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),
    prisma.specialty.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const homeDoctors: HomeDoctor[] = doctors
    .map((doctor) => buildHomeDoctor(doctor))
    .filter((doctor): doctor is HomeDoctor => Boolean(doctor));

  const homeSpecialties: HomeSpecialty[] = specialties.map((specialty) => ({
    id: specialty.id,
    name: specialty.name,
  }));

  return <HomeClient doctors={homeDoctors} specialties={homeSpecialties} />;
}
