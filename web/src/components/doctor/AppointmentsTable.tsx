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
import { Play, Check, XCircle, Clock, CreditCard } from "lucide-react"

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
    <div className="rounded-lg overflow-hidden border border-zinc-100 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider">Waktu</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Pasien</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Tipe</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Keluhan</TableHead>
              <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                <TableCell className="font-semibold text-zinc-600">
                  {appointment.startTime}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 text-sm">
                      {maskName(appointment.patient.fullName)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      RM: {maskId(appointment.patient.rmNumber || "-")} • NIK: {maskId(appointment.patient.nik)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {appointment.appointmentType === "BPJS" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[10px] font-bold px-2 py-0">
                      BPJS
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold px-2 py-0">
                      UMUM
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate text-[11px] text-zinc-500 font-medium italic" title={appointment.notes || ""}>
                    {appointment.notes || "-"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {appointment.status === "CHECKED_IN" && (
                      <Button
                        size="sm"
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold rounded-lg shadow-sm"
                        onClick={() => onStatusUpdate(appointment.id, "IN_PROGRESS")}
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Mulai
                      </Button>
                    )}
                    {appointment.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="success"
                        className="h-8 px-3 text-[11px] font-bold rounded-lg shadow-sm"
                        onClick={() => onStatusUpdate(appointment.id, "COMPLETED")}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Selesai
                      </Button>
                    )}
                    {["BOOKED", "CHECKED_IN"].includes(appointment.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Tandai Tidak Datang"
                        onClick={() => onStatusUpdate(appointment.id, "NO_SHOW")}
                      >
                        <XCircle className="w-4 h-4" />
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
