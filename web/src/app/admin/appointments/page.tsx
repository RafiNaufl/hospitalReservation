'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface AppointmentPatient {
  id: string;
  fullName: string;
  nik: string;
  rmNumber: string | null;
}

interface AppointmentDoctor {
  id: string;
  fullName: string;
  specialty: {
    id: string;
    name: string;
  };
}

interface AppointmentListItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: 'BPJS' | 'GENERAL';
  status: string;
  bookingCode: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAppointmentStatus(status: string) {
  if (status === 'BOOKED') return 'Booked';
  if (status === 'CHECKED_IN') return 'Sudah check-in';
  if (status === 'COMPLETED') return 'Selesai';
  if (status === 'CANCELLED') return 'Dibatalkan';
  if (status === 'NO_SHOW') return 'Tidak hadir';
  return status;
}

export default function AdminAppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'BPJS' | 'GENERAL'>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      if (typeFilter) {
        params.set('type', typeFilter);
      }
      if (startDate) {
        params.set('startDate', startDate);
      }
      if (endDate) {
        params.set('endDate', endDate);
      }
      params.set('page', String(page));

      const response = await fetch(
        `/api/admin/appointments${
          params.toString() ? `?${params.toString()}` : ''
        }`,
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (!cancelled) {
          const message =
            data?.message ??
            'Terjadi kesalahan saat mengambil data kunjungan, silakan coba lagi';
          toast({
            variant: 'destructive',
            title: 'Gagal memuat data kunjungan',
            description: message,
          });
        }
      } else if (!cancelled) {
        const payload = data as {
          items: AppointmentListItem[];
          totalCount: number;
          page: number;
          totalPages: number;
        };
        setAppointments(payload.items);
        setPage(payload.page);
        setTotalPages(payload.totalPages);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, statusFilter, typeFilter, startDate, endDate, page, toast]);

  function handleApplyFilter(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Semua kunjungan pasien
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pantau seluruh reservasi dan kunjungan pasien ke semua poli dan dokter.
          </p>
        </div>
      </header>

      <section>
        <Card className="border-none bg-white/90 shadow-md shadow-emerald-500/10 ring-1 ring-zinc-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
          <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Daftar kunjungan
              </span>
              <form
                className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3"
                onSubmit={handleApplyFilter}
              >
                <Input
                  placeholder="Cari pasien, dokter, poli, atau kode booking..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-8 min-w-[240px] text-xs"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-zinc-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-zinc-100"
                    />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      s/d
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-zinc-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-zinc-100"
                    />
                  </div>
                </div>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as '' | 'BPJS' | 'GENERAL')
                  }
                >
                  <option value="">Semua jenis</option>
                  <option value="BPJS">BPJS</option>
                  <option value="GENERAL">Umum</option>
                </select>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Semua status</option>
                  <option value="BOOKED">Booked</option>
                  <option value="CHECKED_IN">Sudah check-in</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="NO_SHOW">Tidak hadir</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Memuat...' : 'Terapkan filter'}
                </button>
              </form>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {appointments.length === 0 && !loading && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada kunjungan yang cocok dengan filter saat ini.
              </p>
            )}
            {appointments.length > 0 && (
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white/95 p-3 text-xs shadow-sm shadow-emerald-500/5 dark:border-zinc-800 dark:bg-zinc-950/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {formatDate(appointment.date)} • {appointment.startTime} -{' '}
                          {appointment.endTime}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700">
                          {appointment.bookingCode}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {appointment.appointmentType === 'BPJS'
                          ? 'BPJS'
                          : 'Umum / pribadi'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Pasien
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {appointment.patient.fullName}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            NIK: {appointment.patient.nik}
                          </span>
                          {appointment.patient.rmNumber && (
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              • No. RM: {appointment.patient.rmNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-right sm:text-left">
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Dokter & poli
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-start">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {appointment.doctor.fullName}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70">
                            {appointment.doctor.specialty.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Status: {formatAppointmentStatus(appointment.status)}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/appointments/${appointment.id}`}
                          className="inline-flex h-7 items-center justify-center rounded-full border border-emerald-200 px-3 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/70 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        >
                          Lihat detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page >= totalPages || loading}
                    onClick={() =>
                      setPage((current) =>
                        totalPages > 0
                          ? Math.min(totalPages, current + 1)
                          : current,
                      )
                    }
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
