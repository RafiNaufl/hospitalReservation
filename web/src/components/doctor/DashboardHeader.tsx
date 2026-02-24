"use client"

import { Bell, LogOut } from "lucide-react"
import { SearchPatients } from "./SearchPatients"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  doctorName: string
  photoUrl?: string | null
  onSearch: (query: string) => void
  notificationsCount?: number
}

export function DashboardHeader({
  doctorName,
  photoUrl,
  onSearch,
  notificationsCount = 0,
}: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-white px-4 md:px-6 shadow-sm">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
            RS
          </div>
          <h1 className="hidden text-lg font-bold text-emerald-900 sm:block">
            Contoh Sehat
          </h1>
        </div>

        <div className="flex-1 flex justify-center">
          <SearchPatients onSearch={onSearch} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-emerald-600">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-zinc-200">
            <div className="hidden text-right lg:block">
              <div className="text-sm font-semibold leading-none text-zinc-900">
                {doctorName}
              </div>
              <div className="mt-1 text-xs font-medium text-emerald-600">
                Dokter
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border-2 border-emerald-50 shadow-sm">
                <AvatarImage src={photoUrl || undefined} alt={doctorName} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                  {getInitials(doctorName)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-red-600"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
