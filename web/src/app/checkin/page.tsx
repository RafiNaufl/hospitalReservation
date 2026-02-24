"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function CheckInPage() {
  const { toast } = useToast();
  const [bookingCode, setBookingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [queueNumber, setQueueNumber] = useState<number | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setQueueNumber(null);

    if (!bookingCode.trim()) {
      const message = "Silakan masukkan kode booking";
      setError(message);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: message,
      });
      return;
    }

    setLoading(true);
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingCode: bookingCode.trim(),
      }),
    });
    setLoading(false);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message ??
        "Terjadi kesalahan saat check-in, silakan coba lagi atau hubungi petugas";
      setError(message);
      toast({
        variant: "destructive",
        title: "Gagal check-in",
        description: message,
      });
      return;
    }

    setQueueNumber(data.queueNumber ?? null);
    const message = data.message ?? "Check-in berhasil";
    setSuccessMessage(message);
    toast({
      variant: "success",
      title: "Check-in berhasil",
      description: message,
    });
  }

  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Check-in pasien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Masukkan kode booking yang tertera pada QR code atau SMS/WhatsApp
              konfirmasi.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Kode booking
                </label>
                <Input
                  value={bookingCode}
                  onChange={(event) => setBookingCode(event.target.value)}
                  placeholder="Contoh: BK-ABC123"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              {successMessage && (
                <div className="space-y-2 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-50">
                  <p>{successMessage}</p>
                  {queueNumber !== null && (
                    <p className="text-base font-semibold">
                      Nomor antrian Anda: {queueNumber}
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Check-in sekarang"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
