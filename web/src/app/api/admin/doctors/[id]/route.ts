import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const patchBodySchema = z.object({
  fullName: z.string().min(3).optional(),
  specialtyId: z.string().cuid().optional(),
  location: z.string().optional(),
  acceptsBpjs: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola dokter" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 404 }
    );
  }

  const body = patchBodySchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { message: "Data dokter tidak valid" },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.update({
    where: { id: params.data.id },
    data: body.data,
  });

  return NextResponse.json(doctor);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola dokter" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.doctor.delete({
    where: { id: params.data.id },
  });

  return NextResponse.json(
    { message: "Dokter berhasil dihapus" },
    { status: 200 }
  );
}
