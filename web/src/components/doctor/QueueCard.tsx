import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock } from "lucide-react"

interface QueueItem {
  id: string
  queueNumber: number
  patientName: string
  startTime: string
  status: string
}

interface QueueCardProps {
  queue: QueueItem[]
  onCallNext: (id: string) => void
}

export function QueueCard({ queue, onCallNext }: QueueCardProps) {
  const maskName = (name: string) => {
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0][0] + "***"
    return parts[0] + " " + parts[1][0] + "***"
  }

  const nextPatient = queue.find((p) => p.status === "CHECKED_IN")

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-white px-6">
        <div>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-900">Antrean Aktif</CardTitle>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Live Queue Update</p>
        </div>
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
          <Users className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {nextPatient ? (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-24 h-24" />
              </div>
              <div className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                Panggilan Berikutnya
              </div>
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <div className="text-5xl font-black text-white tracking-tighter leading-none mb-2">
                    #{nextPatient.queueNumber}
                  </div>
                  <div className="text-sm font-black text-white/90 tracking-tight uppercase">
                    {maskName(nextPatient.patientName)}
                  </div>
                  <div className="text-[10px] text-emerald-100 font-bold flex items-center gap-1.5 mt-2 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    Slot {nextPatient.startTime}
                  </div>
                </div>
                <Button 
                  onClick={() => onCallNext(nextPatient.id)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg rounded-xl h-14 px-8 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  PANGGIL
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between px-1">
                <span>Daftar Tunggu</span>
                <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black h-5 px-2 rounded-full flex items-center">
                  {queue.length - 1} PASIEN LAGI
                </span>
              </div>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {queue.slice(1).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-zinc-50 bg-white shadow-sm hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300 group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center font-black text-zinc-400 text-xs shadow-inner group-hover/item:bg-white group-hover/item:text-emerald-500 transition-colors">
                        {item.queueNumber}
                      </div>
                      <div>
                        <div className="text-xs font-black text-zinc-800 uppercase tracking-tight">
                          {maskName(item.patientName)}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-400 mt-0.5 uppercase flex items-center gap-1.5">
                          <Clock className="w-2.5 h-2.5" />
                          {item.startTime}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black border-zinc-200 text-zinc-400 uppercase tracking-widest px-2 py-0.5 rounded-lg group-hover/item:border-emerald-200 group-hover/item:text-emerald-500">
                      WAITING
                    </Badge>
                  </div>
                ))}
                {queue.length <= 1 && (
                  <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                      Antrean Kosong
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/30">
            <div className="bg-zinc-100 p-4 rounded-2xl mb-4">
              <Users className="w-8 h-8 opacity-20 text-zinc-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Belum ada antrean</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
