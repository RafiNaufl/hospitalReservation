import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const bodySchema = z.object({
  date: z.string(),
  slot: z.string(),
});

function buildDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { message: "Anda harus login sebagai pasien" },
      { status: 401 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Janji temu tidak ditemukan" },
      { status: 404 }
    );
  }

  const body = bodySchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { message: "Data reschedule tidak valid" },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.data.id },
    include: {
      patient: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!appointment || !appointment.patient.user) {
    return NextResponse.json(
      { message: "Janji temu tidak ditemukan" },
      { status: 404 }
    );
  }

  if (appointment.patient.user.email !== session.user.email) {
    return NextResponse.json(
      { message: "Anda tidak boleh mengubah janji temu ini" },
      { status: 403 }
    );
  }

  if (
    appointment.status === "COMPLETED" ||
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW"
  ) {
    return NextResponse.json(
      { message: "Janji temu sudah tidak bisa diubah" },
      { status: 400 }
    );
  }

  const date = buildDate(body.data.date);

  if (!date) {
    return NextResponse.json(
      { message: "Tanggal tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: appointment.doctorId,
      date,
      startTime: body.data.slot,
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
    const [hour, minute] = body.data.slot.split(":").map((value) => Number(value));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return body.data.slot;
    }
    const durationMinutes = 30;
    const totalMinutes = hour * 60 + minute + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(endHour)}:${pad(endMinute)}`;
  })();

  const newAppointment = await prisma.appointment.create({
    data: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date,
      startTime: body.data.slot,
      endTime,
      appointmentType: appointment.appointmentType,
      status: "BOOKED",
      bookingCode: `BK-${Date.now().toString(36).toUpperCase()}`,
      qrCodeData: `BK-${Date.now().toString(36).toUpperCase()}`,
      rescheduledFromId: appointment.id,
    },
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledReason: "Dijadwalkan ulang oleh pasien",
    },
  });

  await prisma.notificationLog.create({
    data: {
      appointmentId: newAppointment.id,
      channel: "WHATSAPP",
      type: "RESCHEDULED",
      status: "SUCCESS",
    },
  });

  return NextResponse.json(
    {
      id: newAppointment.id,
      bookingCode: newAppointment.bookingCode,
      qrCodeData: newAppointment.qrCodeData,
    },
    { status: 201 }
  );
}
