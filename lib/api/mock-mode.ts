import { createDefaultMockStore, type MockStore } from "./mock-data";
import type {
  Account,
  AccountCreatePayload,
  Category,
  Invoice,
  InvoiceCreatePayload,
  ProfileUpdatePayload,
  SettingsUpdatePayload,
  UpsertBudgetPayload,
} from "./types";
import { getTokenPayload } from "@/lib/auth";

const MOCK_FLAG_KEY = "__MOCK_MODE__";
const MOCK_STORE_KEY = "sinity_api_mock_store_v1";
export const MOCK_API_DELAY = 180;

function envFlag(name: string): boolean {
  const value = process.env[name];
  if (value == null) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

/** Force mock via env, or sticky flag after backend unreachable. */
export function isMockModeEnabled(): boolean {
  if (envFlag("NEXT_PUBLIC_ENABLE_MOCK_MODE")) return true;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MOCK_FLAG_KEY) === "true";
}

/** Whether API client should fall back to mock on network/5xx errors. */
export function isMockOnBackendErrorEnabled(): boolean {
  const value =
    process.env.NEXT_PUBLIC_MOCK_ON_BACKEND_ERROR ??
    process.env.NEXT_PUBLIC_AUTH_MOCK_ON_BACKEND_ERROR;
  if (value == null) return true;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function enableMockMode(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MOCK_FLAG_KEY) === "true") return;
  localStorage.setItem(MOCK_FLAG_KEY, "true");
  console.info("[MOCK] Backend unreachable — switching to localStorage mock mode");
}

export function setMockMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) localStorage.setItem(MOCK_FLAG_KEY, "true");
  else localStorage.removeItem(MOCK_FLAG_KEY);
  window.location.reload();
}

export function getMockModeIndicator(): string | null {
  return isMockModeEnabled() ? "MOCK MODE" : null;
}

function safeParseStore(raw: string | null): MockStore | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockStore;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.invoices)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function loadStore(): MockStore {
  if (typeof window === "undefined") return createDefaultMockStore();
  const existing = safeParseStore(localStorage.getItem(MOCK_STORE_KEY));
  if (existing) {
    if (!existing.nextId || existing.nextId < 1) existing.nextId = 100;
    return existing;
  }
  const seeded = createDefaultMockStore();
  localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveStore(store: MockStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(store));
}

function nextId(store: MockStore): number {
  const id = store.nextId++;
  return id;
}

