import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const patchPatientSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  fullName: z.string().min(3).optional(),
  nik: z.string().min(16).max(16).optional(),
  rmNumber: z.string().optional().nullable(),
  phone: z.string().min(8).optional().nullable(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["L", "P"]).optional(),
  address: z.string().optional(),
  bpjsNumber: z.string().optional().nullable(),
  bpjsClass: z.string().optional().nullable(),
  isBpjs: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola pasien" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: params.data.id },
    include: {
      user: true,
      appointments: {
        orderBy: {
          date: "desc",
        },
        include: {
          doctor: {
            include: {
              specialty: true,
            },
          },
        },
      },
      medicalRecords: {
        orderBy: {
          lastVisitDate: "desc",
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(patient);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola pasien" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = patchPatientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data pasien tidak valid" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: params.data.id },
    include: {
      user: true,
    },
  });

  if (!patient || !patient.user) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const {
    email,
    password,
    fullName,
    nik,
    rmNumber,
    phone,
    dateOfBirth,
    gender,
    address,
    bpjsNumber,
    bpjsClass,
    isBpjs,
  } = parsed.data;

  if (!email && !password && !fullName && !nik && !rmNumber && !phone && !dateOfBirth && !gender && !address && !bpjsNumber && !bpjsClass && typeof isBpjs === "undefined") {
    return NextResponse.json(
      { message: "Tidak ada perubahan yang dikirim" },
      { status: 400 }
    );
  }

  if (email && email !== patient.user.email) {
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email sudah terdaftar, gunakan email lain" },
        { status: 400 }
      );
    }
  }

  if (phone && phone.trim().length > 0 && phone !== (patient.user.phone ?? "")) {
    const existingUserByPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: patient.user.id },
      },
    });

    if (existingUserByPhone) {
      return NextResponse.json(
        { message: "Nomor HP sudah terdaftar, gunakan nomor lain" },
        { status: 400 }
      );
    }
  }

  if (nik && nik !== patient.nik) {
    const existingPatientByNik = await prisma.patient.findFirst({
      where: {
        nik,
        NOT: { id: patient.id },
      },
    });

    if (existingPatientByNik) {
      return NextResponse.json(
        { message: "NIK sudah terdaftar pada pasien lain" },
        { status: 400 }
      );
    }
  }

  if (bpjsNumber && bpjsNumber.trim().length > 0 && bpjsNumber !== (patient.bpjsNumber ?? "")) {
    const existingPatientByBpjs = await prisma.patient.findFirst({
      where: {
        bpjsNumber,
        NOT: { id: patient.id },
      },
    });

    if (existingPatientByBpjs) {
      return NextResponse.json(
        { message: "Nomor BPJS sudah terdaftar pada pasien lain" },
        { status: 400 }
      );
    }
  }

  if (rmNumber && rmNumber.trim().length > 0 && rmNumber !== (patient.rmNumber ?? "")) {
    const existingPatientByRm = await prisma.patient.findFirst({
      where: {
        rmNumber,
        NOT: { id: patient.id },
      },
    });

    if (existingPatientByRm) {
      return NextResponse.json(
        { message: "Nomor rekam medis sudah terdaftar pada pasien lain" },
        { status: 400 }
      );
    }
  }

  const userUpdateData: {
    email?: string;
    phone?: string | null;
    passwordHash?: string;
  } = {};

  if (email && email !== patient.user.email) {
    userUpdateData.email = email;
  }

  if (typeof phone !== "undefined") {
    userUpdateData.phone =
      phone && phone.trim().length > 0 ? phone : null;
  }

  if (password) {
    userUpdateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const patientUpdateData: {
    fullName?: string;
    nik?: string;
    rmNumber?: string | null;
    phone?: string | null;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    bpjsNumber?: string | null;
    bpjsClass?: string | null;
    isBpjs?: boolean;
  } = {};

  if (fullName) {
    patientUpdateData.fullName = fullName;
  }

  if (nik) {
    patientUpdateData.nik = nik;
  }

  if (typeof rmNumber !== "undefined") {
    patientUpdateData.rmNumber =
      rmNumber && rmNumber.trim().length > 0 ? rmNumber : null;
  }

  if (typeof phone !== "undefined") {
    patientUpdateData.phone =
      phone && phone.trim().length > 0 ? phone : null;
  }

  if (dateOfBirth) {
    const date = new Date(dateOfBirth);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { message: "Tanggal lahir tidak valid" },
        { status: 400 }
      );
    }
    patientUpdateData.dateOfBirth = date;
  }

  if (gender) {
    patientUpdateData.gender = gender;
  }

  if (address) {
    patientUpdateData.address = address;
  }

  if (typeof bpjsNumber !== "undefined") {
    patientUpdateData.bpjsNumber =
      bpjsNumber && bpjsNumber.trim().length > 0 ? bpjsNumber : null;
  }

  if (typeof bpjsClass !== "undefined") {
    patientUpdateData.bpjsClass =
      bpjsClass && bpjsClass.trim().length > 0 ? bpjsClass : null;
  }

  if (typeof isBpjs !== "undefined") {
    patientUpdateData.isBpjs = isBpjs;
  } else if (typeof bpjsNumber !== "undefined") {
    patientUpdateData.isBpjs = !!bpjsNumber;
  }

  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: patient.userId },
      data: userUpdateData,
    });
  }

  const updatedPatient = await prisma.patient.update({
    where: { id: patient.id },
    data: patientUpdateData,
  });

  return NextResponse.json(updatedPatient);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola pasien" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: params.data.id },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const [appointmentCount, referralCount, recordCount] = await Promise.all([
    prisma.appointment.count({
      where: { patientId: patient.id },
    }),
    prisma.bpjsReferral.count({
      where: { patientId: patient.id },
    }),
    prisma.mockMedicalRecord.count({
      where: { patientId: patient.id },
    }),
  ]);

  if (appointmentCount > 0 || referralCount > 0 || recordCount > 0) {
    return NextResponse.json(
      {
        message:
          "Pasien tidak dapat dihapus karena memiliki riwayat kunjungan, rujukan, atau rekam medis",
      },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.patient.delete({
      where: { id: patient.id },
    }),
    prisma.user.delete({
      where: { id: patient.userId },
    }),
  ]);

  return NextResponse.json(
    { message: "Pasien berhasil dihapus" },
    { status: 200 }
  );
}
