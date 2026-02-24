"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/doctor/DashboardHeader"
import { StatsCards } from "@/components/doctor/StatsCards"
import { AppointmentsTable } from "@/components/doctor/AppointmentsTable"
import { QueueCard } from "@/components/doctor/QueueCard"
import { MiniCalendar } from "@/components/doctor/MiniCalendar"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface DashboardData {
  doctor: {
    fullName: string
    photoUrl: string | null
  }
  stats: {
    total: number
    checkedIn: number
    completed: number
    noShow: number
    bpjs: number
    umum: number
    occupancy: number
  }
  appointments: Array<{
    id: string
    startTime: string
    patient: {
      fullName: string
      nik: string
      rmNumber: string | null
    }
    appointmentType: "BPJS" | "GENERAL"
    status: string
    notes: string | null
  }>
  queue: Array<{
    id: string
    queueNumber: number
    patientName: string
    startTime: string
    status: string
  }>
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/doctor/dashboard-data")
      if (res.ok) {
        const result = (await res.json()) as DashboardData
        setData(result)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchData])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        toast({
          title: "Status Diperbarui",
          description: `Status janji temu telah diubah menjadi ${status}.`,
        })
        fetchData()
      } else {
        throw new Error("Gagal memperbarui status")
      }
    } catch {
      toast({
        title: "Kesalahan",
        description: "Gagal memperbarui status janji temu.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase())
  }

  const filteredAppointments =
    data?.appointments.filter(
      (a) =>
        a.patient.fullName.toLowerCase().includes(searchQuery) ||
        a.patient.nik.includes(searchQuery) ||
        (a.patient.rmNumber && a.patient.rmNumber.includes(searchQuery))
    ) || []

  const calendarEvents = data?.appointments.map((a) => {
    const todayStr = new Date().toISOString().split("T")[0]
    const startTime = `${todayStr}T${a.startTime}:00`
    
    // Assume 30 mins duration if endTime is missing or simple calculation
    const [h, m] = a.startTime.split(":").map(Number)
    const endM = (m + 30) % 60
    const endH = h + Math.floor((m + 30) / 60)
    const endTime = `${todayStr}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`
    
    let color = "#3b82f6" // default blue
    if (a.status === "CHECKED_IN") color = "#eab308" // yellow
    if (a.status === "IN_PROGRESS") color = "#10b981" // emerald
    if (a.status === "COMPLETED") color = "#10b981" // emerald
    if (a.status === "CANCELLED" || a.status === "NO_SHOW") color = "#ef4444" // red

    return {
      title: a.patient.fullName,
      start: startTime,
      end: endTime,
      color,
    }
  }) || []

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-zinc-500 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader
        doctorName={data?.doctor.fullName || "Dokter"}
        photoUrl={data?.doctor.photoUrl}
        onSearch={handleSearch}
        notificationsCount={data?.queue.length || 0}
      />

      <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard Dokter</h2>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Selamat datang kembali, <span className="text-emerald-600 font-bold">dr. {data?.doctor.fullName}</span>. Kelola antrean hari ini dengan efisien.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 bg-zinc-50 px-5 py-2.5 rounded-xl border border-zinc-100 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-600" />
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {data?.stats && <StatsCards stats={data.stats} />}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-50 bg-zinc-50/30 px-6">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">Janji Temu Hari Ini</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Total {filteredAppointments.length} Pasien Terdaftar</p>
                </div>
                <div className="flex gap-2">
                   {/* Add filter buttons here if needed */}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AppointmentsTable
                  appointments={filteredAppointments}
                  onStatusUpdate={handleStatusUpdate}
                />
              </CardContent>
            </Card>

            <MiniCalendar events={calendarEvents} />
          </div>

          <div className="space-y-6 xl:col-span-1">
            <QueueCard
              queue={data?.queue || []}
              onCallNext={(id) => handleStatusUpdate(id, "IN_PROGRESS")}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

