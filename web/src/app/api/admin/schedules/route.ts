import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return hour * 60 + minute;
}

function hasConflict(
  startTime: string,
  endTime: string,
  existing: { startTime: string; endTime: string }[]
) {
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  if (startMinutes === null || endMinutes === null) {
    return true;
  }

  return existing.some((item) => {
    const existingStart = parseTime(item.startTime);
    const existingEnd = parseTime(item.endTime);

    if (existingStart === null || existingEnd === null) {
      return false;
    }

    const noOverlap = endMinutes <= existingStart || startMinutes >= existingEnd;
    return !noOverlap;
  });
}

const bodySchema = z
  .object({
    doctorId: z.string().cuid(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    slotDurationMinutes: z.number().min(5),
    maxPatientsPerSlot: z.number().min(1),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const startMinutes = parseTime(data.startTime);
    const endMinutes = parseTime(data.endTime);

    if (startMinutes === null || endMinutes === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Jam harus dalam format HH:MM yang valid",
      });
      return;
    }

    if (endMinutes <= startMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Jam selesai harus setelah jam mulai",
      });
    }

    const totalMinutes = endMinutes - startMinutes;
    if (data.slotDurationMinutes >= totalMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slotDurationMinutes"],
        message: "Durasi per slot harus lebih kecil dari total durasi praktik",
      });
    }
  });

export async function GET() {
  const schedules = await prisma.doctorSchedule.findMany({
    include: {
      doctor: {
        include: {
          specialty: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
      { doctor: { fullName: "asc" } },
    ],
  });

  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola jadwal" },
      { status: 403 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data jadwal tidak valid" },
      { status: 400 }
    );
  }

  const existingSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: parsed.data.doctorId,
      dayOfWeek: parsed.data.dayOfWeek,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  if (
    hasConflict(parsed.data.startTime, parsed.data.endTime, existingSchedules)
  ) {
    return NextResponse.json(
      { message: "Jadwal bentrok dengan jadwal lain untuk dokter ini" },
      { status: 400 }
    );
  }

  const schedule = await prisma.doctorSchedule.create({
    data: parsed.data,
  });

  return NextResponse.json(schedule, { status: 201 });
}