function pathnameOf(path: string): string {
  try {
    if (/^https?:\/\//i.test(path)) return new URL(path).pathname;
  } catch {
    // ignore
  }
  return path.split("?")[0] || path;
}

function queryOf(path: string): URLSearchParams {
  const qIndex = path.indexOf("?");
  if (qIndex >= 0) return new URLSearchParams(path.slice(qIndex + 1));
  try {
    if (/^https?:\/\//i.test(path)) return new URL(path).searchParams;
  } catch {
    // ignore
  }
  return new URLSearchParams();
}

function asObject(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function profileFromToken(store: MockStore) {
  const payload = getTokenPayload();
  if (!payload) return store.profile;
  return {
    ...store.profile,
    email: typeof payload.email === "string" ? payload.email : store.profile.email,
    name: typeof payload.name === "string" ? payload.name : store.profile.name,
  };
}

function handleInvoices(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);
  const query = queryOf(path);
  const idMatch = pathname.match(/^\/api\/v1\/invoices\/(\d+)$/);

  if (method === "GET" && !idMatch) {
    const type = query.get("type");
    let list = [...store.invoices];
    if (type === "pemasukkan" || type === "pengeluaran") {
      list = list.filter((inv) => inv.type === type);
    }
    const category = query.get("category");
    if (category) list = list.filter((inv) => inv.category === category);
    const search = query.get("search")?.toLowerCase();
    if (search) {
      list = list.filter(
        (inv) =>
          inv.note.toLowerCase().includes(search) ||
          inv.category.toLowerCase().includes(search)
      );
    }
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  if (method === "GET" && idMatch) {
    const inv = store.invoices.find((i) => i.id === Number(idMatch[1]));
    if (!inv) throw new Error("Invoice tidak ditemukan");
    return inv;
  }

  if (method === "POST") {
    const payload = body as InvoiceCreatePayload;
    const inv: Invoice = {
      id: nextId(store),
      date: payload.date,
      amount: Number(payload.amount) || 0,
      note: payload.note ?? "",
      category: payload.category ?? "",
      type: payload.type,
      target_id: payload.target_id != null ? String(payload.target_id) : null,
      account_id: payload.account_id ?? null,
      catering_menu_id: payload.catering_menu_id ?? null,
      catering_quantity: payload.catering_quantity ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.invoices.unshift(inv);
    return inv;
  }

  if ((method === "PUT" || method === "PATCH") && idMatch) {
    const id = Number(idMatch[1]);
    const idx = store.invoices.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Invoice tidak ditemukan");
    const payload = asObject(body);
    const prev = store.invoices[idx];
    store.invoices[idx] = {
      ...prev,
      date: payload.date != null ? String(payload.date) : prev.date,
      amount: payload.amount != null ? Number(payload.amount) : prev.amount,
      note: payload.note != null ? String(payload.note) : prev.note,
      category: payload.category != null ? String(payload.category) : prev.category,
      type:
        payload.type === "pemasukkan" || payload.type === "pengeluaran"
          ? payload.type
          : prev.type,
      target_id:
        payload.target_id !== undefined
          ? payload.target_id != null
            ? String(payload.target_id)
            : null
          : prev.target_id,
      account_id:
        payload.account_id !== undefined
          ? payload.account_id != null
            ? Number(payload.account_id)
            : null
          : prev.account_id,
      updated_at: new Date().toISOString(),
    };
    return store.invoices[idx];
  }

  if (method === "DELETE" && idMatch) {
    const id = Number(idMatch[1]);
    store.invoices = store.invoices.filter((i) => i.id !== id);
    return { success: true };
  }

  throw new Error(`Mock invoices: ${method} ${pathname}`);
}

function handleAccounts(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);
  const idMatch = pathname.match(/^\/api\/v1\/accounts\/(\d+)$/);

  if (method === "GET" && !idMatch) return store.accounts;

  if (method === "GET" && idMatch) {
    const account = store.accounts.find((a) => a.id === Number(idMatch[1]));
    if (!account) throw new Error("Account tidak ditemukan");
    return { account, balance: account.balance };
  }

  if (method === "POST") {
    const payload = body as AccountCreatePayload;
    const initial = Number(payload.initial_balance ?? 0);
    const color =
      payload.color === "sky" ||
      payload.color === "indigo" ||
      payload.color === "green" ||
      payload.color === "pink"
        ? payload.color
        : "pink";
    const account: Account = {
      id: nextId(store),
      name: payload.name,
      account_number: payload.account_number ?? "",
      type: payload.type,
      initial_balance: initial,
      balance: initial,
      income: 0,
      expense: 0,
      color,
      created_at: new Date().toISOString(),
    };
    store.accounts.unshift(account);
    return account;
  }

  if ((method === "PUT" || method === "PATCH") && idMatch) {
    const id = Number(idMatch[1]);
    const idx = store.accounts.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error("Account tidak ditemukan");
    const payload = asObject(body);
    const prev = store.accounts[idx];
    const nextInitial =
      payload.initial_balance != null ? Number(payload.initial_balance) : prev.initial_balance;
    store.accounts[idx] = {
      ...prev,
      name: payload.name != null ? String(payload.name) : prev.name,
      account_number:
        payload.account_number != null ? String(payload.account_number) : prev.account_number,
      type:
        payload.type === "cash" ||
        payload.type === "bank" ||
        payload.type === "ewallet" ||
        payload.type === "other"
          ? payload.type
          : prev.type,
      initial_balance: nextInitial,
      balance: prev.balance - prev.initial_balance + nextInitial,
      color:
        payload.color === "sky" ||
        payload.color === "indigo" ||
        payload.color === "green" ||
        payload.color === "pink"
          ? payload.color
          : prev.color,
    };
    return store.accounts[idx];
  }

  if (method === "DELETE" && idMatch) {
    const id = Number(idMatch[1]);
    store.accounts = store.accounts.filter((a) => a.id !== id);
    return { message: "deleted" };
  }

  throw new Error(`Mock accounts: ${method} ${pathname}`);
}

function handleBudgets(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);
  const query = queryOf(path);
  const scope = (query.get("scope") === "weekly" ? "weekly" : "monthly") as "monthly" | "weekly";
  const deleteMatch = pathname.match(/^\/api\/v1\/budgets\/(.+)$/);

  if (method === "GET") {
    return store.budgets.filter((b) => (b.scope ?? "monthly") === scope);
  }

  if (method === "PUT" || method === "POST") {
    const payload = body as UpsertBudgetPayload;
    const itemScope = payload.scope === "weekly" ? "weekly" : "monthly";
    const idx = store.budgets.findIndex(
      (b) => b.category === payload.category && (b.scope ?? "monthly") === itemScope
    );
    const next = {
      id: idx >= 0 ? store.budgets[idx].id : nextId(store),
      category: payload.category,
      limit: Number(payload.limit) || 0,
      scope: itemScope as "monthly" | "weekly",
    };
    if (idx >= 0) store.budgets[idx] = next;
    else store.budgets.push(next);
    return next;
  }

  if (method === "DELETE" && deleteMatch) {
    const category = decodeURIComponent(deleteMatch[1]);
    store.budgets = store.budgets.filter(
      (b) => !(b.category === category && (b.scope ?? "monthly") === scope)
    );
    return { success: true };
  }

  throw new Error(`Mock budgets: ${method} ${pathname}`);
}

function handleCategories(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);
  const query = queryOf(path);
  const idMatch = pathname.match(/^\/api\/v1\/categories\/(\d+)$/);

  if (method === "GET" && !idMatch) {
    const typeId = query.get("type_id");
    if (typeId != null && typeId !== "") {
      return store.categories.filter((c) => c.type_id === Number(typeId));
    }
    return store.categories;
  }

  if (method === "GET" && idMatch) {
    const cat = store.categories.find((c) => c.id === Number(idMatch[1]));
    if (!cat) throw new Error("Category tidak ditemukan");
    return cat;
  }

  if (method === "POST") {
    const payload = asObject(body);
    const cat: Category = {
      id: nextId(store),
      name: String(payload.name ?? ""),
      type_id: payload.type_id != null ? Number(payload.type_id) : null,
      created_at: new Date().toISOString(),
    };
    store.categories.push(cat);
    return cat;
  }

  if ((method === "PUT" || method === "PATCH") && idMatch) {
    const id = Number(idMatch[1]);
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Category tidak ditemukan");
    const payload = asObject(body);
    store.categories[idx] = {
      ...store.categories[idx],
      name: payload.name != null ? String(payload.name) : store.categories[idx].name,
      type_id:
        payload.type_id !== undefined
          ? payload.type_id != null
            ? Number(payload.type_id)
            : null
          : store.categories[idx].type_id,
      updated_at: new Date().toISOString(),
    };
    return store.categories[idx];
  }

  if (method === "DELETE" && idMatch) {
    store.categories = store.categories.filter((c) => c.id !== Number(idMatch[1]));
    return { success: true };
  }

  throw new Error(`Mock categories: ${method} ${pathname}`);
}

function handleTypes(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);
  const idMatch = pathname.match(/^\/api\/v1\/types\/(\d+)$/);

  if (method === "GET" && !idMatch) return store.types;

  if (method === "GET" && idMatch) {
    const t = store.types.find((x) => x.id === Number(idMatch[1]));
    if (!t) throw new Error("Type tidak ditemukan");
    return t;
  }

  if (method === "POST") {
    const payload = asObject(body);
    const t = {
      id: nextId(store),
      name: String(payload.name ?? ""),
      created_at: new Date().toISOString(),
    };
    store.types.push(t);
    return t;
  }

  if ((method === "PUT" || method === "PATCH") && idMatch) {
    const id = Number(idMatch[1]);
    const idx = store.types.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error("Type tidak ditemukan");
    const payload = asObject(body);
    store.types[idx] = {
      ...store.types[idx],
      name: payload.name != null ? String(payload.name) : store.types[idx].name,
      updated_at: new Date().toISOString(),
    };
    return store.types[idx];
  }

  if (method === "DELETE" && idMatch) {
    store.types = store.types.filter((t) => t.id !== Number(idMatch[1]));
    return { success: true };
  }

  throw new Error(`Mock types: ${method} ${pathname}`);
}

