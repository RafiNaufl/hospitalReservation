import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DoctorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as { role?: string }).role) {
    redirect("/login?callbackUrl=/doctor/dashboard");
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "DOCTOR") {
    redirect("/dashboard");
  }

  const userId = (session.user as { id?: string }).id;

  if (!userId) {
    redirect("/login?callbackUrl=/doctor/dashboard");
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId },
  });

  if (!doctor) {
    redirect("/dashboard");
  }

  return <DashboardClient />;
}
