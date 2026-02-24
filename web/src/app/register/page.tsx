"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  nik: string;
  phone: string;
  dateOfBirth: string;
  gender: "L" | "P" | "";
  address: string;
  bpjsNumber: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    nik: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bpjsNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        gender: form.gender || "L",
        bpjsNumber: form.bpjsNumber || null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      const apiFieldErrors = data?.fieldErrors as
        | Record<string, string[] | undefined>
        | undefined;

      if (apiFieldErrors) {
        const nextFieldErrors: Partial<Record<keyof FormState, string>> = {};

        (
          [
            "fullName",
            "email",
            "password",
            "nik",
            "phone",
            "dateOfBirth",
            "gender",
            "address",
            "bpjsNumber",
          ] as (keyof FormState)[]
        ).forEach((field) => {
          const errors = apiFieldErrors[field];
          if (errors && errors.length > 0) {
            nextFieldErrors[field] = errors[0];
          }
        });

        setFieldErrors(nextFieldErrors);
      }

      setError(data?.message ?? "Terjadi kesalahan saat mendaftar");

      return;
    }

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Daftar Akun Pasien</CardTitle>
          <CardDescription>
            Isi data diri Anda sesuai KTP dan informasi kontak yang aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Nama lengkap
              </label>
              <Input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                required
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Kata sandi
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                required
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                NIK
              </label>
              <Input
                inputMode="numeric"
                value={form.nik}
                onChange={(event) => updateField("nik", event.target.value)}
                required
              />
              {fieldErrors.nik && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.nik}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Nomor HP
              </label>
              <Input
                inputMode="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                required
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Tanggal lahir
                </label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    updateField("dateOfBirth", event.target.value)
                  }
                  required
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Jenis kelamin
                </label>
                <select
                  className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  value={form.gender}
                  onChange={(event) =>
                    updateField("gender", event.target.value as "L" | "P")
                  }
                  required
                >
                  <option value="">Pilih</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Alamat
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                required
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.address}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                Nomor BPJS (opsional)
              </label>
              <Input
                inputMode="numeric"
                value={form.bpjsNumber}
                onChange={(event) =>
                  updateField("bpjsNumber", event.target.value)
                }
              />
              {fieldErrors.bpjsNumber && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.bpjsNumber}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Daftar"}
            </Button>
            <p className="pt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Sudah punya akun?{" "}
              <button
                type="button"
                className="font-medium text-emerald-600 hover:underline"
                onClick={() => router.push("/login")}
              >
                Masuk
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
