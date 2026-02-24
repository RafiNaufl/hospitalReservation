"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Modal } from "@/components/ui/modal";

interface Specialty {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  fullName: string;
  location: string | null;
  specialty: Specialty;
  acceptsBpjs: boolean;
  photoUrl?: string | null;
}

export default function AdminDoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filterSpecialtyId, setFilterSpecialtyId] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptsBpjs, setAcceptsBpjs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/doctors")
      .then((response) => response.json())
      .then((data: Doctor[]) => {
        if (!cancelled) {
          setDoctors(data);
        }
      })
      .catch(() => {});

    fetch("/api/specialties")
      .then((response) => response.json())
      .then((data: Specialty[]) => {
        if (!cancelled) {
          setSpecialties(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesName =
      !searchName.trim() ||
      doctor.fullName.toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesSpecialty =
      !filterSpecialtyId || doctor.specialty.id === filterSpecialtyId;
    return matchesName && matchesSpecialty;
  });
  function resetForm() {
    setFullName("");
    setSpecialtyId("");
    setLocation("");
    setEmail("");
    setPassword("");
    setPhone("");
    setAcceptsBpjs(true);
    setEditingId(null);
    setError("");
    setFieldErrors({});
    setPhotoPreview(null);
    setPhotoFile(null);
  }

  function validateField(name: string, value: string) {
    const trimmed = value.trim();
    if (name === "fullName") {
      if (!trimmed) {
        return "Nama dokter wajib diisi";
      }
      if (trimmed.length < 3) {
        return "Nama dokter minimal 3 karakter";
      }
    }
    if (name === "specialtyId") {
      if (!trimmed) {
        return "Poli wajib dipilih";
      }
    }
    if (name === "email" && !editingId) {
      if (!trimmed) {
        return "Email dokter wajib diisi";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return "Format email tidak valid";
      }
    }
    if (name === "phone" && !editingId) {
      if (!trimmed) {
        return "Nomor HP wajib diisi";
      }
      if (trimmed.length < 8) {
        return "Nomor HP minimal 8 digit";
      }
    }
    if (name === "password" && !editingId) {
      if (!trimmed) {
        return "Kata sandi wajib diisi";
      }
      if (trimmed.length < 6) {
        return "Kata sandi minimal 6 karakter";
      }
    }
    return "";
  }

  function handleFieldChange(
    name: string,
    value: string,
    updater: (value: string) => void
  ) {
    updater(value);
    const message = validateField(name, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const newErrors: Record<string, string> = {};

    const fullNameError = validateField("fullName", fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    const specialtyError = validateField("specialtyId", specialtyId);
    if (specialtyError) newErrors.specialtyId = specialtyError;

    if (!editingId) {
      const emailError = validateField("email", email);
      if (emailError) newErrors.email = emailError;
      const phoneError = validateField("phone", phone);
      if (phoneError) newErrors.phone = phoneError;
      const passwordError = validateField("password", password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const message = "Beberapa field belum diisi dengan benar";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    setLoading(true);

    const payload: {
      fullName: string;
      specialtyId: string;
      location?: string;
      acceptsBpjs: boolean;
      email?: string;
      password?: string;
      phone?: string;
    } = {
      fullName: fullName.trim(),
      specialtyId,
      location: location.trim() || undefined,
      acceptsBpjs,
    };

    if (!editingId) {
      payload.email = email.trim();
      payload.password = password;
      payload.phone = phone.trim();
    }

    const response = await fetch(
      editingId ? `/api/admin/doctors/${editingId}` : "/api/admin/doctors",
      {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    setLoading(false);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menyimpan data dokter, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan data dokter",
        description: message,
      });
      return;
    }

    const isEditing = Boolean(editingId);

    const doctorId = isEditing ? editingId : data?.id;

    if (doctorId && photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);
      try {
        const uploadResponse = await fetch(`/api/doctors/${doctorId}/photo`, {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json().catch(() => null);
          toast({
            variant: "destructive",
            title: "Foto tidak dapat diupload",
            description:
              uploadData?.message ??
              "Terjadi kesalahan saat mengupload foto dokter",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Foto tidak dapat diupload",
          description:
            "Terjadi kesalahan jaringan saat mengupload foto dokter",
        });
      }
    }

    resetForm();
    setFormModalOpen(false);

    toast({
      variant: "success",
      title: isEditing ? "Data dokter diperbarui" : "Dokter ditambahkan",
      description: isEditing
        ? "Perubahan data dokter berhasil disimpan."
        : "Dokter baru berhasil ditambahkan ke sistem.",
    });
    const doctorsResponse = await fetch("/api/admin/doctors");
    const doctorsData = (await doctorsResponse.json()) as Doctor[];
    setDoctors(doctorsData);
  }

  async function handleDelete(id: string) {
    setError("");
    const response = await fetch(`/api/admin/doctors/${id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menghapus dokter, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menghapus dokter",
        description: message,
      });
      return;
    }

    const doctorsResponse = await fetch("/api/admin/doctors");
    const doctorsData = (await doctorsResponse.json()) as Doctor[];
    setDoctors(doctorsData);

    toast({
      variant: "success",
      title: "Dokter dihapus",
      description: "Data dokter berhasil dihapus dari sistem.",
    });
  }

  function handleEdit(doctor: Doctor) {
    setError("");
    setEditingId(doctor.id);
    setFullName(doctor.fullName);
    setSpecialtyId(doctor.specialty.id);
    setLocation(doctor.location ?? "");
    setAcceptsBpjs(doctor.acceptsBpjs);
    setSelectedDoctor(doctor);
    setPhotoPreview(doctor.photoUrl ?? null);
    setFieldErrors({});
    setFormModalOpen(true);
  }

  function handleCancelEdit() {
    resetForm();
    setFormModalOpen(false);
  }

  function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Format file tidak didukung",
        description: "Gunakan foto dengan format JPG atau PNG.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Ukuran file terlalu besar",
        description: "Maksimal ukuran foto adalah 2MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === "string" ? reader.result : "";
      const image = new Image();
      image.onload = () => {
        const size = Math.min(image.width, image.height);
        const offsetX = (image.width - size) / 2;
        const offsetY = (image.height - size) / 2;
        const canvas = document.createElement("canvas");
        const finalSize = 512;
        canvas.width = finalSize;
        canvas.height = finalSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setPhotoFile(file);
          setPhotoPreview(base64);
          return;
        }
        ctx.drawImage(
          image,
          offsetX,
          offsetY,
          size,
          size,
          0,
          0,
          finalSize,
          finalSize
        );
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setPhotoFile(file);
              setPhotoPreview(base64);
              return;
            }
            const optimized = new File([blob], file.name, {
              type: "image/jpeg",
            });
            setPhotoFile(optimized);
            setPhotoPreview(URL.createObjectURL(optimized));
          },
          "image/jpeg",
          0.8
        );
      };
      image.src = base64;
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manajemen dokter
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tambah, ubah, dan kelola profil dokter beserta jadwal praktik.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-sm font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40"
          onClick={() => {
            resetForm();
            setFormModalOpen(true);
          }}
        >
          Tambah dokter
        </Button>
      </header>

      <section>
        <Card className="border-none bg-white/90 shadow-md shadow-emerald-500/10 ring-1 ring-zinc-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
          <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Daftar dokter
              </span>
              <div className="flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:gap-3">
                <span className="font-medium">
                  {filteredDoctors.length} dari {doctors.length} dokter
                </span>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Cari nama dokter..."
                    value={searchName}
                    onChange={(event) => setSearchName(event.target.value)}
                    className="h-8 max-w-xs text-xs"
                  />
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={filterSpecialtyId}
                    onChange={(event) => setFilterSpecialtyId(event.target.value)}
                  >
                    <option value="">Semua poli</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {doctors.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada dokter terdaftar.
              </p>
            )}
            {doctors.length > 0 && filteredDoctors.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tidak ada dokter yang cocok dengan filter saat ini.
              </p>
            )}
            {filteredDoctors.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Poli</th>
                      <th className="px-3 py-2">Lokasi</th>
                      <th className="px-3 py-2">BPJS</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr
                        key={doctor.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
                      >
                        <td className="px-3 py-2">{doctor.fullName}</td>
                        <td className="px-3 py-2">{doctor.specialty.name}</td>
                        <td className="px-3 py-2">
                          {doctor.location || "-"}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {doctor.acceptsBpjs ? "Menerima BPJS" : "Umum saja"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleEdit(doctor)}
                            >
                              Ubah
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setDeleteModalOpen(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Modal
        open={formModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit();
          } else {
            setFormModalOpen(true);
          }
        }}
        title={editingId ? "Ubah data dokter" : "Tambah dokter baru"}
        description="Lengkapi data profil dokter berikut dengan benar."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Nama dokter
            </label>
            <Input
              value={fullName}
              onChange={(event) =>
                handleFieldChange("fullName", event.target.value, setFullName)
              }
              placeholder="Contoh: dr. Budi Santoso, Sp.PD"
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Poli/Spesialis
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={specialtyId}
              onChange={(event) =>
                handleFieldChange(
                  "specialtyId",
                  event.target.value,
                  setSpecialtyId
                )
              }
            >
              <option value="">Pilih poli</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
            {fieldErrors.specialtyId && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.specialtyId}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Lokasi praktik
            </label>
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Contoh: Gedung A, Lantai 2"
            />
          </div>
          {!editingId && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                  Email dokter
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    handleFieldChange("email", event.target.value, setEmail)
                  }
                  placeholder="contoh@rscontoh.co.id"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                  Nomor HP dokter
                </label>
                <Input
                  value={phone}
                  onChange={(event) =>
                    handleFieldChange("phone", event.target.value, setPhone)
                  }
                  placeholder="08xxxxxxxxxx"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                  Kata sandi untuk login dokter
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    handleFieldChange(
                      "password",
                      event.target.value,
                      setPassword
                    )
                  }
                  placeholder="Minimal 6 karakter"
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Foto profil dokter
            </label>
            <div
              className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-3 py-3 text-xs text-zinc-600 transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-zinc-300"
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) {
                  handlePhotoChange(file);
                }
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-semibold text-white">
                {photoPreview ? (
                  <NextImage
                    src={photoPreview}
                    alt="Preview foto dokter"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>Foto</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                  Drag & drop atau klik untuk upload
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Format JPG/PNG, maksimal 2MB. Foto akan otomatis dipotong
                  persegi dan dioptimasi.
                </span>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="block w-full text-[11px] text-zinc-500 file:mr-2 file:rounded-md file:border-0 file:bg-emerald-600 file:px-2 file:py-1 file:text-xs file:font-medium file:text-white file:hover:bg-emerald-700"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      handlePhotoChange(file);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                Kepesertaan BPJS
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Tandai apakah dokter menerima pasien BPJS.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                {acceptsBpjs ? "Menerima BPJS" : "Tidak menerima BPJS"}
              </span>
              <button
                type="button"
                onClick={() => setAcceptsBpjs((value) => !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                  acceptsBpjs
                    ? "border-emerald-600 bg-emerald-600"
                    : "border-zinc-400 bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    acceptsBpjs ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Menyimpan..."
                : editingId
                ? "Simpan perubahan"
                : "Simpan dokter"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false);
            setSelectedDoctor(null);
          } else {
            setDeleteModalOpen(true);
          }
        }}
        title="Hapus dokter"
        description="Tindakan ini akan menghapus data dokter dari sistem."
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Apakah Anda yakin ingin menghapus dokter{" "}
          <span className="font-semibold">
            {selectedDoctor?.fullName ?? ""}
          </span>
          ?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedDoctor(null);
            }}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-red-600 hover:bg-red-700"
            onClick={async () => {
              if (!selectedDoctor) return;
              await handleDelete(selectedDoctor.id);
              setDeleteModalOpen(false);
              setSelectedDoctor(null);
            }}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </>
  );
}
