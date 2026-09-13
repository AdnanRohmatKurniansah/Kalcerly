import { Footprints, PersonStanding, Flame, Bike } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

const BADGES: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  statusVariant: VariantProps<typeof badgeVariants>["variant"];
  status: string;
  title: string;
  body: string;
  locked: boolean;
}[] = [
  { icon: <Footprints size={30} aria-hidden="true" />, iconBg: "rgba(163,230,53,0.15)", iconColor: "var(--k-volt)", statusVariant: "verified", status: "UNLOCKED", title: "First Run", body: "Menyelesaikan aktivitas lari pertama dan terverifikasi di Kalcerly.", locked: false },
  { icon: <PersonStanding size={30} aria-hidden="true" />, iconBg: "rgba(76,215,246,0.15)", iconColor: "var(--k-cyan)", statusVariant: "verified", status: "UNLOCKED", title: "10K Club", body: "Akumulasi jarak lari mencapai 10 kilometer dalam satu pekan.", locked: false },
  { icon: <Flame size={30} aria-hidden="true" />, iconBg: "rgba(255,185,95,0.15)", iconColor: "var(--k-amber)", statusVariant: "amber", status: "IN PROGRESS (5/7)", title: "Consistency Master", body: "Aktif berolahraga 7 hari berturut-turut tanpa terputus.", locked: false },
  { icon: <Bike size={30} aria-hidden="true" />, iconBg: "var(--k-bg-card-alt)", iconColor: "var(--k-text-1)", statusVariant: "muted", status: "TARGET", title: "Century Ride", body: "Menyelesaikan gowes sepeda jarak 100 kilometer dalam satu sesi tunggal.", locked: false },
];

export function Achievements() {
  return (
    <section className="w-full py-20 lg:py-24 bg-section-alt" id="achievement">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Milestone Konsistensi</span>
          <h2 className="text-headline-lg-mobile font-bold mb-2 text-t1">Setiap Progres Layak Dirayakan.</h2>
          <p className="text-body-lg max-w-xl text-t2">Bangun koleksi pencapaian otentik dari konsistensi berolahraga dan pencapaian jarak harianmu.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {BADGES.map((b) => (
            <div key={b.title} className="p-4 md:p-6 rounded-2xl flex flex-col items-center text-center bg-card border border-k" style={{ opacity: b.locked ? 0.65 : 1 }}>
              <div className="w-10 md:w-16 h-10 md:h-16 rounded-full flex items-center justify-center mb-3" style={{ background: b.iconBg, color: b.iconColor }}>{b.icon}</div>
              <Badge variant={b.statusVariant} className="mb-2 h-4 md:h-6 px-3 text-[7px] md:text-[9px]">{b.status}</Badge>
              <h3 className="text-headline-sm font-bold text-t1">{b.title}</h3>
              <p className="text-body-sm mt-2 text-t2">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
