/**
 * API domain types (align with backend).
 */

export type InvoiceType = "pemasukkan" | "pengeluaran";

export interface Invoice {
  id: number;
  date: string;
  amount: number;
  note: string;
  category: string;
  type: InvoiceType;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceCreatePayload {
  date: string;
  amount: number;
  note: string;
  category: string;
  type: InvoiceType;
}

export interface InvoiceUpdatePayload extends Partial<InvoiceCreatePayload> {}

export interface Type {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  type_id: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Query params for GET /invoices */
export interface InvoicesQuery {
  page?: number;
  per_page?: number;
  type?: InvoiceType;
  category?: string;
  search?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}

/** Paginated list response (adjust if backend shape differs) */
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  per_page?: number;
}

/** Backend may return array directly */
export type InvoicesListResponse = Invoice[] | PaginatedResponse<Invoice>;
