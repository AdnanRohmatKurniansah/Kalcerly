import { useState, useEffect } from "react";
import { Menu, Sun, Moon, Download } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useAnchorNavigation } from "@/lib/utils";

type NavLink =
  | {
      label: string;
      type: "route";
      to: string;
    }
  | {
      label: string;
      type: "anchor";
      href: string;
    };

const NAV_LINKS: NavLink[] = [
  { label: "Beranda", type: "route", to: "/" },
  { label: "Fitur & AI Verifikasi", type: "anchor", href: "#fitur" },
  { label: "Cara Kerja & Reward", type: "anchor", href: "#cara-kerja" },
  { label: "Komunitas & Rute", type: "anchor", href: "#komunitas" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const handleAnchorNavigation = useAnchorNavigation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-page/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.25)]"
          : "bg-page/80 backdrop-blur-md"
      }`}>
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-8 md:w-9 h-8 md:h-9 rounded-lg flex items-center justify-center bg-k-volt shrink-0" aria-hidden="true">
            <img src="/logo.png" alt="Logo Kalcerly" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[16px] md:text-[18px] font-bold tracking-tight text-t1">
              KALCERLY
            </span>
            <span className="text-[7px] sm:text-[8px] font-medium tracking-[0.12em] uppercase text-t3 mt-2">
              Make Movement a Culture
            </span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) =>
            link.type === "route" ? (
              <Link
                key={link.to}
                to={link.to}
                className="text-label-md tracking-wider uppercase text-sv hover:text-t1 px-3 py-2 rounded-lg hover:bg-card transition-all duration-200">
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorNavigation(e, link.href)}
                className="text-label-md tracking-wider uppercase text-sv hover:text-t1 px-3 py-2 rounded-lg hover:bg-card transition-all duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="volt"
            size="cta-sm"
            className="hidden sm:inline-flex"
            render={<a href="https://github.com/AdnanRohmatKurniansah/Kalcerly" aria-label="Unduh Kalcerly di Google Play" />}
          >
            <Download size={16} aria-hidden="true" />
            Unduh di Google Play
          </Button>

          <Button
            variant="ghost-k"
            size="icon"
            className={theme === "dark" ? "!text-white" : "!text-black"}
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="ghost-k"
              size="icon"
              className="lg:hidden"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className={theme === "dark" ? "text-white" : "text-[var(--text-1)]"} size={20} />
            </Button>
            <SheetContent
              side="right"
              className="bg-[var(--k-bg-section-alt)] border-l border-[var(--k-border)] p-0 text-t1 [&>button]:text-t1 [&>button]:bg-card [&>button:hover]:text-k-volt">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--k-border)]">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-k-volt" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M3 14L7 8L10 11L13 6L16 9" stroke="var(--k-volt-on)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-headline-sm font-bold tracking-tight text-t1">KALCERLY</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Menu mobile">
                {NAV_LINKS.map((link) =>
                  link.type === "route" ? (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-label-md tracking-wider uppercase text-sv hover:text-t1 px-3 py-2 rounded-lg hover:bg-card transition-all duration-200">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleAnchorNavigation(e, link.href);
                        setMobileOpen(false);
                      }}
                      className="text-label-md tracking-wider uppercase text-sv hover:text-t1 px-3 py-2 rounded-lg hover:bg-card transition-all duration-200"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </nav>

              <div className="px-4 pb-6 mt-2">
                <Button
                  variant="volt"
                  size="cta-sm"
                  className="w-full"
                  render={<a href="https://github.com/AdnanRohmatKurniansah/Kalcerly" onClick={() => setMobileOpen(false)} />}
                >
                  <Download size={16} aria-hidden="true" />
                  Unduh di Google Play
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
