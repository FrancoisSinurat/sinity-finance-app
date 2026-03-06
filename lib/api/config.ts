/**
 * API configuration.
 * In browser we use same-origin proxy to avoid CORS; server uses direct backend URL.
 */
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
};

export const apiConfig = {
  baseUrl: getBaseUrl(),
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;
