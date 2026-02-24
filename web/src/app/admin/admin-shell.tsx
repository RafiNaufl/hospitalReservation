"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const pathname = usePathname() ?? "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/doctors",
      label: "Dokter",
      icon: Stethoscope,
    },
    {
      href: "/admin/schedules",
      label: "Jadwal",
      icon: CalendarDays,
    },
    {
      href: "/admin/appointments",
      label: "Kunjungan",
      icon: CalendarDays,
    },
    {
      href: "/admin/specialties",
      label: "Poli",
      icon: Stethoscope,
    },
    {
      href: "/admin/patients",
      label: "Pasien",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-zinc-900 dark:from-zinc-950 dark:via-emerald-950/30 dark:to-zinc-950">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/60 bg-white/90 shadow-xl shadow-emerald-500/10 backdrop-blur-md transition-transform duration-200 ease-out dark:border-zinc-800/60 dark:bg-zinc-900/90 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/40">
              RS
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Admin
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Hospital Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3 pb-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/30"
                    : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-emerald-300"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] transition-colors ${
                    isActive
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:border-emerald-200 group-hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-2 border-t border-zinc-100/70 px-3 pt-3 text-xs dark:border-zinc-800/70">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <LogOut className="h-3.5 w-3.5" />
              </span>
              <span>Keluar</span>
            </span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Admin
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
