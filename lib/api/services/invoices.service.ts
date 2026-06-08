import { api } from "../client";
import type {
  Invoice,
  InvoiceCreatePayload,
  InvoiceUpdatePayload,
  InvoicesQuery,
  InvoicesListResponse,
  PaginatedResponse,
} from "../types";

const PATH = "/api/v1/invoices";

/** Backend might return array, { data }, { items }, { invoices }, etc. */
function getListFromResponse(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const o = res as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
    if (Array.isArray(o.invoices)) return o.invoices;
    if (Array.isArray(o.result)) return o.result;
  }
  return [];
}

/** Map backend item (snake_case or nested) ke bentuk Invoice. */
function normalizeInvoiceType(rawType: unknown, fallback?: Invoice["type"]): Invoice["type"] {
  if (typeof rawType === "string") {
    const val = rawType.trim().toLowerCase();
    if (val === "pemasukkan" || val === "income") return "pemasukkan";
    if (val === "pengeluaran" || val === "expense") return "pengeluaran";
  }
  if (typeof rawType === "number") {
    // Defensive mapping when backend sends enum-ish number.
    if (rawType === 1) return "pemasukkan";
    if (rawType === 2) return "pengeluaran";
  }
  return fallback ?? "pemasukkan";
}

function mapToInvoice(raw: unknown, fallbackType?: Invoice["type"]): Invoice {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const nestedType =
    ((o.type as Record<string, unknown> | undefined)?.name as unknown) ??
    ((o.type as Record<string, unknown> | undefined)?.type as unknown);
  const typeFromResponse = o.type ?? o.type_name ?? nestedType;

  const rawMenu = o.catering_menu;
  let catering_menu: Invoice["catering_menu"] = null;
  if (rawMenu && typeof rawMenu === "object") {
    const m = rawMenu as Record<string, unknown>;
    const mid = Number(m.id);
    if (mid) {
      catering_menu = { id: mid, name: String(m.name ?? "") };
    }
  }

  return {
    id: Number(o.id) || 0,
    date: String(o.date ?? ""),
    amount: Number(o.amount) ?? 0,
    note: String(o.note ?? ""),
    category: String(o.category ?? (o as Record<string, unknown>).category_name ?? ""),
    type: normalizeInvoiceType(typeFromResponse, fallbackType),
    target_id: o.target_id != null ? String(o.target_id) : null,
    account_id: o.account_id != null ? Number(o.account_id) : null,
    catering_menu_id: o.catering_menu_id != null ? Number(o.catering_menu_id) : null,
    catering_quantity: o.catering_quantity != null ? Number(o.catering_quantity) : null,
    catering_menu,
    created_at: o.created_at != null ? String(o.created_at) : undefined,
    updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
  };
}

function normalizeListResponse(res: InvoicesListResponse | unknown, fallbackType?: Invoice["type"]): Invoice[] {
  const list = getListFromResponse(res);
  return list.map((item) => mapToInvoice(item, fallbackType));
}

export const invoicesService = {
  async getAll(query?: InvoicesQuery): Promise<Invoice[]> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.page != null) params.page = query.page;
    params.per_page = query?.per_page ?? 1000;
    if (query?.type) params.type = query.type;
    if (query?.category) params.category = query.category;
    if (query?.search) params.search = query.search;
    if (query?.sort_by) params.sort_by = query.sort_by;
    if (query?.order) params.order = query.order;

    const res = await api.get<InvoicesListResponse | unknown>(PATH, Object.keys(params).length ? params : undefined);
    return normalizeListResponse(res, query?.type);
  },

  async getById(id: number): Promise<Invoice> {
    const res = await api.get<unknown>(`${PATH}/${id}`);
    return mapToInvoice(res);
  },

  async create(payload: InvoiceCreatePayload): Promise<Invoice> {
    const res = await api.post<unknown>(PATH, payload);
    return mapToInvoice(res);
  },

  async update(id: number, payload: InvoiceUpdatePayload): Promise<Invoice> {
    const res = await api.put<unknown>(`${PATH}/${id}`, payload);
    return mapToInvoice(res);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${PATH}/${id}`);
  },
};
