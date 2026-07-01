/**
 * API domain types (align with backend).
 */

export type InvoiceType = "pemasukkan" | "pengeluaran";

/** Ringkas menu catering dari API pemasukkan (jika ada relasi). */
export interface InvoiceCateringMenuRef {
  id: number;
  name: string;
}

export interface Invoice {
  id: number;
  date: string;
  amount: number;
  note: string;
  category: string;
  type: InvoiceType;
  target_id?: string | null;
  account_id?: number | null;
  created_at?: string;
  updated_at?: string;
  /** Relasi ke master menu catering (opsional; backend sinity-finance-backend). */
  catering_menu_id?: number | null;
  catering_quantity?: number | null;
  catering_menu?: InvoiceCateringMenuRef | null;
}

export interface InvoiceCreatePayload {
  date: string;
  amount: number;
  note: string;
  category: string;
  type: InvoiceType;
  target_id?: number;
  account_id?: number;
  catering_menu_id?: number;
  catering_quantity?: number;
}

export interface InvoiceUpdatePayload extends Partial<InvoiceCreatePayload> {}

export interface Type {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type AccountType = "cash" | "bank" | "ewallet" | "other";

export interface Account {
  id: number;
  name: string;
  account_number?: string;
  type: AccountType;
  initial_balance: number;
  balance: number;
  income: number;
  expense: number;
  color: "pink" | "sky" | "indigo" | "green";
  created_at?: string;
}

export interface AccountCreatePayload {
  name: string;
  account_number?: string;
  type: AccountType;
  initial_balance?: number;
  color?: string;
}

export interface AccountUpdatePayload extends Partial<AccountCreatePayload> {}

export interface Category {
  id: number;
  name: string;
  type_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export interface GoogleLoginPayload {
  id_token: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    access_token?: string;
  };
  message?: string;
  error?: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  birth_date?: string | null;
  bio?: string | null;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  bio?: string;
}

export interface Settings {
  theme: "light" | "dark";
  color_theme: "pink" | "sky" | "indigo" | "green";
  notify_email: boolean;
  notify_push: boolean;
  notify_sms: boolean;
  profile_visibility: "public" | "friends" | "private";
  data_sharing: boolean;
}

export interface SettingsUpdatePayload {
  theme?: "light" | "dark";
  color_theme?: "pink" | "sky" | "indigo" | "green";
  notify_email?: boolean;
  notify_push?: boolean;
  notify_sms?: boolean;
  profile_visibility?: "public" | "friends" | "private";
  data_sharing?: boolean;
}

export interface CategoryBudget {
  id?: number;
  category: string;
  limit: number;
  scope?: "monthly" | "weekly";
}

export interface UpsertBudgetPayload {
  category: string;
  limit: number;
  scope?: "monthly" | "weekly";
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
