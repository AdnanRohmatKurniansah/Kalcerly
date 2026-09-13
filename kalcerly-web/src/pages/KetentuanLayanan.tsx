import { LegalLayout } from "@/components/layout/LegalLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FileText } from "lucide-react";
import React from "react";

export function KetentuanLayanan() {
  usePageTitle("Ketentuan Layanan");

  return (
    <LegalLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-k text-volt text-label-md mb-4">
          <FileText size={13} aria-hidden="true" />
          Legal
        </div>
        <h1 className="text-headline-md text-t1 mb-3">Ketentuan Layanan</h1>
        <p className="text-body-lg text-t2 max-w-2xl">
          Dengan menggunakan Kalcerly, kamu menyetujui ketentuan berikut. Harap baca dengan seksama sebelum menggunakan layanan kami.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <Section
          title="1. Penerimaan Ketentuan">
          <p>
            Dengan mengakses atau menggunakan aplikasi, situs web, atau layanan Kalcerly ("Layanan"), kamu menyatakan bahwa kamu telah membaca, memahami, dan menyetujui Ketentuan Layanan ini. Jika kamu tidak menyetujui ketentuan ini, mohon hentikan penggunaan Layanan.
          </p>
          <p>
            Ketentuan ini berlaku untuk semua pengguna, termasuk pengunjung, pengguna terdaftar, dan kontributor konten. Kami berhak memperbarui ketentuan ini sewaktu-waktu dengan pemberitahuan yang wajar.
          </p>
        </Section>

        <Section
          title="2. Akun Pengguna">
          <p>
            Untuk menggunakan fitur tertentu dari Layanan, kamu perlu membuat akun. Kamu bertanggung jawab menjaga kerahasiaan kredensial akun dan seluruh aktivitas yang terjadi di bawah akunmu.
          </p>
          <ul>
            <li>Kamu harus berusia minimal 13 tahun untuk membuat akun.</li>
            <li>Informasi yang kamu berikan harus akurat dan terkini.</li>
            <li>Satu orang hanya diizinkan memiliki satu akun aktif.</li>
            <li>Kalcerly berhak menangguhkan atau menghapus akun yang melanggar ketentuan.</li>
          </ul>
        </Section>

        <Section
          title="3. Penggunaan yang Diizinkan">
          <p>Kamu boleh menggunakan Layanan untuk:</p>
          <ul>
            <li>Melacak aktivitas fisik dan olahraga pribadi.</li>
            <li>Berinteraksi dengan komunitas fitness secara positif.</li>
            <li>Mengakses fitur verifikasi AI untuk aktivitas yang valid.</li>
            <li>Mendapatkan reward berdasarkan pencapaian nyata.</li>
          </ul>
        </Section>

        <Section
          title="4. Penggunaan yang Dilarang">
          <p>Kamu dilarang untuk:</p>
          <ul>
            <li>Memanipulasi data aktivitas atau menggunakan alat curang.</li>
            <li>Melakukan spam, phishing, atau tindakan berbahaya lainnya.</li>
            <li>Mencoba meretas, memodifikasi, atau mendistribusikan reverse-engineered konten Layanan.</li>
            <li>Mengunggah konten yang melanggar hak cipta, bersifat ofensif, atau ilegal.</li>
            <li>Membuat beberapa akun untuk mendapatkan reward secara tidak sah.</li>
          </ul>
        </Section>

        <Section
          title="5. Fitur Web3 & Token">
          <p>
            Fitur Web3 pada Kalcerly, termasuk FIT Token dan reward berbasis blockchain, bersifat eksperimental dan opsional. Kamu tidak diwajibkan menghubungkan wallet untuk menggunakan fitur inti Layanan.
          </p>
          <p>
            Kalcerly tidak bertanggung jawab atas fluktuasi nilai token, kehilangan akses wallet, atau kejadian yang timbul dari penggunaan fitur Web3. Gunakan dengan bijak dan pahami risikonya.
          </p>
        </Section>

        <Section
          title="6. Kekayaan Intelektual">
          <p>
            Seluruh konten, logo, merek dagang, desain antarmuka, dan kode Layanan adalah milik Kalcerly dan dilindungi hukum kekayaan intelektual yang berlaku. Kamu tidak diizinkan menyalin, mendistribusikan, atau membuat karya turunan tanpa izin tertulis.
          </p>
          <p>
            Dengan mengunggah konten ke Layanan, kamu memberikan Kalcerly lisensi non-eksklusif, bebas royalti, untuk menggunakan konten tersebut dalam operasional Layanan.
          </p>
        </Section>

        <Section
          title="7. Batasan Tanggung Jawab">
          <p>
            Layanan disediakan "sebagaimana adanya" tanpa garansi apapun. Kalcerly tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Layanan.
          </p>
          <p>
            Kamu menggunakan Layanan atas risiko sendiri. Selalu konsultasikan dengan profesional kesehatan sebelum memulai program olahraga baru.
          </p>
        </Section>

        <Section
          title="8. Perubahan Ketentuan">
          <p>
            Kami berhak mengubah Ketentuan Layanan ini kapan saja. Perubahan material akan diberitahukan melalui email atau notifikasi dalam aplikasi setidaknya 14 hari sebelum berlaku. Penggunaan Layanan setelah tanggal berlaku perubahan dianggap sebagai persetujuan kamu atas ketentuan baru.
          </p>
        </Section>

        <ContactBox />
      </div>
    </LegalLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 rounded-2xl border border-k bg-card flex flex-col gap-4">
      <h2 className="text-headline-sm text-t1">{title}</h2>

      <div
        className="
          flex flex-col gap-3
          text-body-md text-t2 leading-7
          [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2
          [&_ul]:pl-0 [&_ul]:list-none
          [&_li]:flex [&_li]:gap-2 [&_li]:items-start
          [&_li]:before:content-['—']
          [&_li]:before:text-volt
          [&_li]:before:shrink-0
          [&_li]:before:mt-0.5
        ">
        {children}
      </div>
    </section>
  );
}

function ContactBox() {
  return (
    <div
      className="p-6 rounded-2xl border flex flex-col gap-3"
      style={{
        borderColor: "rgba(163,230,53,0.25)",
        background: "rgba(163,230,53,0.05)",
      }}>
      <h2 className="text-headline-sm text-t1">Hubungi Kami</h2>
      <p className="text-body-md text-t2">
        Jika ada pertanyaan mengenai Ketentuan Layanan ini, hubungi kami di:
      </p>
      <a href="mailto:legal@kalcerly.com" className="text-volt text-label-lg hover:underline w-fit">
        legal@kalcerly.com
      </a>
    </div>
  );
}
