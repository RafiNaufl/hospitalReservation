import { Sidebar } from "@/components/doctor/Sidebar"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50/50">
      <Sidebar />
      <main className="flex-1 md:pl-72">
        {children}
      </main>
    </div>
  )
}
