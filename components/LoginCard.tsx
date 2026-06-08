"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { theme, toggleTheme, colorTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await authService.login(formData);
      setToken(result.token);
      setMessage(result.message ?? "Login berhasil.");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300",
      "lg:px-4 lg:py-8",
      colorTheme === "pink" && "bg-gradient-to-b from-pink-50/80 via-white to-pink-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
      colorTheme === "sky" && "bg-gradient-to-b from-sky-50/80 via-white to-sky-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
      colorTheme === "indigo" && "bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
      colorTheme === "green" && "bg-gradient-to-b from-green-50/80 via-white to-green-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950",
    )}>
      {/* Decorative blobs - mobile only, soft & cute */}
      <div className="absolute inset-0 pointer-events-none lg:hidden overflow-hidden">
        <div className={cn(
          "absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl",
          colorTheme === "pink" && "bg-pink-400 dark:bg-pink-500",
          colorTheme === "sky" && "bg-sky-400 dark:bg-sky-500",
          colorTheme === "indigo" && "bg-indigo-400 dark:bg-indigo-500",
          colorTheme === "green" && "bg-green-400 dark:bg-green-500",
        )} />
        <div className={cn(
          "absolute -bottom-24 -left-16 w-56 h-56 rounded-full opacity-15 blur-3xl",
          colorTheme === "pink" && "bg-pink-300 dark:bg-pink-600",
          colorTheme === "sky" && "bg-sky-300 dark:bg-sky-600",
          colorTheme === "indigo" && "bg-indigo-300 dark:bg-indigo-600",
          colorTheme === "green" && "bg-green-300 dark:bg-green-600",
        )} />
      </div>

      {/* Theme Toggle - minimal & cute */}
      <button
        onClick={toggleTheme}
        className={cn(
          "fixed top-4 right-4 lg:top-6 lg:right-6 p-2.5 rounded-2xl lg:rounded-full z-20 transition-all duration-300",
          "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm hover:scale-105 active:scale-95",
          colorTheme === "pink" && "border border-pink-200/50 dark:border-pink-900/30",
          colorTheme === "sky" && "border border-sky-200/50 dark:border-sky-900/30",
          colorTheme === "indigo" && "border border-indigo-200/50 dark:border-indigo-900/30",
          colorTheme === "green" && "border border-green-200/50 dark:border-green-900/30",
        )}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className={cn(
            "w-5 h-5",
            colorTheme === "pink" && "text-pink-500",
            colorTheme === "sky" && "text-sky-500",
            colorTheme === "indigo" && "text-indigo-500",
            colorTheme === "green" && "text-green-500",
          )} />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        )}
      </button>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 py-6 sm:py-8 lg:py-0 relative z-10">
        {/* Left - Desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col items-center lg:items-start justify-center space-y-6"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <Logo size="lg" showUpload={true} />
          </motion.div>
          <div className="space-y-4">
            <h1 className={cn(
              "text-4xl md:text-5xl font-bold bg-clip-text text-transparent dark:from-slate-300 dark:to-slate-300",
              colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-500",
              colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-500",
              colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-500",
              colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-500",
            )}>
              Sinity Finance
            </h1>
            
          </div>
        </motion.div>

        {/* Right - Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md mx-auto lg:max-w-lg"
        >
          {/* Mobile header - compact & cute */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="flex items-center gap-3 mb-2"
            >
              <Logo size="sm" showUpload={true} />
              <h1 className={cn(
                "text-xl font-bold tracking-tight",
                colorTheme === "pink" && "text-pink-600 dark:text-pink-400",
                colorTheme === "sky" && "text-sky-600 dark:text-sky-400",
                colorTheme === "indigo" && "text-indigo-600 dark:text-indigo-400",
                colorTheme === "green" && "text-green-600 dark:text-green-400",
              )}>
                Sinity Finance
              </h1>
            </motion.div>
          </div>

          {/* Card - soft, rounded, modern */}
          <div className={cn(
            "rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-all duration-300",
            "lg:rounded-3xl lg:shadow-2xl",
            "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/50",
            colorTheme === "pink" && "lg:border-pink-100 dark:lg:border-pink-900/30",
            colorTheme === "sky" && "lg:border-sky-100 dark:lg:border-sky-900/30",
            colorTheme === "indigo" && "lg:border-indigo-100 dark:lg:border-indigo-900/30",
            colorTheme === "green" && "lg:border-green-100 dark:lg:border-green-900/30",
          )}>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                Welcome back 👋
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Masuk untuk lanjut kelola keuangan
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70",
                    colorTheme === "pink" && "text-pink-500 dark:text-pink-400",
                    colorTheme === "sky" && "text-sky-500 dark:text-sky-400",
                    colorTheme === "indigo" && "text-indigo-500 dark:text-indigo-400",
                    colorTheme === "green" && "text-green-500 dark:text-green-400",
                  )} />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={cn(
                      "w-full rounded-2xl border pl-12 pr-4 py-3.5 text-base bg-neutral-50 dark:bg-slate-800/50",
                      "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all",
                      colorTheme === "pink" && "border-neutral-200 dark:border-slate-600 focus:ring-pink-400 focus:border-pink-300",
                      colorTheme === "sky" && "border-neutral-200 dark:border-slate-600 focus:ring-sky-400 focus:border-sky-300",
                      colorTheme === "indigo" && "border-neutral-200 dark:border-slate-600 focus:ring-indigo-400 focus:border-indigo-300",
                      colorTheme === "green" && "border-neutral-200 dark:border-slate-600 focus:ring-green-400 focus:border-green-300",
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70",
                    colorTheme === "pink" && "text-pink-500 dark:text-pink-400",
                    colorTheme === "sky" && "text-sky-500 dark:text-sky-400",
                    colorTheme === "indigo" && "text-indigo-500 dark:text-indigo-400",
                    colorTheme === "green" && "text-green-500 dark:text-green-400",
                  )} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={cn(
                      "w-full rounded-2xl border pl-12 pr-4 py-3.5 text-base bg-neutral-50 dark:bg-slate-800/50",
                      "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all",
                      colorTheme === "pink" && "border-neutral-200 dark:border-slate-600 focus:ring-pink-400 focus:border-pink-300",
                      colorTheme === "sky" && "border-neutral-200 dark:border-slate-600 focus:ring-sky-400 focus:border-sky-300",
                      colorTheme === "indigo" && "border-neutral-200 dark:border-slate-600 focus:ring-indigo-400 focus:border-indigo-300",
                      colorTheme === "green" && "border-neutral-200 dark:border-slate-600 focus:ring-green-400 focus:border-green-300",
                    )}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full rounded-2xl py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98]",
                  colorTheme === "pink" && "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white",
                  colorTheme === "sky" && "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white",
                  colorTheme === "indigo" && "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white",
                  colorTheme === "green" && "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white",
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-4 p-3 rounded-2xl text-sm text-center",
                  message.toLowerCase().includes("berhasil")
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
                )}
              >
                {message}
              </motion.div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className={cn(
                    "font-semibold transition-colors underline-offset-2 hover:underline",
                    colorTheme === "pink" && "text-pink-500 hover:text-pink-600 dark:text-pink-400",
                    colorTheme === "sky" && "text-sky-500 hover:text-sky-600 dark:text-sky-400",
                    colorTheme === "indigo" && "text-indigo-500 hover:text-indigo-600 dark:text-indigo-400",
                    colorTheme === "green" && "text-green-500 hover:text-green-600 dark:text-green-400",
                  )}
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
