import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const specialtyId = url.searchParams.get("specialtyId");

  let doctors = await prisma.doctor.findMany({
    where: specialtyId ? { specialtyId } : undefined,
    include: {
      specialty: true,
      schedules: true,
    },
    orderBy: { fullName: "asc" },
  });

  if (doctors.length === 0) {
    const specialties = await prisma.specialty.findMany();

    if (specialties.length > 0) {
      const umum = specialties.find((item) => item.name === "Umum");
      const anak = specialties.find((item) => item.name === "Anak");
      const jantung = specialties.find((item) => item.name === "Jantung");
      const gigi = specialties.find((item) => item.name === "Gigi");

      const doctorsToCreate = [
        umum && {
          fullName: "dr. Andi Pratama",
          specialtyId: umum.id,
          location: "Poli Umum",
        },
        anak && {
          fullName: "dr. Siti Lestari, Sp.A",
          specialtyId: anak.id,
          location: "Poli Anak",
        },
        jantung && {
          fullName: "dr. Budi Hartono, Sp.JP",
          specialtyId: jantung.id,
          location: "Poli Jantung",
        },
        gigi && {
          fullName: "drg. Rina Kurnia",
          specialtyId: gigi.id,
          location: "Poli Gigi",
        },
      ].filter(Boolean) as Prisma.DoctorCreateManyInput[];

      if (doctorsToCreate.length > 0) {
        await prisma.doctor.createMany({
          data: doctorsToCreate,
        });
      }

      doctors = await prisma.doctor.findMany({
        where: specialtyId ? { specialtyId } : undefined,
        include: {
          specialty: true,
          schedules: true,
        },
        orderBy: { fullName: "asc" },
      });
    }
  }

  return NextResponse.json(doctors);
}
