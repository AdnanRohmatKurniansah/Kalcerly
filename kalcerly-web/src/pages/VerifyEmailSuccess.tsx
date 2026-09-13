import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Download } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function VerifyEmailSuccess() {
  usePageTitle("Email Berhasil Diverifikasi");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#a3e635", "#4cd7f6", "#ffb95f", "#10b981"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
    }));

    let animId: number;
    let running = true;

    function draw() {
      if (!running || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const timeout = setTimeout(() => {
      running = false;
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-page flex flex-col overflow-hidden transition-colors duration-300">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(204,255,128,0.08)", filter: "blur(120px)" }} aria-hidden="true" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(76,215,246,0.08)", filter: "blur(140px)" }} aria-hidden="true" />
      
      <Navbar />

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-32 md:py-42">
        <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(163,230,53,0.12)",
                border: "2px solid rgba(163,230,53,0.35)",
                boxShadow: "0 0 48px -4px rgba(163,230,53,0.3)",
              }}>
              <ShieldCheck size={40} className="text-volt" aria-hidden="true" />
            </div>
            <span className="absolute inset-0 rounded-full animate-ping-slow" style={{ border: "2px solid rgba(163,230,53,0.2)" }}
              aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="inline-flex mx-auto items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-k text-volt text-label-md">
              <span className="w-2 h-2 rounded-full bg-k-volt animate-ping-slow" aria-hidden="true" />
              Akun Aktif
            </div>
            <h1 className="text-headline-lg text-t1">
              Email Kamu Berhasil<br />Diverifikasi!
            </h1>
            <p className="text-body-md text-t2 max-w-sm mx-auto leading-7">
              Akunmu sudah aktif dan siap digunakan. Unduh aplikasi Kalcerly dan mulai perjalanan fitnesmu sekarang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button
              variant="volt"
              size="cta"
              className="group gap-2"
              render={<a href="#download" />}
            >
              <Download size={18} aria-hidden="true" />
              Unduh di Google Play
            </Button>
            <Button variant="volt-outline" size="cta" render={<Link to="/" />}>
              Ke Beranda
            </Button>
          </div>

          <div className="w-full p-5 rounded-2xl border border-k bg-card flex flex-col gap-3 text-left">
            <p className="text-label-lg text-t1 uppercase tracking-wider">Yang bisa kamu lakukan sekarang</p>
            <div className="flex flex-col gap-2.5">
              {[
                "Login ke aplikasi dengan email & password",
                "Lacak aktivitas lari, jalan, atau bersepeda",
                "Dapatkan verifikasi AI untuk setiap aktivitas",
                "Bergabung dengan komunitas fitness Kalcerly",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(163,230,53,0.15)" }}
                    aria-hidden="true"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="var(--k-volt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-body-md text-t2">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
