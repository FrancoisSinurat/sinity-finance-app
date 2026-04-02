"use client";

import { useEffect } from "react";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]";
    const shouldRegister = process.env.NODE_ENV === "production" && !isLocalhost;

    const syncRegistration = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        if (!shouldRegister) {
          await Promise.all(registrations.map((registration) => registration.unregister()));
          return;
        }

        const hasAppWorker = registrations.some((registration) => registration.active?.scriptURL.endsWith("/sw.js"));
        if (!hasAppWorker) {
          await navigator.serviceWorker.register("/sw.js");
        }
      } catch (error) {
        console.error("Service worker setup failed:", error);
      }
    };

    void syncRegistration();
  }, []);

  return null;
}
