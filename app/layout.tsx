import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedLayout } from "@/components/ProtectedLayout";

export const metadata = {
  title: "Sinity Finance",
  description: "Aplikasi catatan keuangan perorangan",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
