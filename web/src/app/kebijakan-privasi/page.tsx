export default function KebijakanPrivasiPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-zinc-200 bg-white/90 p-6 text-sm text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100 md:p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kebijakan Privasi (Perlindungan Data Pribadi)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Berlaku untuk penggunaan sistem reservasi dokter RS Contoh Sehat.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Ruang lingkup dan dasar hukum
          </h2>
          <p>
            Kebijakan privasi ini mengatur pengumpulan, penggunaan, penyimpanan,
            dan perlindungan data pribadi pasien yang menggunakan sistem
            reservasi dokter RS Contoh Sehat. Pengelolaan data pribadi
            mengacu pada ketentuan peraturan perundang-undangan Indonesia yang
            berlaku, termasuk namun tidak terbatas pada Undang-Undang Nomor
            27 Tahun 2022 tentang Pelindungan Data Pribadi, Undang-Undang
            Kesehatan, serta regulasi kesehatan terkait rekam medis dan
            kerahasiaan data pasien.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Data pribadi yang dikumpulkan
          </h2>
          <p>Kami dapat mengumpulkan data pribadi berikut ketika Anda:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Data identitas: nama lengkap, NIK, tanggal lahir, jenis kelamin.</li>
            <li>Data kontak: nomor ponsel, email, alamat tempat tinggal.</li>
            <li>
              Data kepesertaan jaminan kesehatan: nomor kartu BPJS, nomor
              rujukan, dan informasi fasilitas kesehatan rujukan.
            </li>
            <li>
              Data kesehatan yang relevan untuk keperluan reservasi: riwayat
              kunjungan, poli yang dituju, dokter yang dipilih, dan jadwal
              kunjungan.
            </li>
            <li>
              Data teknis penggunaan sistem: alamat IP, jenis perangkat, jenis
              browser, waktu akses, dan log aktivitas pada sistem.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Tujuan penggunaan data pribadi
          </h2>
          <p>Data pribadi digunakan untuk tujuan:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Membuat akun pasien dan mengelola proses autentikasi saat login.
            </li>
            <li>
              Memproses permohonan reservasi dokter, termasuk pemilihan poli,
              dokter, dan jadwal kunjungan.
            </li>
            <li>
              Melakukan verifikasi kepesertaan BPJS dan/atau klaim jaminan
              kesehatan sesuai ketentuan yang berlaku.
            </li>
            <li>
              Mengirimkan pengingat jadwal (reminder) melalui SMS, WhatsApp,
              email, atau kanal komunikasi lain yang Anda setujui.
            </li>
            <li>
              Mendukung proses pelayanan kesehatan di rumah sakit, termasuk
              pencatatan pada sistem rekam medis internal.
            </li>
            <li>
              Melakukan pemantauan dan peningkatan kualitas layanan,
              termasuk analitik penggunaan sistem secara agregat dan anonim.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Dasar pemrosesan dan persetujuan
          </h2>
          <p>
            Dengan mendaftar akun dan menggunakan sistem reservasi ini, Anda
            menyatakan telah membaca, memahami, dan menyetujui pengolahan data
            pribadi sebagaimana diatur dalam kebijakan ini. Dalam keadaan
            tertentu, kami dapat meminta persetujuan eksplisit terpisah untuk
            pemrosesan data tertentu yang bersifat sensitif atau di luar tujuan
            pelayanan kesehatan langsung.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Penyimpanan dan jangka waktu retensi
          </h2>
          <p>
            Data pribadi akan disimpan selama diperlukan untuk memenuhi tujuan
            pelayanan kesehatan, pemenuhan kewajiban hukum, penyimpanan rekam
            medis sesuai peraturan, dan kepentingan pembuktian apabila
            terjadi sengketa. Setelah jangka waktu retensi berakhir dan data
            tidak lagi diperlukan, data akan dihapus atau dianonimkan sesuai
            prosedur internal rumah sakit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Perlindungan dan keamanan data
          </h2>
          <p>
            Kami menerapkan langkah-langkah teknis dan organisasi yang wajar
            untuk melindungi data pribadi dari akses tanpa hak, pengungkapan
            tidak sah, perubahan, atau perusakan, termasuk:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pembatasan akses data hanya kepada tenaga kesehatan dan petugas
              yang berwenang dan membutuhkan data tersebut.
            </li>
            <li>
              Penggunaan mekanisme autentikasi dan otorisasi pada sistem
              informasi rumah sakit.
            </li>
            <li>
              Pencatatan log akses dan aktivitas penting pada sistem.
            </li>
            <li>
              Penerapan prosedur internal terkait kerahasiaan rekam medis
              dan data pasien.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Berbagi data dengan pihak ketiga
          </h2>
          <p>
            Kami dapat membagikan sebagian data pribadi kepada pihak ketiga
            yang bekerja sama dengan rumah sakit, sepanjang diperlukan dan
            sesuai dengan ketentuan hukum, antara lain:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Badan penyelenggara jaminan kesehatan (misalnya BPJS Kesehatan)
              untuk keperluan verifikasi dan klaim.
            </li>
            <li>
              Penyedia layanan teknologi informasi yang mendukung operasional
              sistem, dengan perjanjian kerahasiaan yang memadai.
            </li>
            <li>
              Otoritas pemerintah atau penegak hukum berdasarkan permintaan
              resmi yang sah.
            </li>
          </ul>
          <p>
            Kami tidak menjual data pribadi pasien kepada pihak lain untuk
            kepentingan komersial.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            8. Hak subjek data
          </h2>
          <p>
            Subjek data (pasien) memiliki hak sesuai UU Pelindungan Data
            Pribadi, antara lain:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hak untuk memperoleh informasi mengenai pengolahan data.</li>
            <li>
              Hak untuk mengakses, memperbarui, dan memperbaiki data pribadi
              yang tidak akurat atau tidak lengkap.
            </li>
            <li>
              Hak untuk menarik persetujuan sepanjang tidak bertentangan
              dengan kewajiban hukum dan ketentuan rekam medis.
            </li>
            <li>
              Hak untuk mengajukan keberatan atas pemrosesan tertentu
              berdasarkan pertimbangan yang sah.
            </li>
          </ul>
          <p>
            Permohonan terkait hak subjek data dapat diajukan melalui kanal
            kontak yang tercantum di bagian akhir kebijakan ini.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            9. Cookies dan teknologi pelacakan
          </h2>
          <p>
            Sistem ini dapat menggunakan cookies atau teknologi serupa untuk
            meningkatkan pengalaman pengguna, seperti menyimpan preferensi
            tampilan dan menjaga sesi login. Anda dapat mengatur browser untuk
            menolak cookies, namun beberapa fitur sistem mungkin tidak
            berfungsi optimal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            10. Perubahan kebijakan
          </h2>
          <p>
            Kebijakan privasi ini dapat diperbarui sewaktu-waktu untuk
            menyesuaikan dengan perubahan regulasi, kebijakan internal, atau
            pengembangan layanan. Versi terbaru akan ditampilkan pada halaman
            ini dengan tanggal berlaku yang diperbarui.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            11. Kontak
          </h2>
          <p>
            Untuk pertanyaan, permintaan, atau pengaduan terkait perlindungan
            data pribadi, Anda dapat menghubungi:
          </p>
          <p className="text-sm">
            Unit Pengelola Data &amp; Rekam Medis RS Contoh Sehat
            <br />
            Jl. Kesehatan No. 10, Jakarta, Indonesia
            <br />
            Email: privacy@rscontohsehat.co.id
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Catatan: Isi kebijakan ini bersifat umum dan perlu disesuaikan
            kembali oleh tim hukum rumah sakit agar sepenuhnya selaras dengan
            regulasi dan praktik internal yang berlaku.
          </p>
        </section>
      </div>
    </main>
  );
}

