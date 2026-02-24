"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Modal } from "@/components/ui/modal";

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

export default function AdminSpecialtiesPage() {
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/specialties")
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

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setError("");
  }

  const filteredSpecialties = specialties.filter((specialty) =>
    !searchName.trim()
      ? true
      : specialty.name.toLowerCase().includes(searchName.trim().toLowerCase())
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      const message = "Nama poli wajib diisi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    if (trimmedName.length < 3) {
      const message = "Nama poli minimal 3 karakter";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    const payload = {
      name: trimmedName,
      description: description.trim() || undefined,
    };

    const url = editingId
      ? `/api/admin/specialties/${editingId}`
      : "/api/admin/specialties";
    const method = editingId ? "PATCH" : "POST";

    setLoading(true);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menyimpan data poli, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan data poli",
        description: message,
      });
      return;
    }

    resetForm();
    setFormModalOpen(false);

    const specialtiesResponse = await fetch("/api/admin/specialties");
    const specialtiesData =
      (await specialtiesResponse.json()) as Specialty[];
    setSpecialties(specialtiesData);

    toast({
      variant: "success",
      title: editingId ? "Poli diperbarui" : "Poli ditambahkan",
      description: editingId
        ? "Data poli berhasil diperbarui."
        : "Poli baru berhasil ditambahkan.",
    });
  }

  async function handleDelete(id: string) {
    setError("");
    const response = await fetch(`/api/admin/specialties/${id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat menghapus poli, silakan coba lagi";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal menghapus poli",
        description: message,
      });
      return;
    }

    const specialtiesResponse = await fetch("/api/admin/specialties");
    const specialtiesData =
      (await specialtiesResponse.json()) as Specialty[];
    setSpecialties(specialtiesData);

    toast({
      variant: "success",
      title: "Poli dihapus",
      description: "Data poli berhasil dihapus dari sistem.",
    });

    setDeleteModalOpen(false);
  }

  function handleEdit(specialty: Specialty) {
    setError("");
    setEditingId(specialty.id);
    setName(specialty.name);
    setDescription(specialty.description ?? "");
    setSelectedSpecialty(specialty);
    setFormModalOpen(true);
  }

  function handleCancelEdit() {
    resetForm();
    setFormModalOpen(false);
  }

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manajemen poli / spesialis
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tambah, ubah, dan kelola daftar poli dan spesialis dokter.
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
          Tambah poli
        </Button>
      </header>

      <section>
        <Card className="border-none bg-white/90 shadow-md shadow-emerald-500/10 ring-1 ring-zinc-100 dark:bg-zinc-950/90 dark:ring-zinc-800">
          <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Daftar poli / spesialis
              </span>
              <div className="flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:gap-3">
                <span className="font-medium">
                  {filteredSpecialties.length} dari {specialties.length} poli
                </span>
                <Input
                  placeholder="Cari nama poli..."
                  value={searchName}
                  onChange={(event) => setSearchName(event.target.value)}
                  className="h-8 max-w-xs text-xs"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {specialties.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Belum ada poli terdaftar.
              </p>
            )}
            {specialties.length > 0 && filteredSpecialties.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tidak ada poli yang cocok dengan filter saat ini.
              </p>
            )}
            {filteredSpecialties.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">Nama poli</th>
                      <th className="px-3 py-2">Deskripsi</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSpecialties.map((specialty) => (
                      <tr
                        key={specialty.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
                      >
                        <td className="px-3 py-2">{specialty.name}</td>
                        <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {specialty.description || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleEdit(specialty)}
                            >
                              Ubah
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => {
                                setSelectedSpecialty(specialty);
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
        title={editingId ? "Ubah data poli" : "Tambah poli baru"}
        description="Kelola nama dan deskripsi poli yang tersedia di rumah sakit."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Nama poli
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Poli Anak"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Contoh: Menangani keluhan kesehatan anak dan bayi."
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={handleCancelEdit}
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
                : "Tambah poli"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalOpen(false);
            setSelectedSpecialty(null);
          } else {
            setDeleteModalOpen(true);
          }
        }}
        title="Hapus poli"
        description="Poli yang dihapus tidak dapat dikembalikan."
      >
        <div className="space-y-4 text-sm">
          <p>
            Apakah Anda yakin ingin menghapus poli{" "}
            <span className="font-semibold">
              {selectedSpecialty?.name ?? ""}
            </span>
            ?
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Poli yang masih digunakan oleh dokter tidak dapat dihapus.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedSpecialty(null);
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={() => {
                if (selectedSpecialty) {
                  handleDelete(selectedSpecialty.id);
                }
              }}
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

