import "./globals.css";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";

export const metadata = {
  title: "Sinity Invoice",
  description: "Dashboard keuangan berdua",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="flex bg-pink-100 text-neutral-900 h-screen overflow-hidden">
        {/* Sidebar tetap stay */}
        <AppSidebar />

        {/* Main scrollable */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
