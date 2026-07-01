import { apiRequest, ApiError } from "../client";
import { apiConfig } from "../config";
import type { AuthPayload, AuthResponse, GoogleLoginPayload } from "../types";
import { getJakartaTimestamp } from "@/lib/date-time";

const MOCK_USERS_KEY = "auth_mock_users_v1";

function extractToken(res: AuthResponse): string | null {
  return res.token ?? res.access_token ?? res.data?.token ?? res.data?.access_token ?? null;
}

function resolveAuthError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.body && typeof err.body === "object") {
      const body = err.body as Record<string, unknown>;
      const message = body.message ?? body.error;
      if (typeof message === "string" && message.trim()) return message;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function isBackendAuthFailure(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return err.status === 0 || err.status === 408 || err.status >= 500;
}

type MockUser = {
  email: string;
  password: string;
  name?: string;
  createdAt: string;
};

function readMockUsers(): MockUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const obj = item as Record<string, unknown>;
      return typeof obj.email === "string" && typeof obj.password === "string";
    }) as MockUser[];
  } catch {
    return [];
  }
}

function writeMockUsers(users: MockUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function toBase64Url(value: string): string {
  if (typeof window === "undefined") return value;
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createMockToken(payload: { email: string; name?: string }): string {
  const header = { alg: "none", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    sub: payload.email,
    email: payload.email,
    name: payload.name ?? "Mock User",
    iat: now,
    exp: now + 60 * 60 * 24 * 7,
    iss: "sinity-auth-mock",
    mode: "mock",
  };
  return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(body))}.`;
}

function ensureMockEnabled(): void {
  if (!apiConfig.auth.mockOnBackendError) {
    throw new Error("Auth backend tidak tersedia dan mock mode dinonaktifkan.");
  }
}

function loginWithMock(payload: AuthPayload): { token: string; message: string } {
  ensureMockEnabled();
  const users = readMockUsers();
  const existing = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());

  if (existing && existing.password !== payload.password) {
    throw new Error("Mock mode: password tidak cocok untuk akun ini.");
  }

  if (!existing) {
    users.push({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      createdAt: getJakartaTimestamp(),
    });
    writeMockUsers(users);
  }

  return {
    token: createMockToken({ email: payload.email, name: existing?.name ?? payload.name }),
    message: "Backend auth tidak tersedia. Masuk dengan mock mode.",
  };
}

function registerWithMock(payload: AuthPayload): { token: string; message: string } {
  ensureMockEnabled();
  const users = readMockUsers();
  const exists = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error("Mock mode: email sudah terdaftar.");
  }

  users.push({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    createdAt: getJakartaTimestamp(),
  });
  writeMockUsers(users);

  return {
    token: createMockToken({ email: payload.email, name: payload.name }),
    message: "Backend auth tidak tersedia. Register dengan mock mode.",
  };
}

async function postAuth(path: string, payload: AuthPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(path, {
      method: "POST",
      body: JSON.stringify(payload),
      absolutePath: true,
    });
}

async function postGoogleAuth(idToken: string): Promise<AuthResponse> {
  const payload: GoogleLoginPayload = { id_token: idToken };
  return apiRequest<AuthResponse>(apiConfig.auth.googleLoginUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    absolutePath: true,
  });
}

export const authService = {
  async login(payload: AuthPayload): Promise<{ token: string; message?: string }> {
    try {
      const res = await postAuth(apiConfig.auth.loginUrl, payload);
      const token = extractToken(res);
      if (!token) throw new Error(res.error || "Token tidak ditemukan di response login");
      return { token, message: res.message };
    } catch (err) {
      if (isBackendAuthFailure(err)) {
        return loginWithMock(payload);
      }
      throw new Error(resolveAuthError(err, "Auth request gagal"));
    }
  },

  async register(payload: AuthPayload): Promise<{ token: string; message?: string }> {
    try {
      const res = await postAuth(apiConfig.auth.registerUrl, payload);
      const token = extractToken(res);
      if (!token) throw new Error(res.error || "Token tidak ditemukan di response register");
      return { token, message: res.message };
    } catch (err) {
      if (isBackendAuthFailure(err)) {
        return registerWithMock(payload);
      }
      throw new Error(resolveAuthError(err, "Auth request gagal"));
    }
  },

  async googleLogin(idToken: string): Promise<{ token: string; message?: string }> {
    try {
      const res = await postGoogleAuth(idToken);
      const token = extractToken(res);
      if (!token) throw new Error(res.error || "Token tidak ditemukan di response Google login");
      return { token, message: res.message };
    } catch (err) {
      throw new Error(resolveAuthError(err, "Google login gagal"));
    }
  },
};
