"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  History, 
  UserCog, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Riwayat", href: "/doctor/history", icon: History },
  { label: "Profil", href: "/doctor/profile", icon: UserCog },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-5 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-72 transform border-r border-zinc-100 bg-white transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex h-full flex-col px-6 py-8">
          {/* Logo */}
          <Link href="/doctor/dashboard" className="mb-12 flex items-center gap-4 px-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200 ring-2 ring-emerald-50">
              RS
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-zinc-900 tracking-tight uppercase leading-none mb-1">
                RS Contoh Sehat
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Dashboard Dokter
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50 ring-1 ring-emerald-100" 
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="mt-auto pt-6 border-t border-zinc-50">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
