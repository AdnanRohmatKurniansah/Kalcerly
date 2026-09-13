import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const LEGAL_LINKS = [
  { label: "Ketentuan Layanan", href: "/ketentuan-layanan" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Pedoman Komunitas", href: "/pedoman-komunitas" },
];

export function LegalLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-page transition-colors duration-300">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <nav className="flex flex-wrap gap-2 mb-10" aria-label="Navigasi halaman legal">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-4 py-2 rounded-full text-label-md transition-all duration-200 border ${
                  pathname === l.href
                    ? "bg-k-volt text-[var(--k-volt-on)] border-transparent font-semibold"
                    : "border-k text-t2 hover:text-t1 bg-card"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
