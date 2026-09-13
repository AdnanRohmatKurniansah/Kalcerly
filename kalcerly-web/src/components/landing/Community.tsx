import { Heart, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ATHLETES = [
  { initials: "RA", name: "Rian Ardiansyah", sub: "Marathoner • Bandung", accent: "var(--k-volt)", following: false },
  { initials: "NL", name: "Nadia Larasati", sub: "Road Cyclist • Jakarta", accent: "var(--k-cyan)", following: true },
  { initials: "NL", name: "Rudi Nur", sub: "Marathoner • Bogor", accent: "var(--k-volt)", following: false },
];

const POSTS = [
  { initials: "DP", name: "Dimas Pratama", verified: true, verifiedColor: "var(--k-volt)", sub: "Pagi tadi pukul 06:14 • Morning Run Senayan", dist: "5.42 KM", distColor: "var(--k-volt)", distBg: "rgba(163,230,53,0.1)", body: "Pemanasan sebelum jam kantor. Udara pagi ini cukup bersih untuk interval pace di area lingkar luar GBK! ⚡", routeStroke: "#CCFF80", kudos: 42, comments: 8, kudosColor: "var(--k-volt)" },
  { initials: "SK", name: "Sarah Kartika", verified: true, verifiedColor: "var(--k-cyan)", sub: "Kemarin sore • Sunset Ride Sudirman-Kuningan", dist: "18.2 KM", distColor: "var(--k-cyan)", distBg: "rgba(76,215,246,0.1)", body: "Gowes santai sore mengejar matahari terbenam. Jakarta lengang selepas jam sibuk. Ride safe semuanya! 🚲✨", routeStroke: "#4CD7F6", kudos: 65, comments: 14, kudosColor: "var(--k-cyan)" },
];

export function Community() {
  return (
    <section id="komunitas" className="w-full py-20 lg:py-24 bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-label-md uppercase tracking-wider font-semibold mb-2 text-volt">Koneksi Nyata</span>
            <h2 className="text-headline-lg-mobile lg:text-headline-lg font-bold mb-4 text-t1">Bergerak Bersama.</h2>
            <p className="text-body-lg mb-8 text-t2">Bagikan aktivitas, berikan apresiasi kudo, ikuti atlet perkotaan lainnya, dan temukan komunitas yang memiliki komitmen konsistensi sama.</p>

            <div className="p-5 rounded-2xl flex flex-col gap-4 bg-card border border-k">
              <h3 className="text-title-lg font-semibold text-t1 mb-3">Atlet Kota yang Direkomendasikan</h3>
              {ATHLETES.map((a) => (
                <div key={a.initials} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-card-alt" style={{ color: a.accent }}>{a.initials}</div>
                    <div>
                      <p className="text-label-md font-bold mb-1 text-t1">{a.name}</p>
                      <p className="text-body-sm text-t3" style={{ fontSize: 11 }}>{a.sub}</p>
                    </div>
                  </div>
                  <Button
                    variant={a.following ? "ghost-k" : "volt"}
                    size="sm"
                    className="rounded-full text-label-sm font-semibold">
                    {a.following ? "Mengikuti" : "Ikuti"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-8">
            {POSTS.map((post) => (
              <div key={post.initials} className="p-6 rounded-2xl flex flex-col gap-3 shadow-md bg-card border border-k">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 md:w-11 h-8 md:h-11 shrink-0 aspect-square rounded-full flex items-center justify-center font-bold text-sm" style={{ background: post.distBg, color: post.distColor}}>
                      {post.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-label-lg font-bold text-t1">{post.name}</p>
                        {post.verified && <CheckCircle2 size={14} style={{ color: post.verifiedColor }} aria-label="Terverifikasi" />}
                      </div>
                      <p className="text-body-sm text-t3">{post.sub}</p>
                    </div>
                  </div>
                  <Badge
                    className="h-6 md:h-7 px-2 md:px-2.5 text-label-sm font-bold"
                    style={{ background: post.distBg, color: post.distColor, borderColor: "transparent" }}>
                    {post.dist}
                  </Badge></div>

                <p className="text-body-md text-t1 mb-2">{post.body}</p>

                <div className="w-full h-32 rounded-xl p-2 relative overflow-hidden flex items-center justify-center bg-input" role="img" aria-label={`Rute GPS ${post.name}`}>
                  <svg className="w-2/3 h-2/3" viewBox="0 0 400 80" fill="none" aria-hidden="true">
                    <path d="M 20 40 Q 100 10, 200 40 T 380 40" stroke={post.routeStroke} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${post.routeStroke}80)` }} />
                    <circle cx="20" cy="40" r="4" fill="#4CD7F6" />
                    <circle cx="380" cy="40" r="4" fill={post.routeStroke} />
                  </svg>
                  <div className="absolute bottom-1 right-2 text-label-sm text-t3" style={{ fontSize: 10 }}>Pace 5:57 /km • 32:18 min</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost"
                      size="sm"
                      className="gap-1.5 text-label-md px-2"
                      style={{ color: post.kudosColor }}
                      aria-label={`${post.kudos} Kudos`}>
                      <Heart className="w-16" aria-hidden="true" /><span>{post.kudos} Kudos</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-label-md px-2"
                      aria-label={`${post.comments} Komentar`}
                    >
                      <MessageCircle className="w-16" aria-hidden="true" /><span>{post.comments} Komentar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
