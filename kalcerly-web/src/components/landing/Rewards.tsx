import { PersonStanding, Bike } from "lucide-react";

const TOKEN_RATES = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" /></svg>, label: "Lari (Running)", value: "2 FIT", unit: "/ km", color: "var(--k-volt)" },
  { icon: <PersonStanding size={18} aria-hidden="true" />, label: "Jalan Kaki (Walking)", value: "1 FIT", unit: "/ km", color: "var(--k-volt)" },
  { icon: <Bike size={18} aria-hidden="true" />, label: "Sepeda (Cycling)", value: "1.5 FIT", unit: "/ km", color: "var(--k-cyan)" },
];

const CONTRACT_STEPS = [
  { num: "01", bg: "rgba(163,230,53,0.15)", color: "var(--k-volt)", title: "Verified Activity Telemetry", sub: "Data teruji lolos anti-cheat" },
  { num: "02", bg: "rgba(76,215,246,0.15)", color: "var(--k-cyan)", title: "ActivityProof Contract", sub: "Penerbitan bukti cryptographically-signed" },
  { num: "03", bg: "rgba(255,185,95,0.15)", color: "var(--k-amber)", title: "RewardManager Vault", sub: "Kalkulasi kuota FIT token harian" },
];

export function Rewards() {
  return (
    <section className="w-full py-20 lg:py-24 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Incentive Architecture</span>
            <h2 className="text-headline-lg-mobile font-bold mb-4 text-t1">Aktivitasmu Punya Nilai.</h2>
            <p className="text-body-lg mb-6 text-t2">Aktivitas yang berhasil melewati verifikasi AI dapat digunakan untuk mendapatkan alokasi FIT Token reward sesuai parameter rasio platform.</p>

            <div className="rounded-2xl p-5 mb-4 overflow-hidden bg-card border border-k">
              <div className="block md:flex items-center justify-between pb-5 mb-5 border-b border-k">
                <div className="text-[14px] md:text-[16px] font-semibold text-t1">Tabel Parameter Reward Resmi</div>
                <div className="text-label-sm mt-3 md:mt-0 text-volt" style={{ fontSize: 11 }}>BNB Chain Verified</div>
              </div>
              <div className="space-y-2">
                {TOKEN_RATES.map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-lg bg-card-alt">
                    <span className="flex items-center gap-2 text-body-sm font-medium text-t1">
                      <span className="text-t2">{r.icon}</span>{r.label}
                    </span>
                    <span className="font-stat font-bold text-headline-sm" style={{ color: r.color }}>
                      {r.value} <span className="text-xs font-normal text-t3">{r.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 flex items-center justify-between text-label-sm text-t3 border-t border-k">
                <span className="text-[9px] md:text-xs">Batas Maksimal Klaim:</span>
                <span className="font-bold text-[9px] md:text-xs">100 FIT / hari</span>
              </div>
            </div>

            <p className="text-body-sm italic text-t3" style={{ fontSize: 12 }}>* Disclaimer: Reward mengikuti aturan dan parameter verifikasi yang diterapkan pada platform untuk menjaga keadilan ekosistem.</p>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl flex flex-col gap-3 bg-card border border-k">
            <span className="text-label-md uppercase tracking-wider text-t3">Mekanisme Smart Contract</span>
            {CONTRACT_STEPS.map((step) => (
              <div key={step.num}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card-alt">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: step.bg, color: step.color }}>{step.num}</div>
                  <div>
                    <p className="text-label-md font-bold mb-1 text-t1">{step.title}</p>
                    <p className="text-body-sm text-t3" style={{ fontSize: 11 }}>{step.sub}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-k-volt">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-volt-on" style={{ background: "rgba(0,0,0,0.15)" }}>04</div>
              <div>
                <p className="text-label-md font-bold text-volt-on">Primary User Wallet</p>
                <p className="text-body-sm text-volt-on opacity-80" style={{ fontSize: 11 }}>FIT Token didistribusikan ke dompetmu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
