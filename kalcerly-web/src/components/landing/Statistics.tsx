import { Trophy } from "lucide-react";

const TOP_STATS = [
  { label: "Total Jarak", value: "1,248", sub: "Kilometer ditempuh", color: "var(--k-volt)" },
  { label: "Total Aktivitas", value: "142", sub: "Sesi terverifikasi", color: "var(--k-text-1)" },
  { label: "Waktu Bergerak", value: "118h", sub: "Jam konsisten aktif", color: "var(--k-cyan)" },
  { label: "Rata-Rata Pace", value: "5:12", sub: "Menit per kilometer", color: "var(--k-amber)" },
];

const WEEKLY_BARS = [
  { label: "Sen", height: 45, isVolt: true, opacity: 0.25, glow: false },
  { label: "Sel", height: 70, isVolt: true, opacity: 0.25, glow: false },
  { label: "Rab", height: 30, isVolt: true, opacity: 0.25, glow: false },
  { label: "Kam", height: 85, isVolt: true, opacity: 0.25, glow: false },
  { label: "Jum", height: 50, isVolt: false, opacity: 0.3, glow: false },
  { label: "Sab", height: 100, isVolt: true, opacity: 1, glow: true },
  { label: "Min", height: 60, isVolt: true, opacity: 0.25, glow: false },
];

const PR_RECORDS = [
  { label: "5K Tercepat", sub: "Tercapai 12 Mei 2024", value: "23:42", color: "var(--k-volt)" },
  { label: "10K Tercepat", sub: "Tercapai 28 Juni 2024", value: "49:15", color: "var(--k-volt)" },
  { label: "Longest Run", sub: "Half Marathon", value: "21.1 km", color: "var(--k-cyan)" },
];

export function Statistics() {
  return (
    <section className="w-full py-20 lg:py-24 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-cyan">Peta Performa</span>
          <h2 className="text-headline-lg-mobile font-bold mb-2 text-t1">Lihat Progresmu Berkembang.</h2>
          <p className="text-body-lg max-w-xl text-t2">Statistik membantu kamu memahami kebiasaan, performa, dan perkembangan aktivitas dari waktu ke waktu secara terukur.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {TOP_STATS.map((s) => (
            <div key={s.label} className="p-6 rounded-2xl flex flex-col bg-card border border-k">
              <span className="text-label-md uppercase text-t3">{s.label}</span>
              <span className="font-stat text-[26px] md:text-[32px] font-bold mt-1" style={{ lineHeight: "48px", color: s.color }}>{s.value}</span>
              <span className="text-body-sm mt-1 text-t2">{s.sub}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-card border border-k">
            <div className="block md:flex justify-between items-center mb-4">
              <div className="mb-2 md:mb-0">
                <h3 className="text-title-lg font-semibold text-t1 mb-3">Volume Aktivitas Mingguan</h3>
                <p className="text-body-sm text-t3">38.4 km tercapai minggu ini</p>
              </div>
              <span className="text-label-sm px-2.5 py-1 rounded-full text-volt" style={{ background: "rgba(163,230,53,0.1)" }}>+14% vs minggu lalu</span>
            </div>
            <div className="h-54 flex items-end justify-between gap-3 pt-4 px-2" role="img" aria-label="Bar chart volume aktivitas mingguan">
              {WEEKLY_BARS.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg transition-all duration-300" style={{ height: `${b.height}%`, background: `rgba(${b.isVolt ? "163,230,53" : "76,215,246"},${b.opacity})`, boxShadow: b.glow ? "0 0 12px rgba(204,255,128,0.5)" : undefined }} />
                  <span className="text-label-sm" style={{ color: b.glow ? "var(--k-volt)" : "var(--k-text-3)", fontSize: 11 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl flex flex-col gap-4 bg-card border border-k">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={22} className="text-amber" aria-hidden="true" />
              <h3 className="text-title-lg font-semibold text-t1">Personal Records (PR)</h3>
            </div>
            <div className="space-y-3">
              {PR_RECORDS.map((r) => (
                <div key={r.label} className="p-4 rounded-xl flex items-center justify-between bg-card-alt">
                  <div>
                    <p className="text-label-md font-bold text-t1 mb-1">{r.label}</p>
                    <p className="text-body-sm text-t3" style={{ fontSize: 11 }}>{r.sub}</p>
                  </div>
                  <span className="font-stat font-bold text-headline-sm" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
