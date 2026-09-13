import { MapPin, ShieldCheck, Coins, Trophy, TrendingUp } from "lucide-react";

const STEPS = [
  { num: "01", numColor: "var(--k-volt)", icon: <MapPin size={18} aria-hidden="true" />, iconBg: "rgba(163,230,53,0.1)", iconColor: "var(--k-volt)", title: "Track", body: "Walking, Running, & Cycling. Rekam durasi, jarak, elevasi, dan pace rute secara live." },
  { num: "02", numColor: "var(--k-cyan)", icon: <ShieldCheck size={18} aria-hidden="true" />, iconBg: "rgba(76,215,246,0.1)", iconColor: "var(--k-cyan)", title: "Verify", body: "AI menganalisis data telemetri kinematika untuk status Valid, Review, atau Rejected." },
  { num: "03", numColor: "var(--k-volt)", icon: <Coins size={18} aria-hidden="true" />, iconBg: "rgba(163,230,53,0.1)", iconColor: "var(--k-volt)", title: "Earn", body: "Aktivitas valid membuka potensi klaim FIT Token sesuai parameter rasio olahraga." },
  { num: "04", numColor: "var(--k-amber)", icon: <Trophy size={18} aria-hidden="true" />, iconBg: "rgba(255,185,95,0.15)", iconColor: "var(--k-amber)", title: "Compete", body: "Ikuti segment sprint perkotaan, community challenge, dan naikkan peringkatmu." },
  { num: "05", numColor: "var(--k-green)", icon: <TrendingUp size={18} aria-hidden="true" />, iconBg: "rgba(16,185,129,0.1)", iconColor: "var(--k-green)", title: "Improve", body: "Lihat histori statistik, raih personal record (PR), dan pertahankan rekor streak harian." },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="w-full py-20 lg:py-24 bg-section-alt">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Alur Ekosistem</span>
          <h2 className="text-headline-lg-mobile font-bold mb-2 text-t1">Siklus Olahraga Cerdas Kalcerly</h2>
          <p className="text-body-lg max-w-xl text-t2">Dari aktivitas pertama hingga progress, kompetisi, dan reward terdesentralisasi.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-2xl flex flex-col relative hover:bg-card-alt transition-colors duration-200 cursor-default bg-card border border-k w-full md:w-[calc(33.333%-1.25rem)]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-stat font-bold text-headline-md" style={{ color: step.numColor }}>{step.num}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: step.iconBg, color: step.iconColor }}>{step.icon}</div>
              </div>
              <h3 className="text-headline-sm font-bold mb-2 text-t1">{step.title}</h3>
              <p className="text-body-sm text-t2">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
