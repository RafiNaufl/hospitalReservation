import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as { id?: string };
    const body = await req.json();

    const {
      fullName,
      nik,
      phone,
      dateOfBirth,
      gender,
      address,
      bpjsNumber,
      bpjsClass,
      isBpjs,
    } = body;

    if (!fullName || !nik || !phone) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        nik,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        bpjsNumber,
        bpjsClass,
        isBpjs,
      },
      create: {
        userId: user.id!,
        fullName,
        nik,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        bpjsNumber,
        bpjsClass,
        isBpjs,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
