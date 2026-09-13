import { LegalLayout } from "@/components/layout/LegalLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import React from "react";
import {
  Users,
} from "lucide-react";

export function PedomanKomunitas() {
  usePageTitle("Pedoman Komunitas");

  return (
    <LegalLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-k text-amber text-label-md mb-4">
          <Users size={13} aria-hidden="true" />
          Komunitas
        </div>
        <h1 className="text-headline-md text-t1 mb-3">Pedoman Komunitas</h1>
        <p className="text-body-lg text-t2 max-w-2xl">
          Kalcerly dibangun di atas semangat kolektif para pegiat kebugaran. Pedoman ini menjaga komunitas kita tetap positif, inklusif, dan saling mendukung.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <Section
          title="1. Bersikap Positif & Suportif">
          <p>
            Kalcerly adalah ruang untuk saling mendukung perjalanan fitness masing-masing. Setiap orang ada di tahapan yang berbeda, dan semua itu valid.
          </p>
          <ul>
            <li>Berikan semangat dan apresiasi tulus kepada sesama anggota.</li>
            <li>Hindari komentar yang meremehkan atau membandingkan secara negatif.</li>
            <li>Rayakan pencapaian orang lain sebesar kamu merayakan milikmu.</li>
            <li>Berikan feedback yang konstruktif jika diminta, bukan kritik yang menyerang.</li>
          </ul>
        </Section>

        <Section
          title="2. Komunikasi yang Sehat">
          <p>
            Interaksi di komunitas Kalcerly — komentar, postingan, DM, maupun obrolan klub — harus mencerminkan rasa hormat.
          </p>
          <ul>
            <li>Gunakan bahasa yang sopan dan ramah.</li>
            <li>Tidak ada tempat untuk ujaran kebencian, diskriminasi, atau pelecehan dalam bentuk apapun.</li>
            <li>Tidak boleh membagikan kontak pribadi orang lain tanpa izin.</li>
            <li>Debat olahraga boleh, tapi tetap berargumen dengan fakta, bukan emosi.</li>
          </ul>
        </Section>

        <Section
          title="3. Integritas & Kejujuran">
          <p>
            Kepercayaan adalah fondasi komunitas kita. Sistem verifikasi AI Kalcerly hadir untuk menjaga kejujuran bersama.
          </p>
          <ul>
            <li>Jangan memanipulasi data GPS atau metrik aktivitas.</li>
            <li>Jangan menggunakan alat bantu otomatis atau bot untuk generate aktivitas palsu.</li>
            <li>Jangan menciptakan akun palsu untuk meningkatkan ranking atau reward.</li>
            <li>Laporkan aktivitas mencurigakan yang kamu temukan kepada tim moderasi.</li>
          </ul>
        </Section>

        <Section
          title="4. Konten yang Boleh Dibagikan">
          <p>Kalcerly mendorong kamu untuk berbagi perjalanan fitnesmu. Konten yang sesuai meliputi:</p>
          <ul>
            <li>Dokumentasi aktivitas: rute, foto finish line, catatan latihan.</li>
            <li>Tips dan motivasi seputar kesehatan & kebugaran.</li>
            <li>Pertanyaan, diskusi, dan cerita perjalanan fitness.</li>
            <li>Review peralatan olahraga yang objektif.</li>
          </ul>
          <p>Konten yang <strong className="text-t1">tidak diizinkan</strong>:</p>
          <ul>
            <li>Promosi produk atau layanan komersial tanpa izin resmi.</li>
            <li>Konten yang bersifat seksual, kekerasan, atau menyinggung.</li>
            <li>Informasi medis yang menyesatkan atau klaim kesehatan yang tidak terverifikasi.</li>
            <li>Konten yang melanggar hak cipta.</li>
          </ul>
        </Section>

        <Section
          title="5. Pelaporan & Moderasi"
        >
          <p>
            Jika kamu melihat konten atau perilaku yang melanggar pedoman ini, gunakan fitur laporkan yang tersedia di setiap postingan dan profil. Tim moderasi kami akan menindaklanjuti dalam waktu 48 jam.
          </p>
          <p>Konsekuensi pelanggaran, tergantung tingkat keparahan:</p>
          <ul>
            <li><strong className="text-t1">Peringatan:</strong> Notifikasi dari tim moderasi untuk pelanggaran ringan pertama.</li>
            <li><strong className="text-t1">Pembatasan:</strong> Fitur tertentu dibatasi sementara.</li>
            <li><strong className="text-t1">Suspensi:</strong> Akun dinonaktifkan sementara.</li>
            <li><strong className="text-t1">Penghapusan permanen:</strong> Untuk pelanggaran serius atau berulang.</li>
          </ul>
        </Section>

        <Section
          title="6. Penghargaan Komunitas"
        >
          <p>
            Anggota yang secara konsisten berkontribusi positif dapat mendapatkan badge komunitas khusus dan diakui sebagai Community Champion. Penghargaan diberikan berdasarkan:
          </p>
          <ul>
            <li>Konsistensi aktivitas yang terverifikasi.</li>
            <li>Kontribusi positif dalam forum dan komentar.</li>
            <li>Partisipasi aktif dalam challenge dan event komunitas.</li>
            <li>Nominasi sesama anggota komunitas.</li>
          </ul>
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
      }}
    >
      <h2 className="text-headline-sm text-t1">Ada Pertanyaan?</h2>
      <p className="text-body-md text-t2">
        Hubungi tim komunitas kami untuk pelaporan atau pertanyaan terkait pedoman:
      </p>
      <a
        href="mailto:community@kalcerly.com"
        className="text-volt text-label-lg hover:underline w-fit"
      >
        community@kalcerly.com
      </a>
    </div>
  );
}
