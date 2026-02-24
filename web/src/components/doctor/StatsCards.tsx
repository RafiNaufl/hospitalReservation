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
      gradient: "from-blue-500/10 to-blue-600/5",
      iconColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Antrean",
      value: stats.checkedIn,
      icon: Clock,
      description: "Menunggu konsultasi",
      gradient: "from-amber-500/10 to-amber-600/5",
      iconColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
    {
      title: "Selesai",
      value: stats.completed,
      icon: CheckCircle,
      description: "Telah ditangani",
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "No-Show",
      value: stats.noShow,
      icon: XCircle,
      description: "Pasien tidak hadir",
      gradient: "from-rose-500/10 to-rose-600/5",
      iconColor: "text-rose-600",
      borderColor: "border-rose-100",
    },
    {
      title: "BPJS / Umum",
      value: `${stats.bpjs} / ${stats.umum}`,
      icon: Stethoscope,
      description: "Perbandingan tipe",
      gradient: "from-purple-500/10 to-purple-600/5",
      iconColor: "text-purple-600",
      borderColor: "border-purple-100",
    },
    {
      title: "Okupansi",
      value: `${stats.occupancy}%`,
      icon: Percent,
      description: "Kapasitas terisi",
      gradient: "from-indigo-500/10 to-indigo-600/5",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.title} className={`border ${item.borderColor} shadow-sm bg-gradient-to-br ${item.gradient} hover:shadow-md transition-all duration-300 group overflow-hidden relative`}>
          <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <item.icon className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.title}</CardTitle>
            <div className={`p-1.5 rounded-lg bg-white/80 shadow-sm ${item.iconColor}`}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-black tracking-tighter text-zinc-900">{item.value}</div>
            <p className="text-[9px] font-bold text-zinc-500 mt-0.5 line-clamp-1 uppercase tracking-tight">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
