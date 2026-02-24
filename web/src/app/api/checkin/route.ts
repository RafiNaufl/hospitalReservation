import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  bookingCode: z.string().min(1),
});

function buildSlotDate(date: Date, time: string) {
  const [hour, minute] = time.split(":").map((value) => Number(value));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return date;
  }
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data check-in tidak valid" },
      { status: 400 }
    );
  }

  const { bookingCode } = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { bookingCode },
  });

  if (!appointment) {
    return NextResponse.json(
      { message: "Kode booking tidak ditemukan" },
      { status: 404 }
    );
  }

  if (appointment.status === "CANCELLED" || appointment.status === "NO_SHOW") {
    return NextResponse.json(
      { message: "Booking sudah tidak aktif, silakan buat ulang" },
      { status: 400 }
    );
  }

  const now = new Date();
  const slotStart = buildSlotDate(appointment.date, appointment.startTime);
  const diffMinutes = (now.getTime() - slotStart.getTime()) / 60000;

  if (appointment.status === "CHECKED_IN") {
    return NextResponse.json(
      { message: "Pasien sudah melakukan check-in" },
      { status: 400 }
    );
  }

  if (appointment.status === "COMPLETED") {
    return NextResponse.json(
      { message: "Kunjungan sudah selesai" },
      { status: 400 }
    );
  }

  if (diffMinutes < -60) {
    return NextResponse.json(
      {
        message:
          "Check-in hanya dapat dilakukan maksimal 60 menit sebelum jam praktik.",
      },
      { status: 400 }
    );
  }

  if (diffMinutes > 15) {
    return NextResponse.json(
      {
        message:
          "Anda terlambat lebih dari 15 menit. Silakan hubungi petugas pendaftaran.",
      },
      { status: 400 }
    );
  }

  const lastCheckIn = await prisma.checkInLog.findFirst({
    where: {
      appointment: {
        doctorId: appointment.doctorId,
        date: appointment.date,
      },
    },
    orderBy: {
      queueNumber: "desc",
    },
  });

  const nextQueueNumber = (lastCheckIn?.queueNumber ?? 0) + 1;

  const [, checkIn] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "CHECKED_IN",
      },
    }),
    prisma.checkInLog.create({
      data: {
        appointmentId: appointment.id,
        method: "CODE",
        queueNumber: nextQueueNumber,
      },
    }),
  ]);

  return NextResponse.json(
    {
      queueNumber: checkIn.queueNumber,
      message: "Check-in berhasil",
    },
    { status: 200 }
  );
}
