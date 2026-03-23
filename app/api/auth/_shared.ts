import { NextRequest } from "next/server";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parsePathList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => normalizePath(item))
    .filter(Boolean);
}

function resolveAuthBase(): string | null {
  const base =
    process.env.AUTH_API_BASE_URL ??
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;
  return base ? normalizeBaseUrl(base) : null;
}

function candidatePaths(action: "login" | "register"): string[] {
  const fromEnv = action === "login" ? parsePathList(process.env.AUTH_LOGIN_PATHS) : parsePathList(process.env.AUTH_REGISTER_PATHS);
  if (fromEnv.length > 0) return fromEnv;
  return [`/api/v1/auth/${action}`, `/auth/${action}`, `/${action}`];
}

export async function proxyAuth(request: NextRequest, action: "login" | "register"): Promise<Response> {
  const body = await request.text();
  const base = resolveAuthBase();
  if (!base) {
    return Response.json(
      {
        error: "Auth proxy misconfigured",
        message: "Set AUTH_API_BASE_URL atau API_BASE_URL di environment.",
      },
      { status: 500 }
    );
  }

  const errors: string[] = [];

  for (const path of candidatePaths(action)) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": request.headers.get("content-type") ?? "application/json",
        },
        body: body || undefined,
        cache: "no-store",
      });

      const text = await res.text();
      if (res.status === 404) {
        errors.push(`${path}:404`);
        continue;
      }

      return new Response(text, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "application/json",
        },
      });
    } catch (err) {
      errors.push(`${path}:${err instanceof Error ? err.message : "network error"}`);
    }
  }

  return Response.json(
    {
      error: "Auth proxy failed",
      message: `Tidak bisa terhubung ke endpoint auth. Tried: ${errors.join(", ")}`,
    },
    { status: 502 }
  );
}