function handleGoals(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);

  const targetIdMatch = pathname.match(/^\/api\/v1\/goals\/targets\/([^/]+)$/);
  const wishlistIdMatch = pathname.match(/^\/api\/v1\/goals\/wishlist\/([^/]+)$/);

  if (pathname === "/api/v1/goals/targets") {
    if (method === "GET") return store.targets;
    if (method === "POST") {
      const payload = asObject(body);
      const termUnit =
        payload.term_unit === "week" || payload.term_unit === "year" || payload.term_unit === "month"
          ? payload.term_unit
          : undefined;
      const item: (typeof store.targets)[number] = {
        id: nextId(store),
        name: String(payload.name ?? ""),
        target_amount: Number(payload.target_amount ?? 0),
        saved_amount: Number(payload.saved_amount ?? 0),
        timeline_type: payload.timeline_type === "date" ? "date" : "term",
        deadline: payload.deadline ? String(payload.deadline) : undefined,
        term_value: payload.term_value != null ? Number(payload.term_value) : undefined,
        term_unit: termUnit,
        note: payload.note ? String(payload.note) : undefined,
        created_at: new Date().toISOString(),
      };
      store.targets.unshift(item);
      return item;
    }
  }

  if (targetIdMatch) {
    const id = Number(targetIdMatch[1]);
    const idx = store.targets.findIndex((t) => t.id === id || String(t.id) === targetIdMatch[1]);
    if (method === "PUT" || method === "PATCH") {
      if (idx < 0) throw new Error("Target tidak ditemukan");
      const payload = asObject(body);
      const prev = store.targets[idx];
      store.targets[idx] = {
        ...prev,
        name: payload.name != null ? String(payload.name) : prev.name,
        target_amount:
          payload.target_amount != null ? Number(payload.target_amount) : prev.target_amount,
        saved_amount:
          payload.saved_amount != null ? Number(payload.saved_amount) : prev.saved_amount,
        timeline_type:
          payload.timeline_type === "date" || payload.timeline_type === "term"
            ? payload.timeline_type
            : prev.timeline_type,
        deadline: payload.deadline !== undefined ? String(payload.deadline || "") || undefined : prev.deadline,
        term_value:
          payload.term_value !== undefined
            ? payload.term_value != null
              ? Number(payload.term_value)
              : undefined
            : prev.term_value,
        term_unit:
          payload.term_unit === "week" || payload.term_unit === "year" || payload.term_unit === "month"
            ? payload.term_unit
            : prev.term_unit,
        note: payload.note !== undefined ? String(payload.note || "") || undefined : prev.note,
      };
      return store.targets[idx];
    }
    if (method === "DELETE") {
      store.targets = store.targets.filter((_, i) => i !== idx);
      return { success: true };
    }
  }

  if (pathname === "/api/v1/goals/wishlist") {
    if (method === "GET") return store.wishlist;
    if (method === "POST") {
      const payload = asObject(body);
      const priority =
        payload.priority === "high" || payload.priority === "low" ? payload.priority : ("medium" as const);
      const status =
        payload.status === "saving" || payload.status === "ready" || payload.status === "bought"
          ? payload.status
          : ("planning" as const);
      const item: (typeof store.wishlist)[number] = {
        id: nextId(store),
        name: String(payload.name ?? ""),
        price: Number(payload.price ?? 0),
        priority,
        status,
        target_id: payload.target_id != null ? Number(payload.target_id) : undefined,
        note: payload.note ? String(payload.note) : undefined,
        created_at: new Date().toISOString(),
      };
      store.wishlist.unshift(item);
      return item;
    }
  }

  if (wishlistIdMatch) {
    const idx = store.wishlist.findIndex(
      (t) => t.id === Number(wishlistIdMatch[1]) || String(t.id) === wishlistIdMatch[1]
    );
    if (method === "PUT" || method === "PATCH") {
      if (idx < 0) throw new Error("Wishlist tidak ditemukan");
      const payload = asObject(body);
      const prev = store.wishlist[idx];
      store.wishlist[idx] = {
        ...prev,
        name: payload.name != null ? String(payload.name) : prev.name,
        price: payload.price != null ? Number(payload.price) : prev.price,
        priority:
          payload.priority === "high" || payload.priority === "low" || payload.priority === "medium"
            ? payload.priority
            : prev.priority,
        status:
          payload.status === "saving" ||
          payload.status === "ready" ||
          payload.status === "bought" ||
          payload.status === "planning"
            ? payload.status
            : prev.status,
        target_id:
          payload.target_id !== undefined
            ? payload.target_id != null
              ? Number(payload.target_id)
              : undefined
            : prev.target_id,
        note: payload.note !== undefined ? String(payload.note || "") || undefined : prev.note,
      };
      return store.wishlist[idx];
    }
    if (method === "DELETE") {
      store.wishlist = store.wishlist.filter((_, i) => i !== idx);
      return { success: true };
    }
  }

  throw new Error(`Mock goals: ${method} ${pathname}`);
}

