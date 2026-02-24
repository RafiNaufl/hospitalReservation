import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProviderWithHook } from "@/components/ui/use-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import HeaderClient from "./header-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reservasi Dokter RS Online",
  description:
    "Sistem reservasi dokter rumah sakit untuk pasien umum dan BPJS di Indonesia.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string; role?: string } | undefined;
  const role = user?.role ?? null;
  const isLoggedIn = Boolean(user);
  const email = user?.email ?? null;

  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ToastProviderWithHook>
          <div className="flex min-h-screen flex-col bg-background">
            <HeaderClient isLoggedIn={isLoggedIn} role={role} email={email} />
            <main className="flex-1">{children}</main>
            {role !== "ADMIN" && (
              <footer
                id="kontak"
                className="border-t border-zinc-200 bg-zinc-50/80 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400"
              >
                <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      RS Contoh Sehat
                    </p>
                    <p>
                      Jl. Kesehatan No. 10, Jakarta, Indonesia
                      <br />
                      Buka 24 jam, IGD selalu siap membantu.
                    </p>
                    <p className="text-sm">
                      Telp: (021) 1234 5678 · WhatsApp: 0812-3456-7890
                      <br />
                      Email: info@rscontohsehat.co.id
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Informasi
                    </p>
                    <Link
                      href="/kebijakan-privasi"
                      className="text-zinc-600 underline-offset-4 hover:text-emerald-600 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
                    >
                      Kebijakan Privasi (PDP)
                    </Link>
                    <Link
                      href="/syarat-ketentuan"
                      className="text-zinc-600 underline-offset-4 hover:text-emerald-600 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
                    >
                      Syarat &amp; Ketentuan
                    </Link>
                    <p className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
                      © {new Date().getFullYear()} RS Contoh Sehat. Semua hak
                      dilindungi.
                    </p>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </ToastProviderWithHook>
      </body>
    </html>
  );
}
