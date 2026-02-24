import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = session.user as { id?: string; email?: string };

  if (!user.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  if (!patient) {
    // Jika data pasien belum ada, bisa redirect ke dashboard untuk melengkapi via modal 
    // atau biarkan ProfileClient menangani pembuatan data baru
    return (
      <ProfileClient 
        initialData={null} 
        userEmail={user.email || ""} 
      />
    );
  }

  return (
    <ProfileClient 
      initialData={{
        fullName: patient.fullName,
        nik: patient.nik,
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
        gender: patient.gender,
        address: patient.address || "",
        bpjsNumber: patient.bpjsNumber || "",
        bpjsClass: patient.bpjsClass || "",
        isBpjs: patient.isBpjs,
        photoUrl: patient.photoUrl || "",
      }} 
      userEmail={user.email || ""} 
    />
  );
}
