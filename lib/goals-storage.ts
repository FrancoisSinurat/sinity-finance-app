"use client";

export type SavingsTarget = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  timelineType?: "date" | "term";
  deadline?: string;
  termValue?: number;
  termUnit?: "week" | "month" | "year";
  note?: string;
  createdAt: string;
};

export type WishlistPriority = "low" | "medium" | "high";
export type WishlistStatus = "planning" | "saving" | "ready" | "bought";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  priority: WishlistPriority;
  status: WishlistStatus;
  note?: string;
  targetId?: string;
  createdAt: string;
};

const TARGETS_KEY = "sinity_savings_targets_v1";
const WISHLIST_KEY = "sinity_wishlist_items_v1";

function safeRead<T>(key: string, guard: (value: unknown) => value is T[]): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return guard(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isSavingsTargetArray(value: unknown): value is SavingsTarget[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string");
}

function isWishlistArray(value: unknown): value is WishlistItem[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string");
}

export function getSavingsTargets(): SavingsTarget[] {
  return safeRead<SavingsTarget>(TARGETS_KEY, isSavingsTargetArray).sort((a, b) => a.name.localeCompare(b.name));
}

export function saveSavingsTargets(items: SavingsTarget[]): void {
  safeWrite(TARGETS_KEY, items);
}

export function getWishlistItems(): WishlistItem[] {
  return safeRead<WishlistItem>(WISHLIST_KEY, isWishlistArray).sort((a, b) => a.name.localeCompare(b.name));
}

export function saveWishlistItems(items: WishlistItem[]): void {
  safeWrite(WISHLIST_KEY, items);
}

export function computeTargetProgress(target: SavingsTarget, savedAmountOverride?: number): number {
  if (target.targetAmount <= 0) return 0;
  const savedAmount = savedAmountOverride ?? target.savedAmount;
  return Math.min((savedAmount / target.targetAmount) * 100, 100);
}

export function createLocalId(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${random}`;
}
