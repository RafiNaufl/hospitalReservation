import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function PublicDoctorsPage() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  const DoctorsClient = (await import("./doctors-client")).default;
  return <DoctorsClient />;
}
