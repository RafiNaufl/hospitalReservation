"use client";

import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  History, 
  PlusCircle, 
  ArrowRight,
  ChevronRight,
  Stethoscope,
  Activity,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  appointmentType: string;
  doctor: {
    fullName: string;
    specialty?: { name: string } | null;
  };
}

interface Patient {
  id: string;
  fullName: string;
  nik: string;
  bpjsNumber: string | null;
  phone: string;
  photoUrl: string | null;
}

interface DashboardClientProps {
  patient: Patient | null;
  userEmail: string;
  upcomingAppointments: Appointment[];
  visitHistory: Appointment[];
  lastRecord: {
    lastVisitDate: Date | null;
    lastDiagnosis: string | null;
    summary: string | null;
  } | null;
}

export function DashboardClient({
  patient,
  userEmail,
  upcomingAppointments,
  visitHistory,
  lastRecord,
}: DashboardClientProps) {
  const firstName = patient?.fullName.split(" ")[0] || userEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 animate-in fade-in duration-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-emerald-600 px-6 py-10 text-white shadow-xl shadow-emerald-200 dark:shadow-none sm:px-12 sm:py-16 animate-in slide-in-from-top duration-500">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Halo, {firstName}! 👋
              </h1>
              <p className="text-lg text-emerald-50/90 sm:text-xl">
                Pantau kesehatan Anda dan kelola janji temu dengan mudah.
              </p>
            </div>
            <Link href="/booking">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-5 w-5" />
                Buat Janji Temu
              </Button>
            </Link>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-700/30 blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <StatCard 
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            label="Janji Mendatang"
            value={upcomingAppointments.length.toString()}
            color="bg-blue-50 dark:bg-blue-950/30"
          />
          <StatCard 
            icon={<History className="h-6 w-6 text-emerald-600" />}
            label="Total Kunjungan"
            value={visitHistory.length.toString()}
            color="bg-emerald-50 dark:bg-emerald-950/30"
          />
          <StatCard 
            icon={<CreditCard className="h-6 w-6 text-purple-600" />}
            label="Status BPJS"
            value={patient?.bpjsNumber ? "Aktif" : "Umum"}
            color="bg-purple-50 dark:bg-purple-950/30"
          />
          <StatCard 
            icon={<Activity className="h-6 w-6 text-rose-600" />}
            label="Kesehatan"
            value="Normal"
            color="bg-rose-50 dark:bg-rose-950/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          {/* Left Column: Appointments */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 pb-4 dark:border-zinc-800">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Janji Temu Mendatang
                </CardTitle>
                {upcomingAppointments.length > 0 && (
                  <Link href="/history" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Lihat Semua
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4 rounded-full bg-zinc-50 p-4 dark:bg-zinc-800">
                      <Calendar className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500">Belum ada janji temu yang dijadwalkan.</p>
                    <Link href="/booking" className="mt-4">
                      <Button variant="outline">Mulai Cari Dokter</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((app) => (
                      <div key={app.id} className="group flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/30 p-4 transition-all hover:border-emerald-100 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-900/50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm dark:border-zinc-800">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              {app.doctor.fullName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{app.doctor.fullName}</h4>
                            <p className="text-sm text-zinc-500">{app.doctor.specialty?.name || "Dokter Umum"}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:text-right">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(app.date).toLocaleDateString("id-ID", { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 sm:justify-end">
                              <Clock className="h-3.5 w-3.5" />
                              {app.startTime} - {app.endTime}
                            </div>
                          </div>
                          <Badge className={
                            app.status === "PENDING" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" :
                            app.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
                          }>
                            {app.status === "PENDING" ? "Menunggu" : 
                             app.status === "CONFIRMED" ? "Dikonfirmasi" : app.status}
                          </Badge>
                          <Link href={`/booking/${app.id}`}>
                            <Button size="icon" variant="ghost" className="hidden sm:flex text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-100/50">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <QuickActionCard 
                icon={<Stethoscope className="h-6 w-6" />}
                title="Cari Dokter"
                description="Temukan spesialis yang tepat"
                href="/doctors"
                color="bg-blue-600"
              />
              <QuickActionCard 
                icon={<History className="h-6 w-6" />}
                title="Riwayat Medis"
                description="Lihat catatan kesehatan"
                href="/history"
                color="bg-emerald-600"
              />
              <QuickActionCard 
                icon={<FileText className="h-6 w-6" />}
                title="Check-in Online"
                description="Tanpa antre di loket"
                href="/checkin"
                color="bg-purple-600"
              />
            </div>
          </div>

          {/* Right Column: Profile & Sidebar */}
          <div className="space-y-8">
            <Card className="overflow-hidden border-none bg-white shadow-sm dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Profil Pasien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={patient?.photoUrl || ""} alt={patient?.fullName || "Patient"} className="object-cover" />
                    <AvatarFallback className="bg-zinc-100 text-2xl text-zinc-500 dark:bg-zinc-800">
                      {firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{patient?.fullName || "Lengkapi Profil"}</h3>
                    <p className="text-sm text-zinc-500">{userEmail}</p>
                  </div>
                </div>
                
                <div className="space-y-4 rounded-2xl bg-zinc-50/50 p-4 dark:bg-zinc-800/50">
                  <ProfileItem label="NIK" value={patient?.nik || "-"} />
                  <ProfileItem label="No. BPJS" value={patient?.bpjsNumber || "-"} />
                  <ProfileItem label="No. Telepon" value={patient?.phone || "-"} />
                </div>

                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                    Edit Profil Lengkap
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Kunjungan Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                {lastRecord ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30 text-emerald-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Tanggal</p>
                        <p className="text-sm font-semibold">
                          {lastRecord.lastVisitDate ? new Date(lastRecord.lastVisitDate).toLocaleDateString("id-ID") : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Diagnosis/Catatan</p>
                        <p className="text-sm font-medium line-clamp-2">
                          {lastRecord.lastDiagnosis || lastRecord.summary || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic text-center py-4">
                    Belum ada data kunjungan medis.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="border-none bg-white shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md dark:bg-zinc-900">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-2xl p-3 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ icon, title, description, href, color }: { icon: React.ReactNode; title: string; description: string; href: string; color: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full border-none bg-white shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className={`w-fit rounded-xl p-2 text-white shadow-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">{title}</h3>
            <p className="text-xs text-zinc-500 line-clamp-1">{description}</p>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-600 opacity-0 transition-all group-hover:opacity-100">
            Buka <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}
