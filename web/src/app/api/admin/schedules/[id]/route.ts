import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

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

const patchBodySchema = z
  .object({
    doctorId: z.string().cuid().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    slotDurationMinutes: z.number().min(5).optional(),
    maxPatientsPerSlot: z.number().min(1).optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasStart = typeof data.startTime === "string";
    const hasEnd = typeof data.endTime === "string";

    if (!hasStart && !hasEnd && data.slotDurationMinutes === undefined) {
      return;
    }

    if (!hasStart || !hasEnd) {
      if (data.slotDurationMinutes !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slotDurationMinutes"],
          message:
            "Jika mengubah durasi slot, jam mulai dan jam selesai juga harus diisi",
        });
      }
      return;
    }

    const startMinutes = parseTime(data.startTime as string);
    const endMinutes = parseTime(data.endTime as string);

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

    if (data.slotDurationMinutes !== undefined) {
      const totalMinutes = endMinutes - startMinutes;
      if (data.slotDurationMinutes >= totalMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slotDurationMinutes"],
          message:
            "Durasi per slot harus lebih kecil dari total durasi praktik",
        });
      }
    }
  });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola jadwal" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Jadwal tidak ditemukan" },
      { status: 404 }
    );
  }

  const body = patchBodySchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { message: "Data jadwal tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.doctorSchedule.findUnique({
    where: { id: params.data.id },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "Jadwal tidak ditemukan" },
      { status: 404 }
    );
  }

  const merged = {
    doctorId: body.data.doctorId ?? existing.doctorId,
    dayOfWeek: body.data.dayOfWeek ?? existing.dayOfWeek,
    startTime: body.data.startTime ?? existing.startTime,
    endTime: body.data.endTime ?? existing.endTime,
    slotDurationMinutes:
      body.data.slotDurationMinutes ?? existing.slotDurationMinutes,
    maxPatientsPerSlot:
      body.data.maxPatientsPerSlot ?? existing.maxPatientsPerSlot,
    location: body.data.location ?? existing.location ?? undefined,
  };

  const overlappingSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: merged.doctorId,
      dayOfWeek: merged.dayOfWeek,
      NOT: {
        id: existing.id,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  if (
    hasConflict(merged.startTime, merged.endTime, overlappingSchedules)
  ) {
    return NextResponse.json(
      { message: "Jadwal bentrok dengan jadwal lain untuk dokter ini" },
      { status: 400 }
    );
  }

  const schedule = await prisma.doctorSchedule.update({
    where: { id: params.data.id },
    data: body.data,
  });

  return NextResponse.json(schedule);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola jadwal" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Jadwal tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.doctorSchedule.delete({
    where: { id: params.data.id },
  });

  return NextResponse.json(
    { message: "Jadwal berhasil dihapus" },
    { status: 200 }
  );
}