function handleProfile(method: string, path: string, body: unknown, store: MockStore): unknown {
  if (method === "GET") return profileFromToken(store);
  if (method === "PUT" || method === "PATCH") {
    const payload = body as ProfileUpdatePayload;
    store.profile = {
      ...profileFromToken(store),
      ...payload,
      phone: payload.phone ?? store.profile.phone,
      address: payload.address ?? store.profile.address,
      birth_date: payload.birth_date ?? store.profile.birth_date,
      bio: payload.bio ?? store.profile.bio,
    };
    return store.profile;
  }
  throw new Error(`Mock profile: ${method} ${pathnameOf(path)}`);
}

function handleSettings(method: string, path: string, body: unknown, store: MockStore): unknown {
  if (method === "GET") return store.settings;
  if (method === "PUT" || method === "PATCH") {
    const payload = body as SettingsUpdatePayload;
    store.settings = { ...store.settings, ...payload };
    return store.settings;
  }
  throw new Error(`Mock settings: ${method} ${pathnameOf(path)}`);
}

function dispatch(method: string, path: string, body: unknown, store: MockStore): unknown {
  const pathname = pathnameOf(path);

  if (pathname.startsWith("/api/v1/invoices")) return handleInvoices(method, path, body, store);
  if (pathname.startsWith("/api/v1/accounts")) return handleAccounts(method, path, body, store);
  if (pathname.startsWith("/api/v1/budgets")) return handleBudgets(method, path, body, store);
  if (pathname.startsWith("/api/v1/categories")) return handleCategories(method, path, body, store);
  if (pathname.startsWith("/api/v1/types")) return handleTypes(method, path, body, store);
  if (pathname.startsWith("/api/v1/goals")) return handleGoals(method, path, body, store);
  if (pathname.startsWith("/api/v1/profile")) return handleProfile(method, path, body, store);
  if (pathname.startsWith("/api/v1/settings")) return handleSettings(method, path, body, store);

  // Soft-empty for removed/optional features
  if (pathname.startsWith("/api/v1/catering")) {
    if (method === "GET") return [];
    throw new Error("Catering tidak tersedia di mock mode");
  }

  throw new Error(`Mock handler not found for ${method} ${pathname}`);
}

export async function handleMockRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
  const store = loadStore();
  try {
    const result = dispatch(method.toUpperCase(), path, body, store);
    saveStore(store);
    return result as T;
  } catch (err) {
    saveStore(store);
    throw err;
  }
}

export function isAuthApiPath(path: string): boolean {
  const pathname = pathnameOf(path);
  return pathname.includes("/auth/");
}
