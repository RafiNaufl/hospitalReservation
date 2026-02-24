"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Calendar, 
  History, 
  UserCircle,
  Stethoscope,
  Bell,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderClientProps {
  isLoggedIn: boolean;
  role: string | null;
  email: string | null;
  name: string | null;
}

export default function HeaderClient({
  isLoggedIn: initialIsLoggedIn,
  role: initialRole,
  email: initialEmail,
  name: initialName,
}: HeaderClientProps) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (profileOpen) {
      const handleClick = () => setProfileOpen(false);
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [profileOpen]);

  // Gunakan data session dari client jika sudah tersedia
  const isLoggedIn = status === "loading" ? initialIsLoggedIn : status === "authenticated";
  const user = session?.user as { email?: string; role?: string; image?: string; name?: string } | undefined;
  const role = status === "loading" ? initialRole : (user?.role ?? null);
  const email = status === "loading" ? initialEmail : (user?.email ?? null);
  const photoUrl = user?.image ?? null;
  const displayName = (status === "loading" ? initialName : user?.name) || email?.split("@")[0] || "Pengguna";

  function closeMobile() {
    setMobileOpen(false);
  }

  const isDashboardRoute = pathname.startsWith("/admin") || pathname.startsWith("/doctor/");

  if (isDashboardRoute) {
    return null;
  }

  const patientNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Reservasi", href: "/booking", icon: Calendar },
    { label: "Dokter", href: "/doctors", icon: Stethoscope },
    { label: "Riwayat", href: "/history", icon: History },
  ];

  const publicNavItems = [
    { label: "Home", href: "/" },
    { label: "Layanan", href: "/#layanan" },
    { label: "Dokter", href: "/doctors" },
    { label: "Tentang Kami", href: "/#tentang-kami" },
  ];

  const doctorNavItems = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Riwayat Pasien", href: "/doctor/history", icon: History },
    { label: "Profil Saya", href: "/doctor/profile", icon: UserIcon },
  ];

  const adminNavItems = [
    { label: "Dashboard Admin", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Dokter", href: "/admin/doctors", icon: Stethoscope },
    { label: "Jadwal", href: "/admin/schedules", icon: Calendar },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "border-b border-zinc-200 bg-white/70 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/70" 
        : "bg-white dark:bg-zinc-950"
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 group" onClick={closeMobile}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-transform group-hover:scale-105">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              RS Sehat Online
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Healthcare Solution
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {(!isLoggedIn 
            ? publicNavItems 
            : (role === "PATIENT" 
              ? patientNavItems 
              : role === "DOCTOR" 
                ? doctorNavItems 
                : role === "ADMIN" 
                  ? adminNavItems 
                  : [])
          ).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" 
                    : "text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-6 shadow-md shadow-emerald-100 dark:shadow-none">Daftar</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-emerald-600">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50/50 p-1 pr-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <Avatar className="h-8 w-8 border border-white dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={photoUrl || ""} className="object-cover" />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                      {displayName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {displayName}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50 animate-in fade-in zoom-in-95 duration-200 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                    <div className="p-4 border-b border-zinc-50 dark:border-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Akun Saya</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {role === "PATIENT" ? "Pasien" : role === "DOCTOR" ? "Dokter" : "Admin"}
                      </span>
                    </div>
                    <div className="p-1">
                      <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 rounded-xl hover:bg-zinc-50 hover:text-emerald-600 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800/50">
                        <UserIcon className="h-4 w-4" /> Profil Lengkap
                      </Link>
                    </div>
                    <div className="p-1 border-t border-zinc-50 dark:border-zinc-800">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="h-4 w-4" /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[65px] z-50 overflow-y-auto bg-white dark:bg-zinc-950 animate-in slide-in-from-right duration-300 md:hidden">
          <div className="flex flex-col p-6 space-y-6">
            {!isLoggedIn ? (
              <>
                <div className="space-y-2">
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-3 text-lg font-semibold text-zinc-800 hover:text-emerald-600 dark:text-zinc-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Link href="/login" onClick={closeMobile}>
                    <Button variant="outline" className="w-full rounded-2xl py-6">Login</Button>
                  </Link>
                  <Link href="/register" onClick={closeMobile}>
                    <Button className="w-full rounded-2xl py-6">Daftar</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <Avatar className="h-14 w-14 border-2 border-emerald-100 shadow-md">
                    <AvatarImage src={photoUrl || ""} className="object-cover" />
                    <AvatarFallback className="bg-emerald-100 text-xl font-bold text-emerald-700">
                      {displayName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {displayName}
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">{email}</p>
                    <span className="inline-block w-fit mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/30">
                      {role === "PATIENT" ? "Pasien" : role === "DOCTOR" ? "Dokter" : "Admin"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {(role === "PATIENT" 
                    ? patientNavItems 
                    : role === "DOCTOR" 
                      ? doctorNavItems 
                      : role === "ADMIN" 
                        ? adminNavItems 
                        : []
                  ).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex items-center gap-4 py-4 px-4 rounded-2xl text-lg font-semibold transition-colors ${
                        pathname === item.href 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" 
                          : "text-zinc-800 dark:text-zinc-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="pt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Link href="/profile" onClick={closeMobile} className="flex items-center gap-4 py-3 text-zinc-600 dark:text-zinc-400">
                    <UserIcon className="h-5 w-5" /> Profil Lengkap
                  </Link>
                  <button
                    onClick={() => {
                      closeMobile();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-4 py-4 text-lg font-bold text-rose-600"
                  >
                    <LogOut className="h-5 w-5" /> Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
