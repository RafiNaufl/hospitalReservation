"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Search, Filter, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { DashboardHeader } from "@/components/doctor/DashboardHeader"
import { useToast } from "@/components/ui/use-toast"

interface DoctorInfo {
  fullName: string
  photoUrl: string | null
  specialtyName: string
}

interface Appointment {
  id: string
  date: string
  startTime: string
  endTime: string
  appointmentType: "BPJS" | "GENERAL"
  bookingCode: string
  notes: string | null
  patient: {
    fullName: string
    nik: string
    rmNumber: string | null
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function HistoryClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState("")
  const [page, setPage] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [doctorData, setDoctorData] = useState<DoctorInfo | null>(null)
  
  const { toast } = useToast()

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        startDate,
        endDate,
        type,
      })
      const res = await fetch(`/api/doctor/history?${query}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments)
        setPagination(data.pagination)
      }
    } catch {
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data riwayat",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [page, search, startDate, endDate, type, toast])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    // Fetch doctor info for header
    fetch("/api/doctor/dashboard-data")
      .then(res => res.json())
      .then(data => setDoctorData(data.doctor))
  }, [])

  const maskId = (id: string) => {
    if (id.length <= 6) return id
    return id.substring(0, 3) + "****" + id.substring(id.length - 3)
  }

  return (
    <div className="flex-1">
      <DashboardHeader
        doctorName={doctorData?.fullName || "Dokter"}
        photoUrl={doctorData?.photoUrl}
        specialtyName={doctorData?.specialtyName || "Spesialis"}
        onSearch={setSearch}
        notificationsCount={0}
      />

      <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/50 relative overflow-hidden">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Riwayat Pasien</h2>
            <p className="text-sm text-zinc-500 font-bold">Daftar lengkap reservasi pasien yang telah selesai ditangani.</p>
          </div>
        </div>

        <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-zinc-50 bg-zinc-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau kode booking..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm outline-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Semua Tipe Layanan</option>
                <option value="BPJS">BPJS</option>
                <option value="GENERAL">Umum</option>
              </select>
              <Button 
                onClick={() => {
                  setPage(1)
                  fetchHistory()
                }}
                className="bg-emerald-600 hover:bg-emerald-700 font-black text-xs uppercase tracking-widest rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 py-4">Tanggal & Waktu</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 py-4">Pasien</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 py-4">Kode Booking</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest px-8 py-4">Tipe</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest px-8 py-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-400 font-bold italic">
                        Memuat data riwayat...
                      </TableCell>
                    </TableRow>
                  ) : appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-400 font-bold italic">
                        Tidak ada riwayat ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((app) => (
                      <TableRow key={app.id} className="hover:bg-zinc-50 transition-colors border-zinc-50">
                        <TableCell className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900">{new Date(app.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="text-[10px] font-bold text-zinc-400">{app.startTime} - {app.endTime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 uppercase tracking-tight">{app.patient.fullName}</span>
                            <span className="text-[10px] font-bold text-zinc-400">RM: {app.patient.rmNumber || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-4 font-mono font-black text-emerald-600 text-xs">
                          {app.bookingCode}
                        </TableCell>
                        <TableCell className="px-8 py-4">
                          <Badge variant={app.appointmentType === "BPJS" ? "success" : "info"} className="text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest">
                            {app.appointmentType === "BPJS" ? "BPJS" : "UMUM"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(app)}
                            className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-zinc-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                          >
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="p-8 border-t border-zinc-50 flex items-center justify-between">
                <p className="text-xs font-bold text-zinc-400">
                  Menampilkan {appointments.length} dari {pagination.total} total riwayat
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-9 w-9 p-0 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={`h-9 w-9 p-0 rounded-xl font-black text-xs ${page === i + 1 ? 'bg-emerald-600' : ''}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="h-9 w-9 p-0 rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal
          open={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          title="Detail Riwayat Reservasi"
        >
          {selectedAppointment && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Pasien</p>
                  <p className="font-black text-zinc-900">{selectedAppointment.patient.fullName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kode Booking</p>
                  <p className="font-mono font-black text-emerald-600">{selectedAppointment.bookingCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">NIK Pasien</p>
                  <p className="font-bold text-zinc-700">{maskId(selectedAppointment.patient.nik)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nomor RM</p>
                  <p className="font-bold text-zinc-700">{selectedAppointment.patient.rmNumber || "-"}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal Layanan</p>
                    <p className="text-sm font-bold text-zinc-800">
                      {new Date(selectedAppointment.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Jam Praktik</p>
                    <p className="text-sm font-bold text-zinc-800">{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tipe Layanan</p>
                  <Badge variant={selectedAppointment.appointmentType === "BPJS" ? "success" : "info"} className="font-black uppercase tracking-widest">
                    {selectedAppointment.appointmentType === "BPJS" ? "BPJS" : "PASIEN UMUM"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Catatan / Keluhan Pasien</p>
                <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-100 italic text-sm text-zinc-600 bg-white">
                  {selectedAppointment.notes || "Tidak ada catatan keluhan."}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-8"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
