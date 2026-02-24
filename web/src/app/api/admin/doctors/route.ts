import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  fullName: z.string().min(3),
  specialtyId: z.string().cuid(),
  location: z.string().optional(),
  acceptsBpjs: z.boolean().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(8),
});

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    include: {
      specialty: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return NextResponse.json(doctors);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola dokter" },
      { status: 403 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data dokter tidak valid" },
      { status: 400 }
    );
  }

  const {
    fullName,
    specialtyId,
    location,
    acceptsBpjs,
    email,
    password,
    phone,
  } = parsed.data;

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  const existingUserByPhone =
    phone.trim().length > 0
      ? await prisma.user.findFirst({
          where: { phone },
        })
      : null;

  if (existingUserByEmail || existingUserByPhone) {
    const reasons = [];
    if (existingUserByEmail) {
      reasons.push("email");
    }
    if (existingUserByPhone) {
      reasons.push("nomor HP");
    }
    const message =
      reasons.length === 1
        ? `${reasons[0]} sudah terdaftar, gunakan ${reasons[0]} lain`
        : "Email dan nomor HP sudah terdaftar, gunakan data lain";

    return NextResponse.json({ message }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: "DOCTOR",
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      fullName,
      specialtyId,
      location,
      acceptsBpjs,
      userId: user.id,
    },
  });

  return NextResponse.json(doctor, { status: 201 });
}
