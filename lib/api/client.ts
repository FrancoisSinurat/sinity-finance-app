import { apiConfig } from "./config";

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
};

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = apiConfig.baseUrl.replace(/\/$/, "");
  const pathNorm = path.startsWith("/") ? path : `/${path}`;
  const pathWithQuery = base + pathNorm;

  // Di browser baseUrl bisa relative (/api/proxy) → butuh origin agar URL valid
  const url =
    typeof window !== "undefined" && !base.startsWith("http")
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

export async function apiRequest<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  const url = buildUrl(path, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...apiConfig.headers,
        ...init.headers,
      },
      signal: controller.signal,
    });
    return handleResponse<T>(res);
  } catch (err) {
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
