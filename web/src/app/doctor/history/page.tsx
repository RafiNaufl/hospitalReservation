import { HistoryClient } from "./history-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"
import { CustomSession } from "@/lib/types"

export default async function DoctorHistoryPage() {
  const session = (await getServerSession(authOptions)) as CustomSession | null

  if (!session?.user || session.user.role !== "DOCTOR") {
    redirect("/login")
  }

  return <HistoryClient />
}
