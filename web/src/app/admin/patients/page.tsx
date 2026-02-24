'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Modal } from '@/components/ui/modal';

type DetailTab = 'personal' | 'records' | 'visits';

interface AppointmentDoctor {
  id: string;
  fullName: string;
  specialty: {
    id: string;
    name: string;
  };
}

interface AppointmentItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: "BPJS" | "GENERAL";
  status: string;
  doctor: AppointmentDoctor;
}

interface MedicalRecordItem {
  id: string;
  summary: string | null;
  lastVisitDate: string | null;
  chronicDiseases: string | null;
  allergies: string | null;
  lastDiagnosis: string | null;
}

interface PatientUser {
  id: string;
  email: string;
  phone: string | null;
}

interface Patient {
  id: string;
  fullName: string;
  nik: string;
  rmNumber: string | null;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  bpjsNumber: string | null;
  bpjsClass: string | null;
  isBpjs: boolean;
  phone: string | null;
  user: PatientUser;
  appointments: AppointmentItem[];
  medicalRecords: MedicalRecordItem[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export default function AdminPatientsPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bpjsFilter, setBpjsFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [detailActiveTab, setDetailActiveTab] =
    useState<DetailTab>("personal");
  const [visitSearch, setVisitSearch] = useState("");
  const [visitFilterType, setVisitFilterType] =
    useState<"" | "BPJS" | "GENERAL">("");
  const [visitFilterStatus, setVisitFilterStatus] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [rmNumber, setRmNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"" | "L" | "P">("");
  const [address, setAddress] = useState("");
  const [isBpjs, setIsBpjs] = useState(false);
  const [bpjsNumber, setBpjsNumber] = useState("");
  const [bpjsClass, setBpjsClass] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      if (bpjsFilter) {
        params.set("isBpjs", bpjsFilter);
      }
      params.set("page", String(page));

      const response = await fetch(
        `/api/admin/patients${params.toString() ? `?${params.toString()}` : ""}`
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (!cancelled) {
          const message =
            data?.message ??
            "Terjadi kesalahan saat mengambil data pasien, silakan coba lagi";
          toast({
            variant: "destructive",
            title: "Gagal memuat data pasien",
            description: message,
          });
        }
      } else if (!cancelled) {
        const payload = data as {
          items: Patient[];
          totalCount: number;
          page: number;
          totalPages: number;
        };
        setPatients(payload.items);
        setPage(payload.page);
        setTotalPages(payload.totalPages);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, bpjsFilter, page, toast]);

  function handleApplyFilter(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
  }

  async function openDetailModal(patientId: string) {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailPatient(null);
    setDetailActiveTab("personal");
    setVisitSearch("");
    setVisitFilterType("");
    setVisitFilterStatus("");

    const response = await fetch(`/api/admin/patients/${patientId}`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat memuat detail pasien, silakan coba lagi";
      setDetailError(message);
      setDetailLoading(false);
      toast({
        variant: "destructive",
        title: "Gagal memuat detail pasien",
        description: message,
      });
      return;
    }

    setDetailPatient(data as Patient);
    setDetailLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setSelectedPatient(null);
    setError("");
    setFieldErrors({});
    setFullName("");
    setEmail("");
    setPhone("");
    setNik("");
    setRmNumber("");
    setDateOfBirth("");
    setGender("");
    setAddress("");
    setIsBpjs(false);
    setBpjsNumber("");
    setBpjsClass("");
    setPassword("");
    setPasswordConfirm("");
  }

  function openCreateModal() {
    resetForm();
    setFormModalOpen(true);
  }

  function openEditModal(patient: Patient) {
    resetForm();
    setEditingId(patient.id);
    setSelectedPatient(patient);
    setFullName(patient.fullName);
    setEmail(patient.user.email);
    setPhone(patient.phone ?? patient.user.phone ?? "");
    setNik(patient.nik);
    setRmNumber(patient.rmNumber ?? "");
    setDateOfBirth(
      patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().slice(0, 10)
        : ""
    );
    setGender(
      patient.gender === "L" || patient.gender === "P" ? patient.gender : ""
    );
    setAddress(patient.address ?? "");
    setIsBpjs(patient.isBpjs);
    setBpjsNumber(patient.bpjsNumber ?? "");
    setBpjsClass(patient.bpjsClass ?? "");
    setFormModalOpen(true);
  }

  function closeFormModal() {
    setFormModalOpen(false);
    resetForm();
  }

  function openDeleteModal(patient: Patient) {
    setSelectedPatient(patient);
    setError("");
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setSelectedPatient(null);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!editingId) {
      if (!password || !passwordConfirm) {
        setError("Password awal dan konfirmasi wajib diisi");
        return;
      }

      if (password !== passwordConfirm) {
        setError("Konfirmasi password tidak sama");
        return;
      }
    }

    const payload: Record<string, unknown> = {
      fullName: fullName.trim(),
      email: email.trim(),
      nik: nik.trim(),
      rmNumber: rmNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      address: address.trim() || undefined,
      bpjsNumber: bpjsNumber.trim() || undefined,
      bpjsClass: bpjsClass.trim() || undefined,
      isBpjs,
    };

    if (!editingId) {
      payload.password = password;
    } else if (password) {
      payload.password = password;
    }

    const url = editingId
      ? `/api/admin/patients/${editingId}`
      : "/api/admin/patients";
    const method = editingId ? "PATCH" : "POST";

    setLoading(true);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    setLoading(false);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menyimpan data pasien, silakan coba lagi";
      setError(message);
      if (data?.fieldErrors && typeof data.fieldErrors === "object") {
        setFieldErrors(data.fieldErrors as Record<string, string[]>);
      }
      toast({
        variant: "destructive",
        title: "Gagal menyimpan data pasien",
        description: message,
      });
      return;
    }

