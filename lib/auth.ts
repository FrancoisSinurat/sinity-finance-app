"use client";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  return !!token;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/login";
}

