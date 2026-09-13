import { Route, Brain, UserCircle, Coins } from "lucide-react";

const METRICS = [
  { icon: <Route size={22} aria-hidden="true" />, iconBg: "rgba(163,230,53,0.1)", iconColor: "var(--k-volt)", eyebrow: "Aktivitas", title: "GPS Tracking", body: "Rekam walking, running, dan cycling dengan presisi sensor tinggi." },
  { icon: <Brain size={22} aria-hidden="true" />, iconBg: "rgba(76,215,246,0.1)", iconColor: "var(--k-cyan)", eyebrow: "Verifikasi", title: "AI-Assisted", body: "Membantu menilai keaslian aktivitas & kinematika kecepatan wajar." },
  { icon: <UserCircle size={22} aria-hidden="true" />, iconBg: "rgba(163,230,53,0.1)", iconColor: "var(--k-volt)", eyebrow: "Onboarding", title: "Web2-First", body: "Mulai instan dengan Google/Email tanpa hambatan dompet kripto." },
  { icon: <Coins size={22} aria-hidden="true" />, iconBg: "rgba(255,185,95,0.15)", iconColor: "var(--k-amber)", eyebrow: "Rewards Layer", title: "FIT Token", body: "Reward layer opsional berbasis smart contract BNB Smart Chain." },
];

export function ProductMetrics() {
  return (
    <section className="w-full pb-20 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m) => (
            <div key={m.title} className="p-4 rounded-2xl flex flex-col gap-1 transition-transform hover:-translate-y-1 duration-200 bg-card border border-k">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: m.iconBg, color: m.iconColor }}>{m.icon}</div>
              <span className="text-label-sm uppercase tracking-widest text-t3">{m.eyebrow}</span>
              <h2 className="text-headline-sm font-bold text-t1">{m.title}</h2>
              <p className="text-body-sm text-t2">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
