"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"

interface MiniCalendarProps {
  events: Array<{
    title: string
    start: string
    end: string
    color?: string
  }>
}

export function MiniCalendar({ events }: MiniCalendarProps) {
  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-zinc-50/50 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          Jadwal Praktik
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="calendar-container mini-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            headerToolbar={false}
            events={events}
            height="500px"
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:30:00"
            locale="id"
            nowIndicator={true}
            dayHeaders={false}
            editable={false}
            selectable={false}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
              hour12: false,
            }}
          />
        </div>
      </CardContent>
      <style jsx global>{`
        .mini-calendar .fc {
          font-size: 0.75rem;
          border: none;
        }
        .mini-calendar .fc-theme-standard td,
        .mini-calendar .fc-theme-standard th {
          border-color: #f4f4f5;
        }
        .mini-calendar .fc-timegrid-slot {
          height: 2.5em !important;
        }
        .mini-calendar .fc-event {
          border-radius: 4px;
          padding: 1px 2px;
          border: none;
        }
        .mini-calendar .fc-v-event {
          background-color: #10b981;
        }
        .mini-calendar .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
        }
      `}</style>
    </Card>
  )
}
