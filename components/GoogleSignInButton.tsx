"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { apiConfig } from "@/lib/api/config";
import { withBasePath } from "@/lib/paths";

type GoogleSignInButtonProps = {
  disabled?: boolean;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
};

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const colorThemeHover: Record<string, string> = {
  pink: "group-hover:border-pink-300 group-hover:bg-pink-50/70 dark:group-hover:bg-pink-950/25",
  sky: "group-hover:border-sky-300 group-hover:bg-sky-50/70 dark:group-hover:bg-sky-950/25",
  indigo: "group-hover:border-indigo-300 group-hover:bg-indigo-50/70 dark:group-hover:bg-indigo-950/25",
  green: "group-hover:border-green-300 group-hover:bg-green-50/70 dark:group-hover:bg-green-950/25",
};

export function GoogleSignInButton({ disabled, setLoading, setMessage }: GoogleSignInButtonProps) {
  const { theme, colorTheme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = disabled || submitting;

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const updateWidth = () => setButtonWidth(Math.max(element.offsetWidth, 240));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleSuccess = useCallback(
    async (credentialResponse: { credential?: string }) => {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        setMessage("Token Google tidak ditemukan");
        return;
      }

      setSubmitting(true);
      setLoading(true);
      setMessage("");

      try {
        const result = await authService.googleLogin(idToken);
        setToken(result.token);
        setMessage(result.message ?? "Login Google berhasil.");
        setTimeout(() => {
          window.location.href = withBasePath("/dashboard");
        }, 400);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Gagal login dengan Google");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
    [setLoading, setMessage]
  );

  if (!apiConfig.auth.googleClientId) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("group relative w-full min-h-[52px]", isDisabled && "pointer-events-none opacity-50")}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex h-full min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3.5",
          "text-base font-semibold shadow-sm transition-all duration-300",
          "bg-neutral-50 dark:bg-slate-800/50",
          "border-neutral-200 dark:border-slate-600",
          "text-neutral-700 dark:text-neutral-200",
          "group-hover:shadow-md group-active:scale-[0.98]",
          colorThemeHover[colorTheme]
        )}
      >
        {submitting ? (
          <span className="w-5 h-5 border-2 border-neutral-400 dark:border-neutral-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <GoogleLogo className="w-5 h-5 shrink-0" />
        )}
        <span>{submitting ? "Memproses..." : "Lanjutkan dengan Google"}</span>
      </div>

      {/* GIS button — transparan di atas custom UI agar flow credential tetap valid */}
      <div
        className="absolute inset-0 z-10 overflow-hidden opacity-[0.01] cursor-pointer"
        role="button"
        aria-label="Lanjutkan dengan Google"
        tabIndex={isDisabled ? -1 : 0}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setMessage("Gagal login dengan Google")}
          theme={theme === "dark" ? "filled_black" : "outline"}
          size="large"
          text="continue_with"
          width={buttonWidth}
          locale="id"
          containerProps={{
            style: {
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "stretch",
            },
          }}
        />
      </div>
    </div>
  );
}
