import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { CustomSession } from "@/lib/types"

export async function GET() {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const doctor = await prisma.doctor.findFirst({
    where: { userId },
    include: { specialty: true },
  })

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      patient: true,
      checkInLogs: {
        orderBy: {
          checkedInAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })

  // Calculate stats
  const total = appointments.length
  const checkedIn = appointments.filter((a) => a.status === "CHECKED_IN").length
  const inProgress = appointments.filter((a) => a.status === "IN_PROGRESS").length
  const completed = appointments.filter((a) => a.status === "COMPLETED").length
  const noShow = appointments.filter((a) => a.status === "NO_SHOW").length
  const bpjs = appointments.filter((a) => a.appointmentType === "BPJS").length
  const umum = appointments.filter((a) => a.appointmentType === "GENERAL").length

  // Occupancy calculation
  // For simplicity, let's assume total available slots for the doctor today is based on schedules
  const dayOfWeek = now.getDay()
  const schedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctor.id,
      dayOfWeek: dayOfWeek,
    },
  })

  // Rough estimation of total slots based on maxPatientsPerSlot
  const totalAvailableSlots = schedules.reduce((acc, s) => acc + s.maxPatientsPerSlot, 0)
  const occupancy = totalAvailableSlots > 0 ? Math.round((total / totalAvailableSlots) * 100) : 0

  // Queue: CHECKED_IN patients sorted by check-in time
  const queue = appointments
    .filter((a) => a.status === "CHECKED_IN")
    .map((a) => ({
      id: a.id,
      queueNumber: a.checkInLogs[0]?.queueNumber || 0,
      patientName: a.patient.fullName,
      startTime: a.startTime,
      status: a.status,
    }))
    .sort((a, b) => a.queueNumber - b.queueNumber)

  return NextResponse.json({
    doctor: {
      fullName: doctor.fullName,
      photoUrl: doctor.photoUrl,
      specialtyName: doctor.specialty.name,
    },
    stats: {
      total,
      checkedIn: checkedIn + inProgress, // patients who are at the clinic
      completed,
      noShow,
      bpjs,
      umum,
      occupancy,
    },
    appointments: appointments.map((a) => ({
      id: a.id,
      startTime: a.startTime,
      patient: {
        fullName: a.patient.fullName,
        nik: a.patient.nik,
        rmNumber: a.patient.rmNumber,
      },
      appointmentType: a.appointmentType,
      status: a.status,
      notes: a.notes,
    })),
    queue,
  })
}
