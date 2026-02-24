import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter" }),
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  nik: z
    .string()
    .min(16, { message: "NIK harus terdiri dari 16 digit" })
    .max(16, { message: "NIK harus terdiri dari 16 digit" }),
  phone: z.string().min(8, { message: "Nomor HP minimal 8 digit" }),
  dateOfBirth: z
    .string()
    .min(1, { message: "Tanggal lahir wajib diisi" }),
  gender: z.enum(["L", "P"]),
  address: z.string().min(5, { message: "Alamat terlalu pendek" }),
  bpjsNumber: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return NextResponse.json(
      {
        message: "Data registrasi tidak valid, periksa kembali input Anda",
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

  const existingPatientByNik = await prisma.patient.findUnique({
    where: { nik },
  });

  const existingPatientByBpjs =
    bpjsNumber && bpjsNumber.trim().length > 0
      ? await prisma.patient.findFirst({
          where: { bpjsNumber },
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

  await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: "PATIENT",
      patient: {
        create: {
          fullName,
          nik,
          phone,
          dateOfBirth: date,
          gender,
          address,
          bpjsNumber: bpjsNumber ?? undefined,
          isBpjs: !!bpjsNumber,
        },
      },
    },
  });

  return NextResponse.json(
    { message: "Registrasi berhasil" },
    { status: 201 }
  );
}
