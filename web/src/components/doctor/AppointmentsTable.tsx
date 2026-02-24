import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle, Clock } from "lucide-react"

interface Appointment {
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
}

interface AppointmentsTableProps {
  appointments: Appointment[]
  onStatusUpdate: (id: string, status: string) => void
}

export function AppointmentsTable({
  appointments,
  onStatusUpdate,
}: AppointmentsTableProps) {
  const maskName = (name: string) => {
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0][0] + "***"
    return parts[0] + " " + parts[1][0] + "***"
  }

  const maskId = (id: string) => {
    if (!id) return "-"
    return id.substring(0, 4) + "****" + id.substring(id.length - 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <Badge variant="secondary">Terjadwal</Badge>
      case "CHECKED_IN":
        return <Badge variant="info">Check-in</Badge>
      case "IN_PROGRESS":
        return <Badge variant="warning">Konsultasi</Badge>
      case "COMPLETED":
        return <Badge variant="success">Selesai</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Dibatalkan</Badge>
      case "NO_SHOW":
        return <Badge variant="destructive">No-show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/50">
        <Clock className="w-12 h-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">Tidak ada jadwal hari ini</h3>
        <p className="text-sm text-muted-foreground">
          Semua janji temu untuk hari ini akan muncul di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Waktu</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Pasien</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Tipe</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Keluhan</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-zinc-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="border-zinc-50 hover:bg-zinc-50/30 transition-all duration-300 group">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all"></div>
                    <span className="font-black text-zinc-900 text-sm tracking-tight">{appointment.startTime}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-800 text-sm uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                      {maskName(appointment.patient.fullName)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-tight mt-0.5">
                      RM: {maskId(appointment.patient.rmNumber || "-")} • NIK: {maskId(appointment.patient.nik)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {appointment.appointmentType === "BPJS" ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest">
                      BPJS
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest">
                      UMUM
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">{getStatusBadge(appointment.status)}</TableCell>
                <TableCell className="px-6 py-4">
                  <div className="max-w-[180px] truncate text-[11px] text-zinc-500 font-bold italic tracking-tight" title={appointment.notes || ""}>
                    {appointment.notes ? `"${appointment.notes}"` : "Tidak ada keluhan"}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {appointment.status === "CHECKED_IN" && (
                      <Button
                        size="sm"
                        className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        onClick={() => onStatusUpdate(appointment.id, "IN_PROGRESS")}
                      >
                        MULAI
                      </Button>
                    )}
                    {appointment.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="success"
                        className="h-9 px-4 text-[10px] font-black rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        onClick={() => onStatusUpdate(appointment.id, "COMPLETED")}
                      >
                        SELESAI
                      </Button>
                    )}
                    {["BOOKED", "CHECKED_IN"].includes(appointment.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="No-Show"
                        onClick={() => onStatusUpdate(appointment.id, "NO_SHOW")}
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
