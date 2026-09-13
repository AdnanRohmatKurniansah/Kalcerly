import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FinalCTA() {
  return (
    <section id="download" className="w-full py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="p-6 lg:p-12 rounded-3xl bg-card border border-k">
          <div className="flex justify-center items-center gap-6 ">
            <div className="text-center mx-auto">
              <Badge variant="volt" className="mb-4 h-7 px-3 text-label-md text-[var(--k-volt)]">
                Aplikasi Mobile Android
              </Badge>
              <h2 className="text-headline-lg-mobile lg:text-headline-lg font-bold mb-4 text-t1">
                Mulai Bergerak Bersama Kalcerly.
              </h2>
              <p className="text-body-lg mb-8 max-w-2xl text-t2">
                Dapatkan pengalaman lacak kebugaran presisi, audit verifikasi AI real-time, dan ekosistem sosial langsung dari smartphone Android kamu.
              </p>
              <div className="flex justify-items-center justify-center mx-auto items-center gap-4 mb-6">
                <Button
                  variant="volt"
                  size="cta"
                  className={'gap-2'}
                  render={<a href="https://github.com/AdnanRohmatKurniansah/Kalcerly" aria-label="Unduh Kalcerly di Google Play" />}>
                  <Download size={18} aria-hidden="true" />
                  Unduh di Google Play
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
