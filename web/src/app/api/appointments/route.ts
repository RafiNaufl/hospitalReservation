import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const bodySchema = z.object({
  specialtyId: z.string().cuid(),
  doctorId: z.string().cuid(),
  date: z.string(),
  slot: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { message: "Anda harus login sebagai pasien" },
      { status: 401 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data booking tidak valid" },
      { status: 400 }
    );
  }

  const { specialtyId, doctorId, date, slot, notes } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Pengguna tidak ditemukan" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Profil pasien tidak ditemukan" },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.findFirst({
    where: {
      id: doctorId,
      specialtyId,
    },
  });

  if (!doctor) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 400 }
    );
  }

  const appointmentDate = new Date(date);

  if (Number.isNaN(appointmentDate.getTime())) {
    return NextResponse.json(
      { message: "Tanggal tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      date: appointmentDate,
      startTime: slot,
      status: {
        in: ["BOOKED", "CHECKED_IN"],
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Slot sudah terisi, silakan pilih jam lain" },
      { status: 409 }
    );
  }

  const endTime = (() => {
    const [hour, minute] = slot.split(":").map((value) => Number(value));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return slot;
    }
    const durationMinutes = 30;
    const totalMinutes = hour * 60 + minute + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(endHour)}:${pad(endMinute)}`;
  })();

  const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
  const qrCodeData = bookingCode;

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      date: appointmentDate,
      startTime: slot,
      endTime,
      appointmentType: "GENERAL",
      notes: notes || null,
      bookingCode,
      qrCodeData,
    },
  });

  await prisma.notificationLog.create({
    data: {
      appointmentId: appointment.id,
      channel: "WHATSAPP",
      type: "CONFIRMATION",
      status: "SUCCESS",
    },
  });

  return NextResponse.json(
    {
      id: appointment.id,
      bookingCode: appointment.bookingCode,
      qrCodeData: appointment.qrCodeData,
    },
    { status: 201 }
  );
}