    toast({
      variant: "success",
      title: editingId ? "Pasien diperbarui" : "Pasien ditambahkan",
      description: editingId
        ? "Data pasien berhasil diperbarui."
        : "Pasien baru berhasil ditambahkan.",
    });

    closeFormModal();
    setPage(1);
  }

  async function handleDelete() {
    if (!selectedPatient) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/admin/patients/${selectedPatient.id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    setLoading(false);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menghapus pasien, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menghapus pasien",
        description: message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Pasien dihapus",
      description: "Data pasien berhasil dihapus dari sistem.",
    });

    closeDeleteModal();
    setPage(1);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAppointmentStatus(status: string) {
    if (status === "BOOKED") return "Booked";
    if (status === "CHECKED_IN") return "Sudah check-in";
    if (status === "COMPLETED") return "Selesai";
    if (status === "CANCELLED") return "Dibatalkan";
    if (status === "NO_SHOW") return "Tidak hadir";
    return status;
  }

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manajemen pasien
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Lihat data pasien dan ringkasan riwayat kunjungan mereka.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-sm font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40"
          onClick={openCreateModal}
        >
          Tambah pasien
        </Button>
      </header>

      <section>
        <Card className="border-none bg-white/90 shadow-md shadow-emerald-500/10 ring-1 ring-zinc-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
          <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Daftar pasien terdaftar
              </span>
              <form
                className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3"
                onSubmit={handleApplyFilter}
              >
                <Input
                  placeholder="Cari nama, NIK, atau No. RM..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-8 min-w-[220px] text-xs"
                />
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={bpjsFilter}
                  onChange={(event) =>
                    setBpjsFilter(event.target.value as "" | "true" | "false")
                  }
                >
                  <option value="">Semua jenis pasien</option>
                  <option value="true">Pasien BPJS</option>
                  <option value="false">Pasien umum</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? "Memuat..." : "Terapkan filter"}
                </button>
              </form>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {patients.length === 0 && !loading && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada pasien yang cocok dengan filter saat ini.
              </p>
            )}
            {patients.length > 0 && (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <button
                    type="button"
                    key={patient.id}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white/90 p-4 text-left text-sm shadow-sm shadow-emerald-500/5 transition hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-emerald-500/70"
                    onClick={() => openDetailModal(patient.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60">
                        {getInitials(patient.fullName)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {patient.fullName}
                          </span>
                          {patient.isBpjs && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70">
                              BPJS
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {patient.rmNumber ? (
                            <span>No. RM: {patient.rmNumber}</span>
                          ) : (
                            <span>No. RM belum diisi</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="hidden flex-col items-end gap-1 text-right text-xs text-zinc-500 dark:text-zinc-400 sm:flex">
                      <span>{patient.nik}</span>
                      {patient.appointments[0] && (
                        <span>
                          Terakhir kontrol:{" "}
                          {formatDate(patient.appointments[0].date)}
                        </span>
                      )}
                    </div>
                  </button>
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
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
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
                        totalPages > 0 ? Math.min(totalPages, current + 1) : current
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

      <Modal
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) {
            setDetailPatient(null);
            setDetailError("");
            setDetailLoading(false);
          }
        }}
        title={
          detailPatient
            ? `Detail pasien - ${detailPatient.fullName}`
            : "Detail pasien"
        }
        description="Lihat informasi pribadi, rekam medis, dan riwayat kunjungan pasien."
      >
        {detailLoading && (
          <div className="py-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Memuat data pasien...
          </div>
        )}
        {!detailLoading && detailError && (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              {detailError}
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="rounded-lg"
                onClick={() => {
                  if (detailPatient) {
                    openDetailModal(detailPatient.id);
                  }
                }}
              >
                Coba lagi
              </Button>
            </div>
          </div>
        )}
        {!detailLoading && !detailError && detailPatient && (
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/60">
                  {getInitials(detailPatient.fullName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {detailPatient.fullName}
                    </span>
                    {detailPatient.isBpjs && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70">
                        BPJS
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {detailPatient.rmNumber
                      ? `No. RM: ${detailPatient.rmNumber}`
                      : "No. RM belum diisi"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEditModal(detailPatient);
                  }}
                >
                  Ubah data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    setDetailModalOpen(false);
                    openDeleteModal(detailPatient);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>

            <div className="flex gap-2 border-b border-zinc-200 pb-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <button
                type="button"
                className={`rounded-t-lg px-3 py-1 ${
                  detailActiveTab === "personal"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900/80"
                }`}
                onClick={() => setDetailActiveTab("personal")}
              >
                Informasi pribadi
              </button>
              <button
                type="button"
                className={`rounded-t-lg px-3 py-1 ${
                  detailActiveTab === "records"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900/80"
                }`}
                onClick={() => setDetailActiveTab("records")}
              >
                Rekam medis
              </button>
              <button
                type="button"
                className={`rounded-t-lg px-3 py-1 ${
                  detailActiveTab === "visits"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900/80"
                }`}
                onClick={() => setDetailActiveTab("visits")}
              >
                Riwayat kunjungan
              </button>
            </div>

            {detailActiveTab === "personal" && (
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      NIK
                    </div>
                    <div className="font-medium">{detailPatient.nik}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Tanggal lahir
                    </div>
                    <div className="font-medium">
                      {formatDate(detailPatient.dateOfBirth)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Jenis kelamin
                    </div>
                    <div className="font-medium">{detailPatient.gender}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Nomor HP
                    </div>
                    <div className="font-medium">
                      {detailPatient.phone ?? detailPatient.user.phone ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Email
                    </div>
                    <div className="font-medium">
                      {detailPatient.user.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Status kepesertaan
                    </div>
                    <div className="font-medium">
                      {detailPatient.isBpjs ? "BPJS" : "Umum"}
                    </div>
                  </div>
                  {detailPatient.bpjsNumber && (
                    <div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Nomor BPJS
                      </div>
                      <div className="font-medium">
                        {detailPatient.bpjsNumber}
                        {detailPatient.bpjsClass
                          ? ` (${detailPatient.bpjsClass})`
                          : ""}
                      </div>
                    </div>
                  )}
                </div>
                {detailPatient.address && (
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Alamat
                    </div>
                    <div className="text-xs">{detailPatient.address}</div>
                  </div>
                )}
              </div>
            )}

            {detailActiveTab === "records" && (
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                {detailPatient.medicalRecords.length === 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Belum ada data rekam medis tersimpan.
                  </p>
                )}
                {detailPatient.medicalRecords.length > 0 && (
                  <div className="space-y-3">
                    {detailPatient.medicalRecords.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/80"
                      >
                        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span>Terakhir kontrol</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {formatDate(record.lastVisitDate)}
                          </span>
                        </div>
                        {record.lastDiagnosis && (
                          <div className="mb-1">
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Diagnosis terakhir
                            </div>
                            <div className="font-medium">
                              {record.lastDiagnosis}
                            </div>
                          </div>
                        )}
                        {record.chronicDiseases && (
                          <div className="mb-1">
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Penyakit kronis
                            </div>
                            <div>{record.chronicDiseases}</div>
                          </div>
                        )}
                        {record.allergies && (
                          <div className="mb-1">
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Alergi
                            </div>
                            <div>{record.allergies}</div>
                          </div>
                        )}
                        {record.summary && (
                          <div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Ringkasan
                            </div>
                            <div>{record.summary}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailActiveTab === "visits" && (
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 gap-2">
                    <Input
                      placeholder="Cari berdasarkan dokter, poli, atau status..."
                      value={visitSearch}
                      onChange={(event) => setVisitSearch(event.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      value={visitFilterType}
                      onChange={(event) =>
                        setVisitFilterType(
                          event.target.value as "" | "BPJS" | "GENERAL"
                        )
                      }
                    >
                      <option value="">Semua jenis</option>
                      <option value="BPJS">BPJS</option>
                      <option value="GENERAL">Umum</option>
                    </select>
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      value={visitFilterStatus}
                      onChange={(event) =>
                        setVisitFilterStatus(event.target.value)
                      }
                    >
                      <option value="">Semua status</option>
                      <option value="BOOKED">Booked</option>
                      <option value="CHECKED_IN">Sudah check-in</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                      <option value="NO_SHOW">Tidak hadir</option>
                    </select>
                  </div>
                </div>

                {detailPatient.appointments.length === 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Belum ada riwayat kunjungan untuk pasien ini.
                  </p>
                )}

                {detailPatient.appointments.length > 0 && (
                  <div className="space-y-2">
                    {detailPatient.appointments
                      .filter((appointment) => {
                        const matchesType =
                          !visitFilterType ||
                          appointment.appointmentType === visitFilterType;
                        const matchesStatus =
                          !visitFilterStatus ||
                          appointment.status === visitFilterStatus;
                        const query = visitSearch.trim().toLowerCase();
                        if (!query) {
                          return matchesType && matchesStatus;
                        }
                        const combined = `${appointment.doctor.fullName} ${appointment.doctor.specialty.name} ${formatAppointmentStatus(
                          appointment.status
                        )}`.toLowerCase();
                        return (
                          matchesType &&
                          matchesStatus &&
                          combined.includes(query)
                        );
                      })
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col gap-1 rounded-lg bg-zinc-50/80 px-3 py-2 text-xs ring-1 ring-zinc-100 dark:bg-zinc-900/80 dark:ring-zinc-800"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                                {appointment.doctor.fullName}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/70">
                                {appointment.doctor.specialty.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDate(appointment.date)} •{" "}
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>
                                Jenis:{" "}
                                {appointment.appointmentType === "BPJS"
                                  ? "BPJS"
                                  : "Umum"}
                              </span>
                              <span className="mx-1 text-zinc-400">•</span>
                              <span>
                                Status:{" "}
                                {formatAppointmentStatus(appointment.status)}
                              </span>
                            </div>
                            <Link
                              href={`/admin/appointments/${appointment.id}`}
                              className="font-medium text-emerald-600 hover:underline"
                            >
                              Lihat detail
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={formModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormModal();
          } else {
            setFormModalOpen(true);
          }
        }}
        title={editingId ? "Ubah data pasien" : "Tambah pasien baru"}
        description="Kelola data identitas dan kepesertaan pasien."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Nama lengkap
              </label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nama sesuai KTP"
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.fullName[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@contoh.com"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Nomor HP
              </label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.phone[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                NIK
              </label>
              <Input
                value={nik}
                onChange={(event) => setNik(event.target.value)}
                placeholder="16 digit NIK"
              />
              {fieldErrors.nik && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.nik[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                No. rekam medis (opsional)
              </label>
              <Input
                value={rmNumber}
                onChange={(event) => setRmNumber(event.target.value)}
                placeholder="Jika sudah pernah berobat"
              />
              {fieldErrors.rmNumber && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.rmNumber[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Tanggal lahir
              </label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Jenis kelamin
              </label>
              <select
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value as "" | "L" | "P")
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Alamat
            </label>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Alamat domisili pasien"
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {fieldErrors.address && (
              <p className="text-[11px] text-red-600 dark:text-red-400">
                {fieldErrors.address[0]}
              </p>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Status kepesertaan
              </label>
              <select
                value={isBpjs ? "bpjs" : "umum"}
                onChange={(event) =>
                  setIsBpjs(event.target.value === "bpjs")
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="umum">Pasien umum</option>
                <option value="bpjs">Pasien BPJS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                No. BPJS
              </label>
              <Input
                value={bpjsNumber}
                onChange={(event) => setBpjsNumber(event.target.value)}
                placeholder="Nomor kartu BPJS"
              />
              {fieldErrors.bpjsNumber && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {fieldErrors.bpjsNumber[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Kelas BPJS
              </label>
              <Input
                value={bpjsClass}
                onChange={(event) => setBpjsClass(event.target.value)}
                placeholder="Contoh: Kelas 1"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Password awal akun pasien
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={editingId ? "Kosongkan jika tidak diubah" : ""}
              />
            </div>
            {!editingId && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                  Konfirmasi password
                </label>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) =>
                    setPasswordConfirm(event.target.value)
                  }
                />
              </div>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={closeFormModal}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-lg"
              disabled={loading}
            >
              {loading
                ? editingId
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : editingId
                ? "Simpan perubahan"
                : "Tambah pasien"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteModal();
          } else {
            setDeleteModalOpen(true);
          }
        }}
        title="Hapus pasien"
        description="Pasien yang dihapus tidak dapat dikembalikan."
      >
        <div className="space-y-4 text-sm">
          <p>
            Apakah Anda yakin ingin menghapus pasien{" "}
            <span className="font-semibold">
              {selectedPatient?.fullName ?? ""}
            </span>
            ?
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Pasien yang memiliki riwayat kunjungan, rujukan, atau rekam medis
            tidak dapat dihapus.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={closeDeleteModal}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
