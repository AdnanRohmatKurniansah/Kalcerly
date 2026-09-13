import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { useAnchorNavigation } from "@/lib/utils";

const FOOTER_LINKS: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Product: [
    { label: "AI Telemetri", href: "#fitur", external: true }, 
    { label: "Smart Routes", href: "#komunitas", external: true }, 
    { label: "Token Rewards", href: "#cara-kerja", external: true }, 
    { label: "Mobile App (APK)", href: "https://github.com/AdnanRohmatKurniansah/Kalcerly", external: true }
  ],
  Community: [
    { label: "City Runners Guild", href: "#komunitas", external: true }, 
    { label: "Leaderboard Musiman", href: "#achievement", external: true }, 
    { label: "Discord", href: "#download", external: true }],
  Legal: [
    { label: "Ketentuan Layanan", href: "/ketentuan-layanan" }, 
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" }, 
    { label: "Pedoman Komunitas", href: "/pedoman-komunitas" }],
};

export function Footer() {
  const { theme } = useTheme();
  const handleAnchorNavigation = useAnchorNavigation();
  
  return (
    <footer className={theme === "dark" ? "bg-footer-k" : "bg-section-alt"}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-26">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-18">
          <div className="col-span-2 mb-4 md:mb-0 lg:col-span-2 flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-3 shrink-0 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-k-volt shrink-0" aria-hidden="true">
                <img src="/logo.png" alt="Logo Kalcerly" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[20px] font-bold tracking-tight text-t1">
                  KALCERLY
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.12em] uppercase text-t3 mt-2">
                  Make Movement a Culture
                </span>
              </div>
            </Link>
            <p className="text-body-md leading-6 max-w-sm mt-1 text-t2">Platform social fitness berbasis Web3 yang menghubungkan pelari, pesepeda, dan pegiat kebugaran urban dengan verifikasi AI dan ekosistem reward terdesentralisasi.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-5">
              <p className="text-label-lg tracking-wider uppercase font-semibold text-t1">{section}</p>
              <div className="flex flex-col gap-4">
                {links.map((link) =>
                  link.external ? (
                    <a key={link.label}  href={link.href}
                      onClick={(e) =>
                        handleAnchorNavigation(e, link.href)
                      }
                      className="text-body-md transition-colors hover:text-volt text-t2">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} to={link.href}
                      className="text-body-md transition-colors hover:text-volt text-t2">
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="py-5 flex flex-col items-center justify-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] md:text-[13px]" style={{ color: "#6b7280" }}>© 2026 Kalcerly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
