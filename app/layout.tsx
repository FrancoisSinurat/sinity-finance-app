import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/AppProviders";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { PwaProvider } from "@/components/PwaProvider";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
        <AppProviders>
          <PwaProvider />
          <ProtectedLayout>{children}</ProtectedLayout>
        </AppProviders>
      </body>
    </html>
  );
}
