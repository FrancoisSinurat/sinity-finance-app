import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { PwaProvider } from "@/components/PwaProvider";

const appBasePath = "/sinify";

export const metadata: Metadata = {
  title: "Sinity Finance",
  description: "Aplikasi catatan keuangan perorangan",
  manifest: `${appBasePath}/manifest.webmanifest`,
  applicationName: "Sinity Finance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sinity Finance",
  },
  icons: {
    icon: [
      { url: `${appBasePath}/favicon.ico` },
      { url: `${appBasePath}/icon-192.svg`, type: "image/svg+xml" },
      { url: `${appBasePath}/icon-512.svg`, type: "image/svg+xml" },
    ],
    apple: [{ url: `${appBasePath}/apple-touch-icon.svg`, type: "image/svg+xml" }],
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
