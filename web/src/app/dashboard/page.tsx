import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user as { id?: string; email?: string };

  if (!user.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });

  const upcomingAppointments = patient
    ? await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          date: { gte: new Date() },
          status: { not: "CANCELLED" },
        },
        orderBy: { date: "asc" },
        take: 5,
        include: {
          doctor: {
            include: {
              specialty: true,
            },
          },
        },
      })
    : [];

  const lastRecord = patient
    ? await prisma.mockMedicalRecord.findFirst({
        where: { patientId: patient.id },
        orderBy: { lastVisitDate: "desc" },
      })
    : null;

  const visitHistory = patient
    ? await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          status: "COMPLETED",
        },
        orderBy: [
          { date: "desc" },
          { startTime: "desc" },
        ],
        take: 5,
        include: {
          doctor: {
            include: {
              specialty: true,
            },
          },
        },
      })
    : [];

  return (
    <DashboardClient
      patient={patient}
      userEmail={user.email || ""}
      upcomingAppointments={upcomingAppointments as any}
      visitHistory={visitHistory as any}
      lastRecord={lastRecord}
    />
  );
}
