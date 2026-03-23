import { api } from "../client";
import type { SavingsTarget, WishlistItem, WishlistPriority, WishlistStatus } from "@/lib/goals-storage";

const TARGETS_PATH = "/api/v1/goals/targets";
const WISHLIST_PATH = "/api/v1/goals/wishlist";

type TargetPayload = {
  name: string;
  target_amount: number;
  saved_amount: number;
  timeline_type: "date" | "term";
  deadline?: string;
  term_value?: number;
  term_unit?: "week" | "month" | "year";
  note?: string;
};

type WishlistPayload = {
  name: string;
  price: number;
  priority: WishlistPriority;
  status: WishlistStatus;
  target_id?: number;
  note?: string;
};

function mapTarget(raw: unknown): SavingsTarget {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    targetAmount: Number(item.target_amount ?? 0),
    savedAmount: Number(item.saved_amount ?? 0),
    timelineType: item.timeline_type === "date" ? "date" : "term",
    deadline: item.deadline ? String(item.deadline) : undefined,
    termValue: item.term_value != null ? Number(item.term_value) : undefined,
    termUnit:
      item.term_unit === "week" || item.term_unit === "year" || item.term_unit === "month"
        ? item.term_unit
        : undefined,
    note: item.note ? String(item.note) : undefined,
    createdAt: String(item.created_at ?? ""),
  };
}

function mapWishlist(raw: unknown): WishlistItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    price: Number(item.price ?? 0),
    priority: item.priority === "high" || item.priority === "low" ? item.priority : "medium",
    status:
      item.status === "saving" || item.status === "ready" || item.status === "bought"
        ? item.status
        : "planning",
    targetId: item.target_id != null ? String(item.target_id) : undefined,
    note: item.note ? String(item.note) : undefined,
    createdAt: String(item.created_at ?? ""),
  };
}

export const goalsService = {
  async listTargets(): Promise<SavingsTarget[]> {
    const response = await api.get<unknown[]>(TARGETS_PATH);
    return response.map(mapTarget);
  },

  async createTarget(payload: TargetPayload): Promise<SavingsTarget> {
    const response = await api.post<unknown>(TARGETS_PATH, payload);
    return mapTarget(response);
  },

  async updateTarget(id: string, payload: Partial<TargetPayload>): Promise<SavingsTarget> {
    const response = await api.put<unknown>(`${TARGETS_PATH}/${id}`, payload);
    return mapTarget(response);
  },

  async deleteTarget(id: string): Promise<void> {
    await api.delete(`${TARGETS_PATH}/${id}`);
  },

  async listWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<unknown[]>(WISHLIST_PATH);
    return response.map(mapWishlist);
  },

  async createWishlist(payload: WishlistPayload): Promise<WishlistItem> {
    const response = await api.post<unknown>(WISHLIST_PATH, payload);
    return mapWishlist(response);
  },

  async updateWishlist(id: string, payload: Partial<WishlistPayload>): Promise<WishlistItem> {
    const response = await api.put<unknown>(`${WISHLIST_PATH}/${id}`, payload);
    return mapWishlist(response);
  },

  async deleteWishlist(id: string): Promise<void> {
    await api.delete(`${WISHLIST_PATH}/${id}`);
  },
};
