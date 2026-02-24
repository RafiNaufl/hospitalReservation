import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export async function GET() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(specialties);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola poli" },
      { status: 403 }
    );
  }

  const json = await request.json().catch(() => null);
  const body = bodySchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { message: "Data poli tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.specialty.findUnique({
    where: { name: body.data.name },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Nama poli sudah digunakan" },
      { status: 400 }
    );
  }

  const specialty = await prisma.specialty.create({
    data: {
      name: body.data.name,
      description: body.data.description || null,
    },
  });

  return NextResponse.json(specialty, { status: 201 });
}

