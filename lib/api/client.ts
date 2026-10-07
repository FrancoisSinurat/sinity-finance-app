import { apiConfig } from "./config";
import { getToken, logout } from "@/lib/auth";
import {
  enableMockMode,
  handleMockRequest,
  isAuthApiPath,
  isMockModeEnabled,
  isMockOnBackendErrorEnabled,
} from "./mock-mode";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestConfig = RequestInit & {
  params?: Record<string, string | number | undefined>;
  absolutePath?: boolean;
};

function buildUrl(path: string, params?: Record<string, string | number | undefined>, absolutePath = false): string {
  const isHttpPath = /^https?:\/\//i.test(path);
  const pathNorm = isHttpPath || path.startsWith("/") ? path : `/${path}`;
  const pathWithQuery = absolutePath || isHttpPath ? pathNorm : apiConfig.baseUrl.replace(/\/$/, "") + pathNorm;

  // Di browser, URL relative perlu origin agar valid.
  const isHttpUrl = /^https?:\/\//i.test(pathWithQuery);
  const url =
    typeof window !== "undefined" && !isHttpUrl
      ? new URL(pathWithQuery, window.location.origin)
      : new URL(pathWithQuery);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function pathForMock(path: string, params?: Record<string, string | number | undefined>, absolutePath = false): string {
  const url = buildUrl(path, params, absolutePath);
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return path;
  }
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (body == null || body === "") return undefined;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }
  return undefined;
}

function isUnreachableError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return err.status === 0 || err.status === 408 || err.status >= 500;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: T | undefined;

  try {
    data = text ? (JSON.parse(text) as T) : undefined;
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

async function runMock<T>(method: string, mockPath: string, body?: unknown): Promise<T> {
  try {
    return await handleMockRequest<T>(method, mockPath, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mock request failed";
    throw new ApiError(message, 503);
  }
}

export async function apiRequest<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, absolutePath, ...init } = config;
  const method = (init.method || "GET").toUpperCase();
  const mockPath = pathForMock(path, params, absolutePath);
  const requestBody = parseRequestBody(init.body);
  const skipMock = isAuthApiPath(path) || isAuthApiPath(mockPath);

  if (!skipMock && isMockModeEnabled()) {
    return runMock<T>(method, mockPath, requestBody);
  }

  const url = buildUrl(path, params, absolutePath);
  const token = typeof window !== "undefined" ? getToken() : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...apiConfig.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });
    const data = await handleResponse<T>(res);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && typeof window !== "undefined") {
      logout();
    }

    if (!skipMock && isMockOnBackendErrorEnabled() && isUnreachableError(err)) {
      enableMockMode();
      return runMock<T>(method, mockPath, requestBody);
    }

    // Network/timeout before ApiError wrap
    if (!(err instanceof ApiError) && !skipMock && isMockOnBackendErrorEnabled()) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork = err instanceof TypeError || (err instanceof Error && /fetch|network|failed/i.test(err.message));
      if (isAbort || isNetwork) {
        enableMockMode();
        return runMock<T>(method, mockPath, requestBody);
      }
    }

    if (err instanceof ApiError) throw err;
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }
      throw new ApiError(err.message, 0);
    }
    throw new ApiError("Network error", 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
