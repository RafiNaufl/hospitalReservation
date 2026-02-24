"use client"

import { Bell, LogOut } from "lucide-react"
import { SearchPatients } from "./SearchPatients"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface DashboardHeaderProps {
  doctorName: string
  photoUrl?: string | null
  specialtyName?: string
  onSearch: (query: string) => void
  notificationsCount?: number
}

export function DashboardHeader({
  doctorName,
  photoUrl,
  specialtyName = "Spesialis",
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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center border-b border-zinc-100 bg-white/80 px-4 backdrop-blur-md md:px-8 shadow-sm">
      <div className="flex w-full items-center justify-between gap-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          <div className="md:hidden w-10" /> {/* Spacer for mobile menu toggle */}
        </div>

        <div className="flex-1 flex justify-center max-w-md">
          <SearchPatients onSearch={onSearch} />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Button variant="ghost" size="icon" className="rounded-xl text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-4 ring-white animate-bounce shadow-sm">
                  {notificationsCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-zinc-100">
            <div className="hidden text-right lg:block">
              <div className="text-xs font-black tracking-tight text-zinc-900 uppercase">
                dr. {doctorName}
              </div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                {specialtyName}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/doctor/profile">
                <Avatar className="h-10 w-10 border-2 border-emerald-50 shadow-md ring-2 ring-emerald-500/10 transition-transform hover:scale-105">
                  <AvatarImage src={photoUrl || undefined} alt={doctorName} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-black text-xs">
                    {getInitials(doctorName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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

