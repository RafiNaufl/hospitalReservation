import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function buildSlotDate(date: Date, time: string) {
  const [hour, minute] = time.split(":").map((value) => Number(value));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return date;
  }
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export async function POST() {
  const now = new Date();

  const upcoming = await prisma.appointment.findMany({
    where: {
      status: "BOOKED",
      date: {
        gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  let reminder24h = 0;
  let reminder1h = 0;

  for (const appointment of upcoming) {
    const slotDate = buildSlotDate(appointment.date, appointment.startTime);
    const diffHours = (slotDate.getTime() - now.getTime()) / 3600000;

    if (diffHours > 23 && diffHours < 25) {
      const exists = await prisma.notificationLog.findFirst({
        where: {
          appointmentId: appointment.id,
          type: "REMINDER_24H",
        },
      });

      if (!exists) {
        await prisma.notificationLog.create({
          data: {
            appointmentId: appointment.id,
            channel: "WHATSAPP",
            type: "REMINDER_24H",
            status: "SUCCESS",
          },
        });
        reminder24h += 1;
      }
    }

    if (diffHours > 0 && diffHours <= 1.5) {
      const exists = await prisma.notificationLog.findFirst({
        where: {
          appointmentId: appointment.id,
          type: "REMINDER_1H",
        },
      });

      if (!exists) {
        await prisma.notificationLog.create({
          data: {
            appointmentId: appointment.id,
            channel: "WHATSAPP",
            type: "REMINDER_1H",
            status: "SUCCESS",
          },
        });
        reminder1h += 1;
      }
    }
  }

  return NextResponse.json({
    reminder24h,
    reminder1h,
  });
}

