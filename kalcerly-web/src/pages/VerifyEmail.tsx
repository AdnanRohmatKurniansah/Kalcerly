import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldX, RefreshCw, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Status = "verifying" | "success" | "error";

interface ErrorState {
  message: string;
  code?: string;
  canResend: boolean;
}

export function VerifyEmail() {
  usePageTitle("Verifikasi Email");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(
    token ? "verifying" : "error"
  );
  const [error, setError] = useState<ErrorState | null>(
    token
      ? null
      : {
          message:
            "Token verifikasi tidak ditemukan. Pastikan kamu membuka link yang tepat dari email.",
          canResend: true,
        }
  );
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verifyEmail() {
      try {
        await api.post("/auth/verify-email", { token });

        if (cancelled) return;

        setStatus("success");

        setTimeout(() => {
          navigate("/verify-email/success", { replace: true });
        }, 1500);
      } catch (err: unknown) {
        if (cancelled) return;

        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response
        ) {
          const data = (
            err.response as {
              data: {
                message?: string;
                errors?: string;
              };
            }
          ).data;

          const code = data?.errors;

          setError({
            message: data?.message ?? "Verifikasi gagal.",
            code,
            canResend:
              code === "INVALID_TOKEN" || code === undefined,
          });
        } else {
          setError({
            message:
              "Tidak dapat terhubung ke server. Periksa koneksi internetmu.",
            canResend: false,
          });
        }

        setStatus("error");
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error("Masukkan alamat email kamu.");
      return;
    }
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail.trim() });
      toast.success("Email verifikasi baru telah dikirim. Periksa inbox kamu.");
      setResendCooldown(60);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data: { message?: string } }).data;
        toast.error(data?.message ?? "Gagal mengirim ulang email.");
      } else {
        toast.error("Tidak dapat terhubung ke server.");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-page flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-32 md:py-42">
        <div className="w-full max-w-md">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-card border border-k">
                <Loader2 size={36} className="text-volt animate-spin" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-headline-md text-t1 mb-2">Memverifikasi Email</h1>
                <p className="text-body-md text-t2">Sedang memproses token verifikasimu, sebentar ya...</p>
              </div>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-card border border-k" style={{ borderColor: "rgba(163,230,53,0.35)" }}>
                <ShieldCheck size={36} className="text-volt" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-headline-md text-t1 mb-2">Email Terverifikasi!</h1>
                <p className="text-body-md text-t2">Mengarahkan kamu sebentar...</p>
              </div>
              <Loader2 size={18} className="text-t3 animate-spin" aria-hidden="true" />
            </div>
          )}

          {status === "error" && error && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-5 text-center p-8 rounded-2xl border border-k bg-card">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <ShieldX className="w-64" style={{ color: "#ef4444" }} aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-headline-sm text-t1 mb-2">Verifikasi Gagal</h1>
                  <p className="text-body-md text-t2 leading-6">{error.message}</p>
                  {error.code && (
                    <p className="mt-3 text-label-md font-mono text-t3">
                      Kode: {error.code}
                    </p>
                  )}
                </div>
              </div>

              {error.canResend && (
                <div className="p-6 rounded-2xl border border-k bg-card flex flex-col gap-4">
                  <div>
                    <p className="text-title-lg text-t1 mb-3">Kirim Ulang Email Verifikasi</p>
                    <p className="text-body-sm leading-5 text-t2">Masukkan email yang kamu daftarkan untuk mendapatkan link baru.</p>
                  </div>
                  <form onSubmit={handleResend} className="flex flex-col gap-3" noValidate>
                    <div className="flex flex-col gap-4">
                      <label htmlFor="resend-email" className="text-label-lg text-t2">
                        Alamat Email
                      </label>
                      <input
                        id="resend-email"
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-xl text-body-md text-t1 placeholder:text-t3 outline-none border border-k focus:border-[var(--k-volt)] transition-colors bg-input"
                        required
                        autoComplete="email"
                        disabled={isResending || resendCooldown > 0}
                      />
                    </div>
                    <Button
                      variant="volt"
                      size="cta-sm"
                      type="submit"
                      className="w-full"
                      disabled={isResending || resendCooldown > 0}
                    >
                      {isResending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          Mengirim...
                        </>
                      ) : resendCooldown > 0 ? (
                        <>
                          <RefreshCw size={16} aria-hidden="true" />
                          Kirim ulang dalam {resendCooldown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} aria-hidden="true" />
                          Kirim Ulang Email
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              <Link
                to="/"
                className="flex items-center justify-center gap-2 text-label-md text-t2 hover:text-t1 transition-colors"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Kembali ke Beranda
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
