export function Challenges() {
  return (
    <section className="w-full py-20 lg:py-24 bg-section-alt">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Kompetisi Sehat</span>
          <h2 className="text-headline-lg-mobile lg:text-headline-lg font-bold mb-2 text-t1">Sedikit Kompetisi. Lebih Banyak Motivasi.</h2>
          <p className="text-body-lg max-w-xl text-t2">Tantang dirimu sendiri, ikuti challenge komunitas mingguan, dan lihat bagaimana progresmu berkembang di leaderboard segmen.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl flex flex-col justify-between bg-card border border-k">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-label-sm font-bold text-volt" style={{ background: "rgba(163,230,53,0.12)" }}>CHALLENGE RESMI</span>
                <span className="text-label-sm text-t3">Sisa 2 Hari Lagi</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 md:mb-2 text-t1">Weekend 50K Endurance</h3>
              <p className="text-body-md mb-6 text-t2">Akumulasikan total jarak lari atau gowes sejauh 50 km sebelum hari Minggu berakhir untuk mendapatkan badge eksklusif dan alokasi bonus reward.</p>
              <div className="p-4 rounded-xl mb-4 bg-card-alt">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-label-md text-t3 mb-3">Progres Pribadi</span>
                  <span className="font-stat font-bold text-volt">42.8 <span className="text-sm font-normal text-t2">/ 50 km</span></span>
                </div>
                <div className="w-full h-2 md:h-3 rounded-full overflow-hidden bg-track">
                  <div className="h-full rounded-full transition-all duration-700 bg-k-volt" style={{ width: "85.6%" }} />
                </div>
                <div className="flex justify-between items-center mt-5 text-label-sm text-t3" style={{ fontSize: 11 }}>
                  <span>85.6% Tercapai</span><span>Tersisa 7.2 km lagi</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-label-md text-t3">2,410 Peserta Aktif</span>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl flex flex-col justify-between bg-card border border-k">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-label-sm uppercase font-bold text-cyan">Sprint Segment</span>
                  <h3 className="text-headline-sm font-bold text-t1 mt-3">Sudirman Sprint 1.2K</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-label-sm text-t2 bg-card-alt">Segmen Populer</span>
              </div>
              <div className="space-y-2.5">
                <LeaderboardItem rank="#1" rankColor="var(--k-amber)" initials="A" initialsColor="var(--k-volt)" name="Aditya Pratama" sub="Total 48.2 km • Minggu Ini" time="03:18" timeColor="var(--k-volt)" highlight={false} />
                <LeaderboardItem rank="#2" rankColor="var(--k-text-2)" initials="B" initialsColor="var(--k-cyan)" name="Bagas Wicaksono" sub="Total 45.6 km • Minggu Ini" time="03:42" timeColor="var(--k-text-1)" highlight={false} />
                <LeaderboardItem rank="#3" rankColor="var(--k-volt)" initials="YOU" initialsColor="var(--k-volt-on)" name="Kamu (Personal Best)" sub="Total 42.8 km • Minggu Ini" time="03:55" timeColor="var(--k-volt)" highlight />
              </div>
            </div>
            <div className="pt-6 md:pt-4 flex justify-end items-center text-label-md text-t3">
              <a href="https://play.google.com/store/games" target="_blank" className="hover:underline text-volt">Semua Peringkat →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeaderboardItem({ rank, rankColor, initials, initialsColor, name, sub, time, timeColor, highlight }: { rank: string; rankColor: string; initials: string; initialsColor: string; name: string; sub: string; time: string; timeColor: string; highlight: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: highlight ? "rgba(163,230,53,0.08)" : "var(--k-bg-card-alt)", border: highlight ? "1px solid rgba(163,230,53,0.15)" : "1px solid transparent" }}>
      <div className="flex items-center gap-3">
        <span className="w-6 font-stat font-bold text-headline-sm" style={{ color: rankColor }}>{rank}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: highlight ? "var(--k-volt)" : "rgba(163,230,53,0.15)", color: initialsColor }}>{initials}</div>
        <div>
          <p className="text-label-md font-bold" style={{ color: highlight ? "var(--k-volt)" : "var(--k-text-1)" }}>{name}</p>
          <p className="text-body-sm text-t3" style={{ fontSize: 11 }}>{sub}</p>
        </div>
      </div>
      <span className="font-stat font-bold text-body-lg" style={{ color: timeColor }}>{time}</span>
    </div>
  );
}
