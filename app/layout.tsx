import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { PwaProvider } from "@/components/PwaProvider";

export const metadata: Metadata = {
  title: "Sinity Finance",
  description: "Aplikasi catatan keuangan perorangan",
  manifest: "/manifest.webmanifest",
  applicationName: "Sinity Finance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sinity Finance",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.svg", type: "image/svg+xml" },
      { url: "/icon-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <PwaProvider />
          <ProtectedLayout>{children}</ProtectedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
