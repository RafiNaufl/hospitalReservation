"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface ProfileData {
  fullName: string;
  nik: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bpjsNumber: string;
  bpjsClass: string;
  isBpjs: boolean;
  photoUrl: string;
}

interface ProfileClientProps {
  initialData: ProfileData | null;
  userEmail: string;
}

export function ProfileClient({ initialData, userEmail }: ProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(
    initialData || {
      fullName: "",
      nik: "",
      phone: "",
      dateOfBirth: "",
      gender: "LAKI_LAKI",
      address: "",
      bpjsNumber: "",
      bpjsClass: "KELAS_3",
      isBpjs: false,
      photoUrl: "",
    }
  );
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Ukuran file terlalu besar",
        description: "Maksimal ukuran file adalah 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Gagal mengunggah foto");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, photoUrl: data.photoUrl }));
      toast({
        title: "Berhasil!",
        description: "Foto profil telah diperbarui.",
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengunggah foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui profil");
      }

      toast({
        title: "Berhasil!",
        description: "Profil Anda telah diperbarui.",
      });
      
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan profil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 animate-in fade-in duration-500">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Edit Profil Lengkap</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Lengkapi data diri Anda untuk mempermudah proses reservasi rumah sakit.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-none bg-white shadow-sm dark:bg-zinc-900 overflow-hidden">
            <div className="h-24 bg-emerald-600 sm:h-32" />
            <CardContent className="relative -mt-12 sm:-mt-16 flex flex-col items-center pb-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg dark:border-zinc-900">
                  <AvatarImage src={formData.photoUrl} alt={formData.fullName} className="object-cover" />
                  <AvatarFallback className="bg-emerald-50 text-2xl font-bold text-emerald-600 dark:bg-emerald-950/30">
                    {formData.fullName?.[0] || userEmail[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="photo-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-8 w-8" />
                </label>
                <input 
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold">{formData.fullName || "Lengkapi Nama"}</h2>
                <p className="text-sm text-zinc-500">{userEmail}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
            <CardHeader className="border-b border-zinc-50 pb-6 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>Data identitas sesuai dengan KTP Anda.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Hanya Baca)</label>
                  <div className="relative">
                    <Input 
                      value={userEmail}
                      disabled
                      className="bg-zinc-50/50 pr-10"
                    />
                    <Mail className="absolute right-3 top-2.5 h-5 w-5 text-zinc-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    NIK (16 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="3201..."
                    maxLength={16}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Nomor Telepon <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0812..."
                      required
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Lahir</label>
                  <div className="relative">
                    <Input 
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Kelamin</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Alamat Lengkap
                </label>
                <div className="relative">
                  <Input 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Jl. Raya No. 123..."
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm dark:bg-zinc-900">
            <CardHeader className="border-b border-zinc-50 pb-6 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/30">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Data Asuransi / BPJS</CardTitle>
                  <CardDescription>Opsional. Isi jika Anda ingin menggunakan layanan BPJS.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox"
                  name="isBpjs"
                  id="isBpjs"
                  checked={formData.isBpjs}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isBpjs" className="text-sm font-medium cursor-pointer">
                  Saya memiliki BPJS Kesehatan
                </label>
              </div>

              {formData.isBpjs && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Kartu BPJS</label>
                    <Input 
                      name="bpjsNumber"
                      value={formData.bpjsNumber}
                      onChange={handleChange}
                      placeholder="0001..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kelas BPJS</label>
                    <select 
                      name="bpjsClass"
                      value={formData.bpjsClass}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      <option value="KELAS_1">Kelas 1</option>
                      <option value="KELAS_2">Kelas 2</option>
                      <option value="KELAS_3">Kelas 3</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto rounded-xl">Batal</Button>
            </Link>
            <Button 
              type="submit" 
              className="w-full sm:w-auto rounded-xl px-12"
              disabled={loading}
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
