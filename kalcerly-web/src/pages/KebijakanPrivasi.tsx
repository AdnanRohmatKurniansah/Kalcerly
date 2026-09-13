import { LegalLayout } from "@/components/layout/LegalLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import React from "react";
import {
  Shield,
  Eye,
  Lock,
  Trash2,
} from "lucide-react";

export function KebijakanPrivasi() {
  usePageTitle("Kebijakan Privasi");

  return (
    <LegalLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-k text-cyan text-label-md mb-4">
          <Shield size={13} aria-hidden="true" />
          Privasi
        </div>
        <h1 className="text-headline-md text-t1 mb-3">Kebijakan Privasi</h1>
        <p className="text-body-lg text-t2 max-w-2xl">
          Privasi kamu adalah prioritas kami. Halaman ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak-hak kamu sebagai pengguna.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <HighlightCard
          icon={<Lock size={16} />}
          iconColor="var(--k-volt)"
          title="Data Terenkripsi"
          desc="Semua data sensitif dienkripsi end-to-end."
        />
        <HighlightCard
          icon={<Eye size={16} />}
          iconColor="var(--k-cyan)"
          title="Transparan"
          desc="Kami jelas tentang data apa yang kami kumpulkan."
        />
        <HighlightCard
          icon={<Trash2 size={16} />}
          iconColor="var(--k-amber)"
          title="Hak Hapus"
          desc="Kamu bisa hapus akunmu kapan saja."
        />
      </div>

      <div className="flex flex-col gap-10">
        <Section
          title="1. Data yang Kami Kumpulkan"
        >
          <p>Kami mengumpulkan data berikut untuk menjalankan Layanan:</p>
          <p className="font-semibold text-t1">Data yang kamu berikan langsung:</p>
          <ul>
            <li>Nama, alamat email, dan kata sandi akun.</li>
            <li>Foto profil dan informasi biografi opsional.</li>
            <li>Preferensi aktivitas dan target kebugaran.</li>
          </ul>
          <p className="font-semibold text-t1">Data yang dikumpulkan otomatis:</p>
          <ul>
            <li>Data GPS dan rute aktivitas saat fitur tracking aktif.</li>
            <li>Metrik aktivitas: jarak, durasi, pace, kalori.</li>
            <li>Data telemetri kinematika untuk verifikasi AI.</li>
            <li>Log penggunaan aplikasi dan data teknis perangkat.</li>
          </ul>
        </Section>

        <Section
          title="2. Bagaimana Kami Menggunakan Data"
        >
          <p>Data yang kami kumpulkan digunakan untuk:</p>
          <ul>
            <li>Menyediakan dan meningkatkan fitur Layanan.</li>
            <li>Memverifikasi keabsahan aktivitas melalui AI.</li>
            <li>Menampilkan statistik dan progres pribadi kamu.</li>
            <li>Menghitung dan mendistribusikan reward.</li>
            <li>Mengirimkan notifikasi yang relevan (bisa dinonaktifkan).</li>
            <li>Mendeteksi dan mencegah penipuan atau penyalahgunaan.</li>
          </ul>
        </Section>

        <Section
          title="3. Berbagi Data dengan Pihak Ketiga"
        >
          <p>
            Kami <strong className="text-t1">tidak menjual</strong> data pribadimu kepada pihak ketiga. Data dapat dibagikan hanya dalam kondisi berikut:
          </p>
          <ul>
            <li>Penyedia layanan infrastruktur yang terikat perjanjian kerahasiaan.</li>
            <li>Saat diwajibkan oleh hukum atau perintah pengadilan.</li>
            <li>Dalam proses merger atau akuisisi (dengan pemberitahuan kepada pengguna).</li>
            <li>Data agregat yang tidak dapat mengidentifikasi individu untuk keperluan riset.</li>
          </ul>
        </Section>

        <Section
          title="4. Keamanan Data"
        >
          <p>
            Kami menerapkan langkah-langkah keamanan industri untuk melindungi datamu, termasuk enkripsi TLS untuk transmisi data, enkripsi data sensitif di penyimpanan, dan autentikasi dua faktor yang tersedia.
          </p>
          <p>
            Meskipun kami berusaha maksimal, tidak ada sistem yang 100% aman. Segera laporkan aktivitas mencurigakan ke tim keamanan kami.
          </p>
        </Section>

        <Section
          title="5. Hak-Hak Kamu"
        >
          <p>Kamu memiliki hak untuk:</p>
          <ul>
            <li><strong className="text-t1">Akses:</strong> Meminta salinan data pribadi yang kami simpan.</li>
            <li><strong className="text-t1">Koreksi:</strong> Memperbarui data yang tidak akurat.</li>
            <li><strong className="text-t1">Penghapusan:</strong> Menghapus akun dan seluruh datamu permanen.</li>
            <li><strong className="text-t1">Portabilitas:</strong> Mengekspor datamu dalam format yang bisa dibaca mesin.</li>
            <li><strong className="text-t1">Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu.</li>
          </ul>
          <p>
            Untuk menggunakan hak-hak ini, hubungi kami di <a href="mailto:privacy@kalcerly.com" className="text-volt hover:underline">privacy@kalcerly.com</a>.
          </p>
        </Section>

        <Section
          title="6. Cookie & Teknologi Pelacakan"
        >
          <p>
            Kami menggunakan cookie esensial untuk operasional Layanan. Kami tidak menggunakan cookie iklan pihak ketiga. Kamu dapat mengatur preferensi cookie melalui pengaturan browser atau aplikasi.
          </p>
        </Section>

        <Section
          title="7. Perubahan Kebijakan"
        >
          <p>
            Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi setidaknya 14 hari sebelum berlaku.
          </p>
        </Section>

        <ContactBox color="var(--k-cyan)" email="privacy@kalcerly.com" />
      </div>
    </LegalLayout>
  );
}

function HighlightCard({
  icon,
  iconColor,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-2xl border border-k bg-card flex flex-col gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${iconColor} 15%, transparent)`, color: iconColor }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-title-lg text-t1">{title}</p>
      <p className="text-body-sm text-t2 leading-5">{desc}</p>
    </div>
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

function ContactBox({ color, email }: { color: string; email: string }) {
  return (
    <div
      className="p-6 rounded-2xl border flex flex-col gap-3"
      style={{
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
        background: `color-mix(in srgb, ${color} 5%, transparent)`,
      }}
    >
      <h2 className="text-headline-sm text-t1">Hubungi Tim Privasi</h2>
      <p className="text-body-md text-t2">
        Pertanyaan seputar privasi dan pengelolaan data dapat dikirimkan ke:
      </p>
      <a href={`mailto:${email}`} className="text-volt text-label-lg hover:underline w-fit">
        {email}
      </a>
    </div>
  );
}
