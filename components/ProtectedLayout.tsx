"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

const publicRoutes = ["/login", "/register"];

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { colorTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const auth = isAuthenticated();
    const normalizedPath = normalizePathname(pathname);
    const isPublicRoute = publicRoutes.includes(normalizedPath);

    if (!auth && !isPublicRoute) {
      router.replace("/login");
    } else if (auth && isPublicRoute) {
      router.replace("/dashboard");
    }
  }, [pathname, mounted, router]);

  if (!mounted) {
    // Use neutral color during loading to avoid hydration mismatch
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 dark:border-slate-600"></div>
      </div>
    );
  }

  const auth = isAuthenticated();
  const normalizedPath = normalizePathname(pathname);
  const isPublicRoute = publicRoutes.includes(normalizedPath);

  // Public routes (login, register) - no sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - with sidebar
  if (!auth) {
    return null; // Will redirect to login
  }
  
  return (
    <div className={cn(
      "flex bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 text-neutral-900 dark:text-neutral-100 h-screen overflow-hidden transition-colors duration-300",
      colorTheme === "pink" && "from-pink-50 via-pink-50 to-pink-50",
      colorTheme === "sky" && "from-sky-50 via-sky-50 to-sky-50",
      colorTheme === "indigo" && "from-indigo-50 via-indigo-50 to-indigo-50",
      colorTheme === "green" && "from-green-50 via-green-50 to-green-50",
    )}>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <FloatingAssistant />
    </div>
  );
}

