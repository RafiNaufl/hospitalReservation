import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, XCircle, Stethoscope, Percent } from "lucide-react"

interface StatsCardsProps {
  stats: {
    total: number
    checkedIn: number
    completed: number
    noShow: number
    bpjs: number
    umum: number
    occupancy: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      title: "Total Hari Ini",
      value: stats.total,
      icon: Users,
      description: "Total janji temu",
      color: "text-blue-600",
    },
    {
      title: "Sudah Check-in",
      value: stats.checkedIn,
      icon: Clock,
      description: "Menunggu di antrean",
      color: "text-yellow-600",
    },
    {
      title: "Selesai",
      value: stats.completed,
      icon: CheckCircle,
      description: "Konsultasi selesai",
      color: "text-green-600",
    },
    {
      title: "Tidak Datang",
      value: stats.noShow,
      icon: XCircle,
      description: "No-show hari ini",
      color: "text-red-600",
    },
    {
      title: "BPJS vs Umum",
      value: `${stats.bpjs} / ${stats.umum}`,
      icon: Stethoscope,
      description: "Perbandingan tipe",
      color: "text-purple-600",
    },
    {
      title: "Okupansi",
      value: `${stats.occupancy}%`,
      icon: Percent,
      description: "Slot terisi",
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.title} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.title}</CardTitle>
            <div className={`p-1.5 rounded-lg ${item.color.replace('text-', 'bg-').replace('600', '100')} ${item.color}`}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight">{item.value}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
