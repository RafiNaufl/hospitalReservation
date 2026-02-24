"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardHeader } from "@/components/doctor/DashboardHeader"
import { StatsCards } from "@/components/doctor/StatsCards"
import { AppointmentsTable } from "@/components/doctor/AppointmentsTable"
import { QueueCard } from "@/components/doctor/QueueCard"
import { MiniCalendar } from "@/components/doctor/MiniCalendar"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface DashboardData {
  doctor: {
    fullName: string
    photoUrl: string | null
    specialtyName: string
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
    <div className="flex-1">
      <DashboardHeader
        doctorName={data?.doctor.fullName || "Dokter"}
        photoUrl={data?.doctor.photoUrl}
        specialtyName={data?.doctor.specialtyName || "Spesialis"}
        onSearch={handleSearch}
        notificationsCount={data?.queue.length || 0}
      />

      <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-[1800px] mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-white/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse delay-75"></span>
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse delay-150"></span>
              </div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Dashboard Dokter</h2>
            </div>
            <p className="text-sm text-zinc-500 font-bold tracking-tight">
              Selamat datang kembali, <span className="text-emerald-600 font-black underline decoration-emerald-200 underline-offset-4 decoration-4">dr. {data?.doctor.fullName}</span>. 
              Sistem siap untuk mengelola <span className="text-zinc-900 font-black">{data?.stats.total || 0} pasien</span> hari ini.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-black text-zinc-600 bg-zinc-50 px-8 py-4 rounded-[1.5rem] border border-zinc-100 shadow-inner relative z-10">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-widest text-[10px] text-zinc-400 mb-0.5">Hari & Tanggal</span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {data?.stats && <StatsCards stats={data.stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border-none bg-white overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between p-8 border-b border-zinc-50 bg-gradient-to-r from-zinc-50/50 to-white">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight uppercase">Jadwal Janji Temu</h3>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Update Real-time Aktif
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <div className="px-4 py-2 bg-zinc-100 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Total: {filteredAppointments.length} Pasien
                  </div>
                </div>
              </div>
              <div className="p-2">
                <AppointmentsTable
                  appointments={filteredAppointments}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </Card>

            <MiniCalendar events={calendarEvents} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <QueueCard
              queue={data?.queue || []}
              onCallNext={(id) => handleStatusUpdate(id, "IN_PROGRESS")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

