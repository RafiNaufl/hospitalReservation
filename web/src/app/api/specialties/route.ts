import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
  });

  if (specialties.length === 0) {
    await prisma.specialty.createMany({
      data: [
        { name: "Umum", description: "Poli umum" },
        { name: "Anak", description: "Spesialis anak" },
        { name: "Jantung", description: "Spesialis jantung" },
        { name: "Gigi", description: "Poli gigi" },
      ],
      skipDuplicates: true,
    });

    specialties = await prisma.specialty.findMany({
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json(specialties);
}

