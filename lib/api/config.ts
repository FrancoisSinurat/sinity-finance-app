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

const normalizePath = (value: string): string => {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const getAuthProxyBase = (): string => {
  const configured = process.env.NEXT_PUBLIC_AUTH_PROXY_BASE ?? "/api/auth";
  return normalizePath(configured);
};

const getBooleanEnv = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value == null) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
};

export const apiConfig = {
  baseUrl: getBaseUrl(),
  auth: {
    proxyBase: getAuthProxyBase(),
    mockOnBackendError: getBooleanEnv(process.env.NEXT_PUBLIC_AUTH_MOCK_ON_BACKEND_ERROR, true),
    get loginPath() {
      return `${this.proxyBase}/login`;
    },
    get registerPath() {
      return `${this.proxyBase}/register`;
    },
  },
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;
