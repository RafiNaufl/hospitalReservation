import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { message: "Anda harus login untuk mengubah foto profil" },
      { status: 401 }
    );
  }

  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID tidak ditemukan" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Data pasien tidak ditemukan" },
      { status: 404 }
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
    "patients",
    patient.id
  );

  await fs.mkdir(uploadsDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const extension = file.type === "image/png" ? "png" : "jpg";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${extension}`;

  const filePath = path.join(uploadsDir, fileName);

  // Hapus foto lama jika ada
  if (patient.photoUrl && patient.photoUrl.startsWith("/uploads/patients/")) {
    const existingPath = path.join(
      process.cwd(),
      "public",
      patient.photoUrl.replace(/^\/+/, "")
    );
    try {
      await fs.unlink(existingPath);
    } catch {}
  }

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/patients/${patient.id}/${fileName}`;

  const updated = await prisma.patient.update({
    where: { id: patient.id },
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
