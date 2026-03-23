import { NextRequest, NextResponse } from "next/server";

// Gunakan 127.0.0.1 agar server Next.js (Node) konsisten connect ke backend di mesin yang sama
const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://127.0.0.1:8080";

function getBackendUrl(pathSegments: string[] | undefined, request: NextRequest): string {
  const base = BACKEND.replace(/\/$/, "");
  const path = pathSegments?.length ? `/${pathSegments.join("/")}` : "";
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return `${base}${path}${qs ? `?${qs}` : ""}`;
}

function buildForwardHeaders(request: NextRequest, includeBodyContentType = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;
  if (includeBodyContentType) {
    headers["Content-Type"] = request.headers.get("Content-Type") ?? "application/json";
  }
  return headers;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const url = getBackendUrl(pathSegments, request);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: buildForwardHeaders(request, true),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const isRefused = typeof msg === "string" && (msg.includes("ECONNREFUSED") || msg.includes("fetch failed"));
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: isRefused ? "Backend tidak merespons. Pastikan sinity-finance-backend berjalan di port 8080." : msg,
      },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const url = getBackendUrl(pathSegments, request);
  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "POST",
      headers: buildForwardHeaders(request, true),
      body: body || undefined,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const isRefused = typeof msg === "string" && (msg.includes("ECONNREFUSED") || msg.includes("fetch failed"));
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: isRefused ? "Backend tidak merespons. Pastikan sinity-finance-backend berjalan di port 8080." : msg,
      },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const url = getBackendUrl(pathSegments, request);
  try {
    const body = await request.text();
    const res = await fetch(url, {
      method: "PUT",
      headers: buildForwardHeaders(request, true),
      body: body || undefined,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const isRefused = typeof msg === "string" && (msg.includes("ECONNREFUSED") || msg.includes("fetch failed"));
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: isRefused ? "Backend tidak merespons. Pastikan sinity-finance-backend berjalan di port 8080." : msg,
      },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const url = getBackendUrl(pathSegments, request);
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: buildForwardHeaders(request),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const isRefused = typeof msg === "string" && (msg.includes("ECONNREFUSED") || msg.includes("fetch failed"));
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: isRefused ? "Backend tidak merespons. Pastikan sinity-finance-backend berjalan di port 8080." : msg,
      },
      { status: 502 }
    );
  }
}
