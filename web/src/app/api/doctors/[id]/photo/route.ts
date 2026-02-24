import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { message: "Anda harus login untuk mengubah foto dokter" },
      { status: 401 }
    );
  }

  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 404 }
    );
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: parsedParams.data.id },
  });

  if (!doctor) {
    return NextResponse.json(
      { message: "Dokter tidak ditemukan" },
      { status: 404 }
    );
  }

  const role = (session.user as { role?: string }).role;
  const userId = (session.user as { id?: string }).id;

  const isAdmin = role === "ADMIN";
  const isOwnerDoctor = role === "DOCTOR" && userId && doctor.userId === userId;

  if (!isAdmin && !isOwnerDoctor) {
    return NextResponse.json(
      { message: "Anda tidak memiliki akses untuk mengubah foto dokter ini" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "File foto tidak ditemukan" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Format file tidak didukung, gunakan JPG atau PNG" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Ukuran file maksimal 2MB" },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "doctors",
    doctor.id
  );

  await fs.mkdir(uploadsDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const extension = file.type === "image/png" ? "png" : "jpg";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${extension}`;

  const filePath = path.join(uploadsDir, fileName);

  if (doctor.photoUrl && doctor.photoUrl.startsWith("/uploads/doctors/")) {
    const existingPath = path.join(
      process.cwd(),
      "public",
      doctor.photoUrl.replace(/^\/+/, "")
    );
    try {
      await fs.unlink(existingPath);
    } catch {}
  }

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/doctors/${doctor.id}/${fileName}`;

  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      photoUrl: publicUrl,
    },
  });

  return NextResponse.json(
    {
      photoUrl: updated.photoUrl,
    },
    { status: 201 }
  );
}

