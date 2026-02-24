"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/doctor/DashboardHeader"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Save, X, Lock, User, MapPin, Briefcase, Phone, Mail, ShieldCheck } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface DoctorProfile {
  id: string
  fullName: string
  photoUrl: string | null
  sipNumber: string | null
  experienceYears: number | null
  location: string | null
  email: string
  phone: string | null
  specialtyName: string
}

export function ProfileClient() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setLoadingSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    experienceYears: "",
    location: "",
    photoUrl: "",
  })

  // Password states
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/doctor/profile")
      if (res.ok) {
        const data = await res.json() as DoctorProfile
        setProfile(data)
        setFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          experienceYears: data.experienceYears?.toString() || "0",
          location: data.location || "",
          photoUrl: data.photoUrl || "",
        })
        if (data.photoUrl) setPhotoPreview(data.photoUrl)
      }
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat profil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast({
        title: "Format Tidak Sesuai",
        description: "Hanya file JPEG dan PNG yang diperbolehkan.",
        variant: "destructive",
      })
      return
    }

    // Validasi ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran maksimal foto adalah 2MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPhotoPreview(base64)
      setFormData(prev => ({ ...prev, photoUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm("Simpan perubahan profil?")) return

    setLoadingSaving(true)
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({ title: "Sukses", description: "Profil berhasil diperbarui" })
        fetchProfile()
      } else {
        const data = await res.json() as { error: string }
        throw new Error(data.error)
      }
    } catch (err: unknown) {
      const error = err as Error
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      })
    } finally {
      setLoadingSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Gagal", description: "Konfirmasi password baru tidak cocok", variant: "destructive" })
      return
    }

    setLoadingSaving(true)
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (res.ok) {
        toast({ title: "Sukses", description: "Password berhasil diubah" })
        setShowPasswordModal(false)
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const data = await res.json() as { error: string }
        throw new Error(data.error)
      }
    } catch (err: unknown) {
      const error = err as Error
      toast({ title: "Gagal", description: error.message, variant: "destructive" })
    } finally {
      setLoadingSaving(false)
    }
  }

  if (loading && !profile) return <div className="p-20 text-center font-black uppercase italic text-zinc-400">Memuat profil...</div>

  return (
    <div className="flex-1">
      <DashboardHeader
        doctorName={profile?.fullName || "Dokter"}
        photoUrl={profile?.photoUrl}
        specialtyName={profile?.specialtyName || "Spesialis"}
        onSearch={() => {}}
        notificationsCount={0}
      />

      <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/50 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Pengaturan Profil</h2>
            <p className="text-sm text-zinc-500 font-bold">Kelola informasi publik dan keamanan akun Anda.</p>
          </div>
          <Button 
            onClick={() => setShowPasswordModal(true)}
            className="bg-zinc-900 hover:bg-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl px-6 relative z-10"
          >
            <Lock className="w-4 h-4 mr-2" />
            Ganti Password
          </Button>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden h-fit">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-40 w-40 border-4 border-emerald-50 shadow-2xl ring-4 ring-emerald-500/10 transition-transform group-hover:scale-105 duration-500">
                  <AvatarImage src={photoPreview || undefined} className="object-cover" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-4xl">
                    {profile?.fullName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white w-8 h-8" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg"
                  onChange={handlePhotoChange}
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{profile?.fullName}</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">{profile?.specialtyName}</p>
                <Badge variant="outline" className="mt-4 border-zinc-100 bg-zinc-50 text-[10px] font-black uppercase tracking-widest px-4 py-1">
                  SIP: {profile?.sipNumber || "Belum diatur"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-50 bg-zinc-50/30">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-100">
                  <User className="w-4 h-4 text-white" />
                </div>
                Informasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-emerald-500 transition-all outline-none font-bold text-sm"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-emerald-500 transition-all outline-none font-bold text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pengalaman (Tahun)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-emerald-500 transition-all outline-none font-bold text-sm"
                      value={formData.experienceYears}
                      onChange={e => setFormData({...formData, experienceYears: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Lokasi Praktik</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-emerald-500 transition-all outline-none font-bold text-sm"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold">{profile?.email}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fetchProfile()}
                    className="rounded-xl font-black text-xs uppercase tracking-widest px-8 border-2"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-10 shadow-lg shadow-emerald-100"
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    {!saving && <Save className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-50 bg-zinc-50/30 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                Ganti Password
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password Lama</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold text-sm"
                    value={passwordData.oldPassword}
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold text-sm"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-50 bg-zinc-50/50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold text-sm"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl h-14 shadow-xl"
                  >
                    {saving ? "Memproses..." : "Perbarui Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
