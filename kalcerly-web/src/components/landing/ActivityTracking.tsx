import { BarChart2, Map, ShieldCheck } from "lucide-react";

const SPLITS = [
  { km: "KM 1", pct: 78, time: "5:42", color: "var(--k-volt)" },
  { km: "KM 2", pct: 82, time: "5:50", color: "var(--k-volt)" },
  { km: "KM 3", pct: 74, time: "5:35", color: "var(--k-cyan)" },
  { km: "KM 4", pct: 85, time: "6:02", color: "var(--k-volt)" },
  { km: "KM 5", pct: 80, time: "5:48", color: "var(--k-volt)" },
];

const STATS = [
  { label: "Jarak", val: "5.42", unit: "km", color: "var(--k-volt)" },
  { label: "Durasi", val: "32:18", unit: "", color: "var(--k-text-1)" },
  { label: "Rata-rata Pace", val: "5:57", unit: "/km", color: "var(--k-cyan)" },
  { label: "Elevasi / Kalori", val: "+45m", unit: "/ 380 kkal", color: "var(--k-amber)" },
];

export function ActivityTracking() {
  return (
    <section id="fitur" className="w-full py-20 lg:py-24 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-cyan">Presisi Telemetri</span>
            <h2 className="text-headline-lg-mobile font-bold mb-4 text-t1">Setiap Aktivitas Punya Cerita</h2>
            <p className="text-body-lg mb-6 text-t2">Kalcerly membantu mengubah data mentah GPS sensor menjadi insight kebugaran visual yang mudah dipahami, rapi, dan terpercaya.</p>
            <div className="space-y-8">
              <FeatureRow icon={<BarChart2 size={24} aria-hidden="true" />} iconColor="var(--k-volt)" title="Analisis Split Per Kilometer" desc="Deteksi fluktuasi kecepatan saat transisi elevasi jalan secara akurat." />
              <FeatureRow icon={<Map size={24} aria-hidden="true" />} iconColor="var(--k-cyan)" title="Visualisasi Rute Polyline" desc="Pemetaan rute jalanan kota yang mulus dengan penanda titik kilometer interaktif." />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-4 md:p-6 rounded-3xl flex flex-col gap-4 shadow-2xl bg-card border border-k">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-volt" style={{ background: "rgba(163,230,53,0.15)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-headline-sm font-bold mb-2 text-t1">Gelora Bung Karno Morning Loop</h3>
                      <span className="hidden md:block px-2.5 py-0.5 rounded-full font-semibold text-green" style={{ background: "rgba(16,185,129,0.12)", fontSize: 11 }}>Verified</span>
                    </div>
                    <p className="text-body-sm text-t3">Hari ini, 06:14 WIB • Senayan, Jakarta</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-full text-label-md text-t1 bg-card-alt mt-2">Running 🏃</span>
              </div>

              <div className="relative w-full h-56 rounded-2xl overflow-hidden flex items-center justify-center p-4 bg-input" role="img" aria-label="Peta rute GPS Gelora Bung Karno">
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" aria-hidden="true">
                  <path d="M0 40 H500 M0 80 H500 M0 120 H500 M0 160 H500" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <path d="M50 0 V200 M150 0 V200 M250 0 V200 M350 0 V200 M450 0 V200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <path d="M 60 140 C 90 70, 160 50, 230 70 C 300 90, 360 40, 420 80 C 460 110, 440 170, 360 160 C 270 150, 220 180, 150 160 C 90 140, 70 160, 60 140 Z" stroke="#CCFF80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ filter: "drop-shadow(0 0 12px rgba(204,255,128,0.7))" }} />
                  <circle cx="60" cy="140" r="5" fill="#4CD7F6" />
                  <text fill="#4CD7F6" fontFamily="Space Grotesk, monospace" fontSize="10" x="50" y="130">START</text>
                  <circle cx="230" cy="70" r="4" fill="#FFFFFF" />
                  <circle cx="420" cy="80" r="4" fill="#FFFFFF" />
                  <circle cx="360" cy="160" r="4" fill="#FFFFFF" />
                </svg>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-label-sm text-t1" style={{ background: "rgba(31,35,43,0.9)", backdropFilter: "blur(4px)" }}>Sensor: 1 Hz Precision GPS</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map((s) => (
                  <div key={s.label} className="p-3 rounded-xl flex flex-col bg-card-alt">
                    <span className="text-label-sm uppercase text-t3">{s.label}</span>
                    <span className="font-stat font-bold leading-tight" style={{ fontSize: 22, color: s.color }}>
                      {s.val}{s.unit && <span className="text-sm font-normal text-t3"> {s.unit}</span>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl flex flex-col gap-2 bg-card-alt">
                <span className="text-label-md font-semibold text-t1">Pace Split Tiap Kilometer</span>
                <div className="space-y-2 mt-1">
                  {SPLITS.map((s) => (
                    <div key={s.km} className="flex items-center gap-3 text-label-sm">
                      <span className="w-8 text-t3">{s.km}</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden bg-track">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <span className="w-12 text-right font-stat font-bold" style={{ color: s.color }}>{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: "rgba(16,185,129,0.1)" }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green" aria-hidden="true" />
                  <span className="text-label-sm font-bold text-green">AI TELEMETRY VERIFIED</span>
                </div>
                <span className="text-t3" style={{ fontSize: 11 }}>99.4% Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ icon, iconColor, title, desc }: { icon: React.ReactNode; iconColor: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-6 rounded-xl bg-card border border-k">
      <span style={{ color: iconColor, marginTop: 2 }}>{icon}</span>
      <div>
        <h3 className="text-title-lg font-semibold text-t1 mb-3">{title}</h3>
        <p className="text-body-sm leading-6 text-t2">{desc}</p>
      </div>
    </div>
  );
}
