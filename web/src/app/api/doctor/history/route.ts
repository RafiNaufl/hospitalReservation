import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { CustomSession } from "@/lib/types"

import { AppointmentStatus, AppointmentType, Prisma } from "@prisma/client"

export async function GET(request: Request) {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const appointmentType = searchParams.get("type") as AppointmentType | null

  const userId = session.user.id
  const doctor = await prisma.doctor.findFirst({
    where: { userId },
  })

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }

  const where: Prisma.AppointmentWhereInput = {
    doctorId: doctor.id,
    status: "COMPLETED" as AppointmentStatus,
  }

  if (search) {
    where.OR = [
      { patient: { fullName: { contains: search, mode: "insensitive" } } },
      { bookingCode: { contains: search, mode: "insensitive" } },
    ]
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  }

  if (appointmentType) {
    where.appointmentType = appointmentType
  }

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      appointmentType: a.appointmentType,
      bookingCode: a.bookingCode,
      notes: a.notes,
      patient: {
        fullName: a.patient.fullName,
        nik: a.patient.nik,
        rmNumber: a.patient.rmNumber,
      },
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}
