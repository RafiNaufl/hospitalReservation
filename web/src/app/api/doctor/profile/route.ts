import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { CustomSession } from "@/lib/types"
import bcrypt from "bcrypt"

export async function GET() {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
        },
      },
      specialty: true,
    },
  })

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: doctor.id,
    fullName: doctor.fullName,
    photoUrl: doctor.photoUrl,
    sipNumber: doctor.sipNumber,
    experienceYears: doctor.experienceYears,
    location: doctor.location,
    email: doctor.user?.email,
    phone: doctor.user?.phone,
    specialtyName: doctor.specialty.name,
  })
}

export async function PATCH(request: Request) {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { fullName, phone, experienceYears, location, photoUrl } = body

  try {
    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          fullName,
          experienceYears: parseInt(experienceYears),
          location,
          photoUrl,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          phone,
        },
      }),
    ])

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { oldPassword, newPassword } = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ message: "Password changed successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
