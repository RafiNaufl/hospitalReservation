import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

function buildDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const dateValue = url.searchParams.get("date");

  if (!dateValue) {
    return NextResponse.json(
      { message: "Tanggal wajib diisi" },
      { status: 400 }
    );
  }

  const appointmentDate = buildDate(dateValue);

  if (!appointmentDate) {
    return NextResponse.json(
      { message: "Tanggal tidak valid" },
      { status: 400 }
    );
  }

  const dayOfWeek = appointmentDate.getDay();

  const schedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: params.data.id,
      dayOfWeek,
    },
  });

  if (schedules.length === 0) {
    return NextResponse.json([]);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: params.data.id,
      date: appointmentDate,
      status: {
        in: ["BOOKED", "CHECKED_IN"],
      },
    },
    select: {
      startTime: true,
    },
  });

  const counts = new Map<string, number>();

  for (const appointment of appointments) {
    const current = counts.get(appointment.startTime) ?? 0;
    counts.set(appointment.startTime, current + 1);
  }

  const result: string[] = [];

  for (const schedule of schedules) {
    const [startHour, startMinute] = schedule.startTime
      .split(":")
      .map((value) => Number(value));
    const [endHour, endMinute] = schedule.endTime
      .split(":")
      .map((value) => Number(value));

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      continue;
    }

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    for (
      let minutes = startTotalMinutes;
      minutes + schedule.slotDurationMinutes <= endTotalMinutes;
      minutes += schedule.slotDurationMinutes
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${pad(hour)}:${pad(minute)}`;
      const bookedCount = counts.get(time) ?? 0;

      if (bookedCount < schedule.maxPatientsPerSlot) {
        result.push(time);
      }
    }
  }

  return NextResponse.json(result);
}
