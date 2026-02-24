"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderClientProps {
  isLoggedIn: boolean;
  role: string | null;
  email: string | null;
}

export default function HeaderClient({
  isLoggedIn,
  role,
  email,
}: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";

  function closeMobile() {
    setMobileOpen(false);
  }

  const isDashboardRoute = pathname.startsWith("/admin") || pathname.startsWith("/doctor");

  if (isDashboardRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white shadow">
            RS
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              RS Contoh Sehat
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Reservasi dokter tanpa antre
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        {!isLoggedIn && (
          <>
            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 dark:text-zinc-200 md:flex">
              <Link
                href="/"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Home
              </Link>
              <Link
                href="/#layanan"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Layanan
              </Link>
              <Link
                href="/doctors"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Dokter &amp; Jadwal
              </Link>
              <Link
                href="/login?callbackUrl=/booking"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Reservasi Online
              </Link>
              <Link
                href="/#tentang-kami"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Tentang Kami
              </Link>
              <Link
                href="/#kontak"
                className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Kontak
              </Link>
            </nav>
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 md:text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 md:text-sm"
              >
                Daftar
              </Link>
            </div>
          </>
        )}

        {isLoggedIn && (
          <>
            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 dark:text-zinc-200 md:flex">
              {role === "PATIENT" && (
                <>
                  <Link
                    href="/dashboard"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/booking"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Reservasi
                  </Link>
                  <Link
                    href="/doctors"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Dokter &amp; Jadwal
                  </Link>
                  <Link
                    href="/history"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Riwayat
                  </Link>
                  <Link
                    href="/checkin"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Check-in
                  </Link>
                </>
              )}
              {role === "DOCTOR" && (
                <>
                  <Link
                    href="/doctor/dashboard"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Dashboard dokter
                  </Link>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Dashboard admin
                  </Link>
                  <Link
                    href="/admin/doctors"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Dokter
                  </Link>
                  <Link
                    href="/admin/schedules"
                    className="transition hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    Jadwal
                  </Link>
                </>
              )}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex flex-col text-right text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  {email ?? "Pengguna"}
                </span>
                {role && (
                  <span className="uppercase tracking-wide text-[10px] text-zinc-500 dark:text-zinc-500">
                    {role === "PATIENT"
                      ? "Pasien"
                      : role === "DOCTOR"
                      ? "Dokter"
                      : "Admin"}
                  </span>
                )}
              </div>
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 md:text-sm"
              >
                Keluar
              </Link>
            </div>
          </>
        )}

        {/* Mobile toggle button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="mr-1 h-[1px] w-3 bg-current" />
          <span className="mt-[2px] h-[1px] w-3 bg-current" />
          <span className="mt-[2px] h-[1px] w-3 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white/95 px-4 pb-4 pt-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          {!isLoggedIn && (
            <div className="space-y-2">
              <Link
                href="/"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Home
              </Link>
              <Link
                href="/#layanan"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Layanan
              </Link>
              <Link
                href="/doctors"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Dokter &amp; Jadwal
              </Link>
              <Link
                href="/login?callbackUrl=/booking"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Reservasi Online
              </Link>
              <Link
                href="/#tentang-kami"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Tentang Kami
              </Link>
              <Link
                href="/#kontak"
                onClick={closeMobile}
                className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
              >
                Kontak
              </Link>
              <div className="mt-2 flex gap-2">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobile}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Daftar
                </Link>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <div className="space-y-2">
              {role === "PATIENT" && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/booking"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Reservasi
                  </Link>
                  <Link
                    href="/doctors"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dokter &amp; Jadwal
                  </Link>
                  <Link
                    href="/history"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Riwayat
                  </Link>
                  <Link
                    href="/checkin"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Check-in
                  </Link>
                </>
              )}
              {role === "DOCTOR" && (
                <>
                  <Link
                    href="/doctor/dashboard"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dashboard dokter
                  </Link>
                  <Link
                    href="/doctors"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dokter &amp; Jadwal
                  </Link>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dashboard admin
                  </Link>
                  <Link
                    href="/admin/doctors"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Dokter
                  </Link>
                  <Link
                    href="/admin/schedules"
                    onClick={closeMobile}
                    className="block py-1 text-zinc-800 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                  >
                    Jadwal
                  </Link>
                </>
              )}
              <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  {email ?? "Pengguna"}
                </span>
                {role && (
                  <span className="uppercase tracking-wide text-[10px] text-zinc-500 dark:text-zinc-500">
                    {role === "PATIENT"
                      ? "Pasien"
                      : role === "DOCTOR"
                      ? "Dokter"
                      : "Admin"}
                  </span>
                )}
              </div>
              <Link
                href="/api/auth/signout?callbackUrl=/"
                onClick={closeMobile}
                className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Keluar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
