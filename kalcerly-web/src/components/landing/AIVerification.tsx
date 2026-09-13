import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  {
    num: "01", numBg: "var(--k-bg-card-alt)", numColor: "var(--k-text-1)",
    title: "Telemetri Mentah",
    body: "Pengumpulan streaming data GPS kontinu 1 Hz, variansi kecepatan akselerometer, dan koherensi elevasi barometrik.",
    meta: [{ label: "Sampling Latency:", value: "1000ms", vc: "var(--k-text-1)" }, { label: "Speed Variance:", value: "0.42 m/s²", vc: "var(--k-text-1)" }],
    highlight: false,
  },
  {
    num: "02", numBg: "rgba(76,215,246,0.15)", numColor: "var(--k-cyan)",
    title: "Audit Kinematika AI",
    body: "Analisis ritme pergerakan manusia, mengeliminasi kemungkinan kendaraan bermotor, spoofing, atau bot GPS.",
    meta: [{ label: "Anomaly Score:", value: "0.02 (Low)", vc: "var(--k-green)" }, { label: "Vehicle Signature:", value: "Negative", vc: "var(--k-green)" }],
    highlight: true,
  },
  {
    num: "03", numBg: "rgba(16,185,129,0.15)", numColor: "var(--k-green)",
    title: "Hasil Verifikasi",
    body: "Status terverifikasi diterbitkan secara instan, mengizinkan aktivitas tercatat resmi pada rekor pribadi & claim token reward.",
    meta: null, verified: true, highlight: false,
  },
];

const AUDIT_MATRIX = [
  { label: "GPS Consistency", value: "99.8% Signal Lock", sub: "Tanpa lonjakan koordinat palsu" },
  { label: "Speed Pattern Check", value: "Kurva Fisiologis Wajar", sub: "Akselerasi ritmis langkah manusia" },
  { label: "Duration Threshold", value: "Minimal >10 Menit", sub: "Penyaringan micro-spamming" },
  { label: "Movement Rhythm", value: "Cadence Synchronized", sub: "Sinkronisasi langkah & pergerakan" },
];

export function AIVerification() {
  return (
    <section className="w-full py-20 lg:py-24 bg-section-alt">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Anti-Cheat Engine</span>
          <h2 className="text-headline-lg-mobile lg:text-headline-lg font-bold mb-2 text-t1">Aktivitasmu diverifikasi oleh AI</h2>
          <p className="text-body-lg max-w-2xl text-t2">Sistem AI Kalcerly membantu menganalisis data telemetri untuk mengidentifikasi pola yang tidak wajar sebelum aktivitas digunakan dalam fitur tertentu seperti reward atau leaderboard kompetisi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STAGES.map((s) => (
            <div key={s.num} className="p-6 rounded-3xl flex flex-col justify-between bg-card border border-k" style={{ boxShadow: s.highlight ? "0 0 30px rgba(76,215,246,0.1)" : undefined }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-md mb-4" style={{ background: s.numBg, color: s.numColor }}>{s.num}</div>
                <h3 className="text-headline-sm font-bold mb-2 text-t1">{s.title}</h3>
                <p className="text-body-sm leading-5 mb-4 text-t2">{s.body}</p>
              </div>
              {s.verified ? (
                <div className="p-3 rounded-xl flex items-center justify-between text-label-sm font-bold text-green" style={{ background: "rgba(16,185,129,0.12)" }}>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={16} aria-hidden="true" />STATUS: VERIFIED</span>
                  <Badge variant="verified" className="h-6">Valid Match</Badge>
                </div>
              ) : s.meta ? (
                <div className="p-4 rounded-xl text-label-md space-y-1 bg-card-alt text-t3">
                  {s.meta.map((m) => (
                    <div key={m.label} className="flex justify-between">
                      <span>{m.label}</span>
                      <span style={{ color: m.vc }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-card border border-k">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <div>
              <h3 className="text-title-lg mb-4 font-semibold text-t1">Tolak Ukur Audit Verifikasi Kinematika</h3>
              <p className="text-body-sm text-t2">Sistem memastikan keadilan untuk seluruh anggota komunitas.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {AUDIT_MATRIX.map((m) => (
              <div key={m.label} className="p-6 rounded-xl bg-card-alt">
                <p className="text-label-sm uppercase mb-2 text-t3">{m.label}</p>
                <p className="text-body-md font-bold mt-1 text-t1">{m.value}</p>
                <p className="text-body-sm mt-2 text-t2" style={{ fontSize: 11 }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
