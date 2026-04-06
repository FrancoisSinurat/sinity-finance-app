/**
 * API configuration for static export / PWA / Capacitor builds.
 * Browser clients call public backend URLs directly.
 */
const DEFAULT_API_BASE_URL = "https://nondefining-asha-uncheapened.ngrok-free.dev";

const normalizePath = (value: string): string => {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, "");

const joinUrl = (base: string, path: string): string => `${normalizeBaseUrl(base)}${normalizePath(path)}`;

const getBaseUrl = (): string => {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);
};

const getAuthBaseUrl = (): string => {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      DEFAULT_API_BASE_URL
  );
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
    mockOnBackendError: getBooleanEnv(process.env.NEXT_PUBLIC_AUTH_MOCK_ON_BACKEND_ERROR, true),
    loginUrl: joinUrl(getAuthBaseUrl(), process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? "/api/v1/auth/login"),
    registerUrl: joinUrl(getAuthBaseUrl(), process.env.NEXT_PUBLIC_AUTH_REGISTER_PATH ?? "/api/v1/auth/register"),
  },
  chatUrl: process.env.NEXT_PUBLIC_CHAT_API_URL ?? "",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
} as const;
