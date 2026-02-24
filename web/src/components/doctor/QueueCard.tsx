import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Users, Clock } from "lucide-react"

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
    <Card className="h-full border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 border-b border-zinc-50 bg-zinc-50/30">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">Antrean Saat Ini</CardTitle>
        <div className="bg-emerald-100 p-1.5 rounded-lg">
          <Users className="w-4 h-4 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {nextPatient ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50 shadow-inner">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Pasien Berikutnya
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-emerald-900 tracking-tight leading-none mb-1">
                    #{nextPatient.queueNumber}
                  </div>
                  <div className="text-sm font-bold text-emerald-800">
                    {maskName(nextPatient.patientName)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1 uppercase">
                    <Clock className="w-3 h-3" />
                    Slot: {nextPatient.startTime}
                  </div>
                </div>
                <Button 
                  onClick={() => onCallNext(nextPatient.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl h-12 px-6 font-bold text-xs"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  PANGGIL
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Sisa Antrean</span>
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 text-[10px] h-5 px-1.5">
                  {queue.length - 1} Pasien
                </Badge>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                {queue.slice(1).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-50 bg-zinc-50/30 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-zinc-100 flex items-center justify-center font-black text-zinc-400 text-xs shadow-sm">
                        {item.queueNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-800">
                          {maskName(item.patientName)}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground mt-0.5 uppercase flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {item.startTime}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold border-zinc-200 text-zinc-400 uppercase tracking-tighter">
                      Menunggu
                    </Badge>
                  </div>
                ))}
                {queue.length <= 1 && (
                  <div className="text-center py-6 border-2 border-dashed border-zinc-100 rounded-xl">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Tidak ada antrean
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-zinc-100 rounded-xl">
            <Users className="w-8 h-8 mb-3 opacity-20 text-emerald-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Belum ada antrean</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
