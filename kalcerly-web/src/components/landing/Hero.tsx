import { ArrowRight, Navigation, ShieldCheck, Unlock, Coins, VerifiedIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section id="beranda" className="relative w-full overflow-hidden py-16 lg:py-24 bg-page">
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(204,255,128,0.08)", filter: "blur(120px)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -right-40 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(76,215,246,0.08)", filter: "blur(140px)" }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-26">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex mb-4 gap-2 items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-elevated text-primary font-label-md text-label-md mb-space-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
              </svg>
              <span className="">AI-POWERED SOCIAL FITNESS</span>
            </div>
            <h1 className="text-[26px] md:text-[36px] leading-[44px] md:leading-[52px] font-bold mb-2 text-t1">
              Make Movement a Culture.
            </h1>
            <p className="text-[24px] md:text-[34px] leading-[32px] md:leading-[44px] font-bold mb-4 text-volt">
              Ubah Setiap Langkah Jadi Budaya &amp; Progress Nyata
            </p>
            <p className="text-[15px] lg:text-[18px] max-w-2xl mb-10 text-t2">
              Lacak aktivitasmu, verifikasi progres dengan AI, terhubung dengan komunitas, dan bangun perjalanan fitness yang lebih konsisten. Web3 hadir sebagai reward layer ketika kamu membutuhkannya.
            </p>
            <div className="flex items-center gap-4 mb-10">
              <Button variant="volt" size="cta" className="group" render={<a href="#download" />}>
                Mulai Bergerak
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
              <Button variant="volt-outline" size="cta" render={<a href="#cara-kerja" />}>
                Lihat Cara Kerja
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-4 pt-4 w-full">
              <SignalItem icon={<Navigation size={16} />} iconColor="var(--k-volt)" label="GPS Presisi" sub="Sensor akurat 1 Hz" />
              <SignalItem icon={<ShieldCheck size={16} />} iconColor="var(--k-cyan)" label="AI Verification" sub="Audit kinematika" />
              <SignalItem icon={<Unlock size={16} />} iconColor="var(--k-volt)" label="Web2-First" sub="Login instan" />
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-10 lg:mt-0">
            <div
              className="absolute inset-0 rounded-[48px] pointer-events-none"
              style={{
                background: "linear-gradient(to top right,rgba(204,255,128,0.15),rgba(76,215,246,0.15))",
                filter: "blur(48px)",
                opacity: 0.6,
              }}
              aria-hidden="true"
            />

            <Badge
              variant="volt"
              className="absolute top-4 left-6 z-20 hidden sm:inline-flex h-8 px-3 gap-2 text-label-md shadow-xl bg-[var(--k-bg-card)] text-[var(--k-volt)]"
              aria-label="14 Hari Streak Aktif">
              <span className="w-2 h-2 rounded-full animate-ping bg-k-volt" aria-hidden="true" />
              14 Hari Streak Aktif
            </Badge>

            <Badge
              variant="verified"
              className="absolute top-1/2 left-8 z-20 hidden sm:inline-flex h-8 px-3 gap-1.5 text-label-md shadow-xl bg-[var(--k-bg-card)] text-[var(--k-green)]"
              aria-label="AI Verified">
              <VerifiedIcon size={12} aria-hidden="true" />
              AI Verified: Kinematika Wajar
            </Badge>

            <Badge
              variant="amber"
              className="absolute -bottom-4 -right-2 z-20 hidden sm:inline-flex h-8 px-3 gap-1.5 text-label-md shadow-xl bg-[var(--k-bg-card)] text-[var(--k-amber)]"
              aria-label="Demo: +45 FIT Token Reward">
              <Coins size={12} aria-hidden="true" />
              Reward: +45 FIT Token (Demo)
            </Badge>

            <div className="relative z-10 w-[310px] sm:w-[340px] rounded-[40px] p-3 shadow-2xl animate-float bg-pill">
              <div className="w-full rounded-[32px] p-4 overflow-hidden flex flex-col gap-3 bg-section-alt">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(163,230,53,0.15)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--k-volt)" aria-hidden="true">
                        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase text-t3">Live Tracking</p>
                      <p className="font-bold leading-tight text-t1" style={{ fontSize: 14 }}>
                        Morning Urban Loop
                      </p>
                    </div>
                  </div>
                  <Badge variant="volt" className="text-[10px]">GPS 100%</Badge>
                </div>

                <div
                  className="relative w-full h-44 rounded-2xl overflow-hidden flex items-center justify-center p-2 bg-input"
                  role="img"
                  aria-label="Peta rute GPS"
                >
                  <svg className="w-full h-full" viewBox="0 0 260 160" fill="none">
                    <defs>
                      <pattern id="grid-hero" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-hero)" />
                    <path d="M10 130 Q 70 80, 140 110 T 250 90" fill="none" stroke="rgba(76,215,246,0.15)" strokeWidth="1" />
                    <path d="M10 90 Q 90 40, 170 80 T 250 50" fill="none" stroke="rgba(76,215,246,0.1)" strokeWidth="1" />
                    <path
                      d="M 35 125 C 45 60, 95 40, 140 50 C 185 60, 225 35, 220 100 C 215 140, 150 145, 110 120 C 85 105, 55 140, 35 125 Z"
                      stroke="#4CD7F6"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      style={{ filter: "drop-shadow(0 0 8px rgba(76,215,246,0.8))" }}
                    />
                    <circle cx="35" cy="125" r="5" fill="#CCFF80" />
                    <circle cx="220" cy="100" r="6" fill="#CCFF80" className="animate-pulse" />
                    <circle cx="220" cy="100" r="12" stroke="#CCFF80" strokeWidth="1.5" fill="none" opacity="0.6" />
                  </svg>
                  <div
                    className="absolute bottom-2 left-2 px-2 py-1 rounded text-label-sm text-cyan"
                    style={{ background: "rgba(31,35,43,0.8)", backdropFilter: "blur(4px)", fontSize: 9 }}
                  >
                    Jakarta Pusat • Segmen Sudirman
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <StatMini label="Jarak" value="5.42" unit="KM" color="var(--k-volt)" />
                  <StatMini label="Durasi" value="32:18" unit="MIN" color="var(--k-text-1)" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatMini label="Pace Rata-Rata" value="5:57" unit="/KM" color="var(--k-text-1)" small />
                  <StatMini label="Kalori" value="342" unit="KKAL" color="var(--k-amber)" small />
                </div>

                <div className="rounded-xl p-2.5 flex items-center justify-between" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green" aria-hidden="true" />
                    <span className="text-label-sm font-bold text-green">AI TELEMETRY VERIFIED</span>
                  </div>
                  <span className="text-label-sm text-t3" style={{ fontSize: 11 }}>99.4% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalItem({
  icon,
  iconColor,
  label,
  sub,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-1" style={{ color: iconColor }}>
        {icon}
        <span className="text-label-md font-semibold text-t1">{label}</span>
      </div>
      <span className="text-body-sm text-t3">{sub}</span>
    </div>
  );
}

function StatMini({
  label,
  value,
  unit,
  color,
  small,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-xl flex flex-col bg-card">
      <span className="text-label-sm uppercase text-t3">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-stat font-bold leading-tight"
          style={{ fontSize: small ? 16 : 26, color }}
        >
          {value}
        </span>
        <span className="text-label-sm text-t2" style={{ fontSize: 11 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
