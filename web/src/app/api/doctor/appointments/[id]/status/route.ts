import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { CustomSession } from "@/lib/types"
import { AppointmentStatus } from "@/generated/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = (await request.json()) as { status: AppointmentStatus }

  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const doctor = await prisma.doctor.findFirst({
    where: { userId },
  })

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  // Basic status validation
  const validStatuses: AppointmentStatus[] = [
    "BOOKED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Specific logic for status update
  const data: {
    status: AppointmentStatus
    cancelledAt?: Date
    cancelledReason?: string
  } = { status }

  if (status === "CANCELLED") {
    data.cancelledAt = new Date()
    data.cancelledReason = "Dibatalkan melalui dashboard dokter"
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data,
  })

  // If status is COMPLETED, update or create medical record
  if (status === "COMPLETED") {
    const existingRecord = await prisma.mockMedicalRecord.findFirst({
      where: { patientId: appointment.patientId },
    })

    if (existingRecord) {
      await prisma.mockMedicalRecord.update({
        where: { id: existingRecord.id },
        data: {
          lastVisitDate: new Date(),
        },
      })
    } else {
      await prisma.mockMedicalRecord.create({
        data: {
          patientId: appointment.patientId,
          lastVisitDate: new Date(),
        },
      })
    }
  }

  return NextResponse.json(updatedAppointment)
}
