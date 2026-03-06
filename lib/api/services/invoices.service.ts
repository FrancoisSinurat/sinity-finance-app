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
function mapToInvoice(raw: unknown): Invoice {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: Number(o.id) || 0,
    date: String(o.date ?? ""),
    amount: Number(o.amount) ?? 0,
    note: String(o.note ?? ""),
    category: String(o.category ?? (o as Record<string, unknown>).category_name ?? ""),
    type: (o.type === "pemasukkan" || o.type === "pengeluaran" ? o.type : "pemasukkan") as Invoice["type"],
    created_at: o.created_at != null ? String(o.created_at) : undefined,
    updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
  };
}

function normalizeListResponse(res: InvoicesListResponse | unknown): Invoice[] {
  const list = getListFromResponse(res);
  return list.map(mapToInvoice);
}

export const invoicesService = {
  async getAll(query?: InvoicesQuery): Promise<Invoice[]> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.page != null) params.page = query.page;
    if (query?.per_page != null) params.per_page = query.per_page;
    if (query?.type) params.type = query.type;
    if (query?.category) params.category = query.category;
    if (query?.search) params.search = query.search;
    if (query?.sort_by) params.sort_by = query.sort_by;
    if (query?.order) params.order = query.order;

    const res = await api.get<InvoicesListResponse | unknown>(PATH, Object.keys(params).length ? params : undefined);
    return normalizeListResponse(res);
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
