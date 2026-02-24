import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const patchBodySchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola poli" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Poli tidak ditemukan" },
      { status: 404 }
    );
  }

  const json = await request.json().catch(() => null);
  const body = patchBodySchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { message: "Data poli tidak valid" },
      { status: 400 }
    );
  }

  if (body.data.name) {
    const existing = await prisma.specialty.findFirst({
      where: {
        name: body.data.name,
        NOT: { id: params.data.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Nama poli sudah digunakan" },
        { status: 400 }
      );
    }
  }

  const specialty = await prisma.specialty.update({
    where: { id: params.data.id },
    data: {
      name: body.data.name,
      description:
        body.data.description !== undefined
          ? body.data.description || null
          : undefined,
    },
  });

  return NextResponse.json(specialty);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json(
      { message: "Hanya admin yang boleh mengelola poli" },
      { status: 403 }
    );
  }

  const rawParams = await context.params;
  const params = paramsSchema.safeParse(rawParams);

  if (!params.success) {
    return NextResponse.json(
      { message: "Poli tidak ditemukan" },
      { status: 404 }
    );
  }

  const doctorCount = await prisma.doctor.count({
    where: { specialtyId: params.data.id },
  });

  if (doctorCount > 0) {
    return NextResponse.json(
      {
        message:
          "Poli tidak dapat dihapus karena masih digunakan oleh beberapa dokter",
      },
      { status: 400 }
    );
  }

  await prisma.specialty.delete({
    where: { id: params.data.id },
  });

  return NextResponse.json(
    { message: "Poli berhasil dihapus" },
    { status: 200 }
  );
}

