"use client";

import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { apiConfig } from "@/lib/api/config";

export function AppProviders({ children }: { children: ReactNode }) {
  const clientId = apiConfig.auth.googleClientId;

  if (!clientId) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>{children}</ThemeProvider>
    </GoogleOAuthProvider>
  );
}
