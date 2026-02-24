import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getServerSession } from "next-auth";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const searchParamsSchema = z.object({
  q: z.string().optional(),
  isBpjs: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

const createPatientSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter" }),
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  nik: z
    .string()
    .min(16, { message: "NIK harus terdiri dari 16 digit" })
    .max(16, { message: "NIK harus terdiri dari 16 digit" }),
  phone: z
    .string()
    .min(8, { message: "Nomor HP minimal 8 digit" })
    .optional()
    .nullable(),
  dateOfBirth: z
    .string()
    .min(1, { message: "Tanggal lahir wajib diisi" }),
  gender: z.enum(["L", "P"]),
  address: z.string().min(5, { message: "Alamat terlalu pendek" }),
  bpjsNumber: z.string().optional().nullable(),
  bpjsClass: z.string().optional().nullable(),
  rmNumber: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola pasien" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const raw = {
    q: url.searchParams.get("q") ?? undefined,
    isBpjs: url.searchParams.get("isBpjs") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  };
  const parsed = searchParamsSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Filter tidak valid" },
      { status: 400 }
    );
  }

  const { q, isBpjs, page, pageSize } = parsed.data;

  const pageNumber = (() => {
    if (!page) return 1;
    const parsedPage = Number(page);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return 1;
    }
    return parsedPage;
  })();

  const resolvedPageSize = (() => {
    if (!pageSize) return 10;
    const parsedSize = Number(pageSize);
    if (Number.isNaN(parsedSize) || parsedSize < 1 || parsedSize > 100) {
      return 10;
    }
    return parsedSize;
  })();

  const where: Prisma.PatientWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { fullName: { contains: q } },
              { nik: { contains: q } },
              { rmNumber: { contains: q } },
            ],
          }
        : {},
      typeof isBpjs === "string" && (isBpjs === "true" || isBpjs === "false")
        ? { isBpjs: isBpjs === "true" }
        : {},
    ],
  };

  const [totalCount, patients] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      orderBy: {
        fullName: "asc",
      },
      skip: (pageNumber - 1) * resolvedPageSize,
      take: resolvedPageSize,
      include: {
        user: true,
        appointments: {
          orderBy: {
            date: "desc",
          },
          take: 5,
          include: {
            doctor: {
              include: {
                specialty: true,
              },
            },
          },
        },
        medicalRecords: {
          take: 1,
          orderBy: {
            lastVisitDate: "desc",
          },
        },
      },
    }),
  ]);

  const totalPages =
    totalCount === 0
      ? 1
      : Math.max(1, Math.ceil(totalCount / resolvedPageSize));

  return NextResponse.json({
    items: patients,
    totalCount,
    page: pageNumber,
    pageSize: resolvedPageSize,
    totalPages,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola pasien" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createPatientSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return NextResponse.json(
      {
        message: "Data pasien tidak valid, periksa kembali input Anda",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    email,
    password,
    fullName,
    nik,
    phone,
    dateOfBirth,
    gender,
    address,
    bpjsNumber,
    bpjsClass,
    rmNumber,
  } = parsed.data;

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  const existingUserByPhone =
    phone && phone.trim().length > 0
      ? await prisma.user.findFirst({
          where: { phone },
        })
      : null;

  const existingPatientByNik = await prisma.patient.findUnique({
    where: { nik },
  });

  const existingPatientByBpjs =
    bpjsNumber && bpjsNumber.trim().length > 0
      ? await prisma.patient.findFirst({
          where: { bpjsNumber },
        })
      : null;

  const existingPatientByRm =
    rmNumber && rmNumber.trim().length > 0
      ? await prisma.patient.findFirst({
          where: { rmNumber },
        })
      : null;

  const duplicateFieldErrors: Record<string, string[]> = {};

  if (existingUserByEmail) {
    duplicateFieldErrors.email = ["Email sudah terdaftar"];
  }

  if (existingUserByPhone) {
    duplicateFieldErrors.phone = ["Nomor HP sudah terdaftar"];
  }

  if (existingPatientByNik) {
    duplicateFieldErrors.nik = ["NIK sudah terdaftar"];
  }

  if (existingPatientByBpjs) {
    duplicateFieldErrors.bpjsNumber = ["Nomor BPJS sudah terdaftar"];
  }

  if (existingPatientByRm) {
    duplicateFieldErrors.rmNumber = ["Nomor rekam medis sudah terdaftar"];
  }

  if (Object.keys(duplicateFieldErrors).length > 0) {
    return NextResponse.json(
      {
        message: "Beberapa data sudah terdaftar, periksa kembali input Anda",
        fieldErrors: duplicateFieldErrors,
      },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const date = new Date(dateOfBirth);

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json(
      { message: "Tanggal lahir tidak valid" },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      phone: phone ?? undefined,
      passwordHash,
      role: "PATIENT",
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      fullName,
      nik,
      rmNumber: rmNumber && rmNumber.trim().length > 0 ? rmNumber : null,
      phone: phone ?? undefined,
      dateOfBirth: date,
      gender,
      address,
      bpjsNumber: bpjsNumber ?? undefined,
      bpjsClass: bpjsClass ?? undefined,
      isBpjs: !!bpjsNumber,
    },
  });

  return NextResponse.json(patient, { status: 201 });
}
