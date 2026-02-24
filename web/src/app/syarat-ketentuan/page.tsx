export default function SyaratKetentuanPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-zinc-200 bg-white/90 p-6 text-sm text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100 md:p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Syarat dan Ketentuan Penggunaan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Berlaku untuk penggunaan sistem reservasi dokter RS Contoh Sehat.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            1. Definisi
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Rumah Sakit</span> adalah RS Contoh
              Sehat beserta seluruh unit pelayanannya.
            </li>
            <li>
              <span className="font-medium">Sistem</span> adalah aplikasi
              reservasi dokter berbasis web yang digunakan untuk pendaftaran dan
              pengelolaan jadwal kunjungan pasien.
            </li>
            <li>
              <span className="font-medium">Pengguna</span> adalah pasien atau
              perwakilan pasien yang menggunakan sistem ini, baik sebagai pasien
              umum maupun peserta jaminan kesehatan (misalnya BPJS).
            </li>
            <li>
              <span className="font-medium">Reservasi</span> adalah pemesanan
              jadwal kunjungan ke poli atau dokter tertentu melalui sistem.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            2. Ruang lingkup layanan
          </h2>
          <p>
            Sistem ini disediakan untuk mempermudah proses pendaftaran dan
            pengaturan jadwal kunjungan pasien ke dokter di RS Contoh Sehat.
            Sistem tidak menggantikan konsultasi medis tatap muka dan tidak
            digunakan sebagai layanan telemedicine, kecuali dinyatakan secara
            tegas oleh rumah sakit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            3. Pendaftaran akun dan keamanan
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pengguna wajib memberikan data yang benar, akurat, dan mutakhir
              saat melakukan pendaftaran akun.
            </li>
            <li>
              Pengguna bertanggung jawab penuh atas kerahasiaan kredensial
              login (email dan kata sandi) dan seluruh aktivitas yang
              dilakukan dengan akun tersebut.
            </li>
            <li>
              Pengguna wajib segera menginformasikan kepada rumah sakit apabila
              mengetahui adanya penggunaan akun tanpa izin.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            4. Penggunaan sistem
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Sistem hanya boleh digunakan untuk keperluan pendaftaran dan
              pengelolaan jadwal kunjungan yang sah dan sesuai dengan ketentuan
              rumah sakit.
            </li>
            <li>
              Pengguna dilarang melakukan tindakan yang dapat mengganggu,
              merusak, atau mengakses sistem secara tidak sah.
            </li>
            <li>
              Rumah sakit berhak membatasi, menangguhkan, atau menghentikan
              akses pengguna apabila terdapat dugaan penyalahgunaan sistem.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            5. Jadwal, keterlambatan, dan no-show
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Jadwal yang tercantum di sistem merupakan rencana praktik dan
              dapat berubah sewaktu-waktu karena alasan operasional atau
              kondisi dokter.
            </li>
            <li>
              Pengguna disarankan hadir lebih awal dari jam yang tertera untuk
              proses verifikasi data dan administrasi di loket.
            </li>
            <li>
              Apabila pasien tidak hadir pada jadwal yang telah dipesan
              (no-show), rumah sakit berhak mengatur ulang antrean dan dapat
              menerapkan kebijakan internal terkait prioritas pelayanan.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            6. Pembatalan dan perubahan reservasi
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pengguna dapat melakukan pembatalan atau penjadwalan ulang
              reservasi sesuai fitur yang tersedia pada sistem atau melalui
              kanal resmi rumah sakit.
            </li>
            <li>
              Rumah sakit berhak membatalkan atau mengubah jadwal reservasi
              apabila terjadi keadaan darurat, perubahan jadwal dokter, atau
              alasan operasional lain, dengan upaya pemberitahuan kepada
              pengguna.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            7. Penggunaan BPJS dan jaminan kesehatan
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pengguna yang menggunakan BPJS atau jaminan kesehatan lain wajib
              memastikan kepesertaan masih aktif dan memenuhi ketentuan rujukan
              sesuai regulasi yang berlaku.
            </li>
            <li>
              Data nomor kartu BPJS dan rujukan yang diinput melalui sistem
              dapat diverifikasi kepada badan penyelenggara jaminan kesehatan.
            </li>
            <li>
              Kegagalan klaim yang disebabkan oleh ketidaksesuaian data,
              kepesertaan tidak aktif, atau ketidakpatuhan terhadap prosedur
              rujukan menjadi tanggung jawab peserta sesuai regulasi yang
              berlaku.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            8. Tanggung jawab dan pembatasan
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Rumah sakit berupaya menjaga ketersediaan dan keandalan sistem,
              namun tidak menjamin sistem bebas dari gangguan teknis, keterlambatan, atau
              kesalahan tampilan jadwal.
            </li>
            <li>
              Dalam batas yang diizinkan oleh hukum, rumah sakit tidak
              bertanggung jawab atas kerugian tidak langsung, kehilangan
              keuntungan, atau kerugian lain yang timbul akibat penggunaan atau
              ketidakmampuan menggunakan sistem.
            </li>
            <li>
              Informasi jadwal pada sistem bersifat informatif dan tidak
              menggantikan penjelasan resmi petugas rumah sakit di lokasi
              pelayanan.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            9. Perlindungan data pribadi
          </h2>
          <p>
            Penggunaan sistem ini tunduk pada Kebijakan Privasi RS Contoh Sehat
            yang mengatur cara pengumpulan, penggunaan, dan perlindungan data
            pribadi pasien sesuai dengan peraturan perundang-undangan di
            Indonesia. Pengguna diharapkan membaca dan memahami kebijakan
            tersebut sebelum menggunakan sistem.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            10. Perubahan syarat dan ketentuan
          </h2>
          <p>
            Rumah sakit dapat sewaktu-waktu mengubah syarat dan ketentuan ini
            untuk menyesuaikan dengan perkembangan layanan, kebijakan internal,
            atau perubahan regulasi. Versi terbaru akan diumumkan melalui
            halaman ini dan mulai berlaku sejak tanggal yang ditetapkan.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            11. Hukum yang berlaku dan penyelesaian sengketa
          </h2>
          <p>
            Syarat dan ketentuan ini diatur dan ditafsirkan berdasarkan hukum
            Republik Indonesia. Setiap perselisihan yang timbul sehubungan
            dengan penggunaan sistem akan diupayakan penyelesaiannya terlebih
            dahulu melalui musyawarah. Apabila tidak tercapai kesepakatan,
            sengketa dapat diselesaikan melalui mekanisme yang diatur dalam
            peraturan perundang-undangan yang berlaku.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            12. Kontak
          </h2>
          <p>
            Untuk pertanyaan terkait syarat dan ketentuan ini, Anda dapat
            menghubungi:
          </p>
          <p className="text-sm">
            Humas dan Layanan Informasi RS Contoh Sehat
            <br />
            Jl. Kesehatan No. 10, Jakarta, Indonesia
            <br />
            Email: info@rscontohsehat.co.id
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Catatan: Isi syarat dan ketentuan ini bersifat umum dan perlu
            disesuaikan kembali oleh tim hukum rumah sakit agar sepenuhnya
            selaras dengan kebijakan dan regulasi yang berlaku.
          </p>
        </section>
      </div>
    </main>
  );
}

