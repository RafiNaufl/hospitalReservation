import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function buildSlotEnd(date: Date, endTime: string) {
  const [hour, minute] = endTime.split(":").map((value) => Number(value));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return date;
  }
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export async function POST() {
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "BOOKED",
    },
  });

  let updated = 0;

  for (const appointment of appointments) {
    const slotEnd = buildSlotEnd(appointment.date, appointment.endTime);

    if (slotEnd.getTime() + 30 * 60000 < now.getTime()) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "NO_SHOW",
        },
      });
      updated += 1;
    }
  }

  return NextResponse.json({
    updated,
  });
}

