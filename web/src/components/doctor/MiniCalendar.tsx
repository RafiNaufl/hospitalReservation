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
    <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-zinc-50/80 to-white border-b border-zinc-100 px-6">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-zinc-900">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-100">
            <CalendarIcon className="w-3.5 h-3.5 text-white" />
          </div>
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
            height="550px"
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
          font-family: inherit;
          font-size: 0.7rem;
          border: none;
        }
        .mini-calendar .fc-theme-standard td,
        .mini-calendar .fc-theme-standard th {
          border-color: #f8fafc;
        }
        .mini-calendar .fc-timegrid-slot {
          height: 3em !important;
          border-bottom: 1px dashed #f1f5f9 !important;
        }
        .mini-calendar .fc-timegrid-slot-label {
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .mini-calendar .fc-event {
          border-radius: 8px;
          padding: 4px 6px;
          border: none;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          transition: transform 0.2s;
        }
        .mini-calendar .fc-event:hover {
          transform: scale(1.02);
          z-index: 10;
        }
        .mini-calendar .fc-event-title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        .mini-calendar .fc-event-time {
          font-weight: 700;
          opacity: 0.8;
        }
        .mini-calendar .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }
        .mini-calendar .fc-timegrid-now-indicator-arrow {
          border-color: #ef4444;
          border-width: 5px;
        }
      `}</style>
    </Card>
  )
}
