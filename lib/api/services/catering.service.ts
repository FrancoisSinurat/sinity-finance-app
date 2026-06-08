import { api, ApiError } from "../client";

const MENUS = "/api/v1/catering/menus";
const DAILY = "/api/v1/catering/daily-sales";

export interface CateringMenu {
  id: number;
  name: string;
  default_price: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CateringMenuCreatePayload {
  name: string;
  default_price?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface CateringMenuUpdatePayload extends Partial<CateringMenuCreatePayload> {}

export interface CateringDailyLine {
  id?: number;
  menu_id: number;
  menu_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CateringDailySales {
  date: string;
  total_amount: number;
  paid_amount: number;
  is_paid: boolean;
  lines: CateringDailyLine[];
}

function getArray<T>(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const o = res as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
    if (Array.isArray(o.menus)) return o.menus;
    if (Array.isArray(o.lines)) return o.lines;
  }
  return [];
}

function mapMenu(raw: unknown): CateringMenu {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: Number(o.id) || 0,
    name: String(o.name ?? ""),
    default_price: Number(o.default_price ?? o.price ?? 0) || 0,
    sort_order: o.sort_order != null ? Number(o.sort_order) : undefined,
    is_active: o.is_active != null ? Boolean(o.is_active) : true,
    created_at: o.created_at != null ? String(o.created_at) : undefined,
    updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
  };
}

function mapLine(raw: unknown): CateringDailyLine {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const qty = Number(o.qty ?? o.quantity ?? 1) || 0;
  const unit = Number(o.unit_price ?? o.price ?? 0) || 0;
  const sub = o.subtotal != null ? Number(o.subtotal) : qty * unit;
  return {
    id: o.id != null ? Number(o.id) : undefined,
    menu_id: Number(o.catering_menu_id ?? o.menu_id) || 0,
    menu_name: o.menu_name_snapshot != null ? String(o.menu_name_snapshot) : undefined,
    quantity: qty,
    unit_price: unit,
    subtotal: sub,
  };
}

function mapDaily(raw: unknown): CateringDailySales {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const linesRaw = getArray(o.lines ?? o.items);
  const lines = linesRaw.map(mapLine);
  const total =
    o.total_amount != null
      ? Number(o.total_amount)
      : lines.reduce((s, l) => s + l.subtotal, 0);
  return {
    date: String(o.date ?? ""),
    total_amount: total,
    paid_amount: Number(o.paid_amount ?? 0),
    is_paid: Boolean(o.is_paid),
    lines,
  };
}

export const cateringService = {
  async listMenus(): Promise<CateringMenu[]> {
    const res = await api.get<unknown>(MENUS);
    return getArray(res).map(mapMenu);
  },

  async createMenu(payload: CateringMenuCreatePayload): Promise<CateringMenu> {
    const res = await api.post<unknown>(MENUS, payload);
    return mapMenu(res);
  },

  async updateMenu(id: number, payload: CateringMenuUpdatePayload): Promise<CateringMenu> {
    const res = await api.put<unknown>(`${MENUS}/${id}`, payload);
    return mapMenu(res);
  },

  async deleteMenu(id: number): Promise<void> {
    await api.delete(`${MENUS}/${id}`);
  },

  async getDailySales(date: string): Promise<CateringDailySales> {
    const res = await api.get<unknown>(`${DAILY}/${encodeURIComponent(date)}`);
    return mapDaily(res);
  },

  async upsertDailySales(
    date: string,
    body: {
      lines: {
        catering_menu_id?: number;
        menu_name_snapshot?: string;
        qty: number;
        unit_price: number;
        subtotal: number;
      }[];
      note?: string;
    }
  ): Promise<CateringDailySales> {
    const res = await api.put<unknown>(`${DAILY}/${encodeURIComponent(date)}`, body);
    return mapDaily(res);
  },

  async listDailySalesRange(from: string, to: string): Promise<CateringDailySales[]> {
    const res = await api.get<unknown>(DAILY, { from, to });
    return getArray(res).map(mapDaily);
  },
};

export function isCateringApiMissingError(e: unknown): boolean {
  return e instanceof ApiError && e.status === 404;
}
