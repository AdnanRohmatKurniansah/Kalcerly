const CLUBS = [
  { tag: "Running", tagBg: "rgba(163,230,53,0.1)", tagColor: "var(--k-volt)", members: "1.2K Anggota", name: "Jogja Runners", desc: "Komunitas lari kota gudeg. Rute rutin melintasi Malioboro, Tugu, hingga hill repeat jalur Kaliurang." },
  { tag: "Cycling", tagBg: "rgba(76,215,246,0.1)", tagColor: "var(--k-cyan)", members: "842 Anggota", name: "Jakarta Urban Cyclist", desc: "Komunitas gowes pagi koridor Sudirman-Thamrin, sprint PIK 2, dan endurance weekend ride Jabodetabek." },
  { tag: "Walking & Health", tagBg: "rgba(255,185,95,0.12)", tagColor: "var(--k-amber)", members: "532 Anggota", name: "Morning Stride Society", desc: "Fokus pada konsistensi 10,000 langkah harian, jalan pagi santai, dan pemulihan aktif kebugaran holistik." },
];

export function Clubs() {
  return (
    <section className="w-full py-20 lg:py-24 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Kolektif Kota</span>
          <h2 className="text-headline-lg-mobile lg:text-headline-lg font-bold mb-2 text-t1">Temukan Komunitasmu.</h2>
          <p className="text-body-lg max-w-xl text-t2">Bergabung dengan club yang selaras dengan disiplin olahraga, target performa, dan ritme kotamu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLUBS.map((c) => (
            <div key={c.name} className="p-6 rounded-3xl flex flex-col justify-between transition-transform hover:-translate-y-1 duration-200 bg-card border border-k">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1 rounded-full text-label-sm font-semibold" style={{ background: c.tagBg, color: c.tagColor }}>{c.tag}</span>
                  <span className="text-label-md text-t3">{c.members}</span>
                </div>
                <h3 className="text-headline-sm font-bold mb-2 text-t1">{c.name}</h3>
                <p className="text-body-sm leading-6 mb-6 text-t2">{c.desc}</p>
              </div>
              <a href="https://play.google.com/store/games" className="w-full py-3 text-center rounded-full text-label-md font-semibold transition-colors hover:bg-card-alt text-t1 bg-card-alt border border-k">
                Gabung Club
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
