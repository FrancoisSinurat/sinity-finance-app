"use client";

import { getJakartaTimestamp } from "@/lib/date-time";

export type BudgetAlertLevel = "near" | "over";

export type BudgetAlert = {
  id: string;
  monthKey: string;
  category: string;
  spent: number;
  limit: number;
  progress: number;
  level: BudgetAlertLevel;
  dismissed: boolean;
  createdAt: string;
};

type BudgetProgressRow = {
  category: string;
  spent: number;
  limit: number;
  progress: number;
};

const KEY = "budget_alerts_v1";

function makeId(monthKey: string, category: string, level: BudgetAlertLevel): string {
  return `${monthKey}:${category}:${level}`;
}

function readAlerts(): BudgetAlert[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BudgetAlert[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.monthKey === "string" &&
        typeof item.category === "string" &&
        typeof item.spent === "number" &&
        typeof item.limit === "number" &&
        typeof item.progress === "number" &&
        (item.level === "near" || item.level === "over")
    );
  } catch {
    return [];
  }
}

function saveAlerts(items: BudgetAlert[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

function levelForProgress(progress: number): BudgetAlertLevel | null {
  if (progress >= 100) return "over";
  if (progress >= 80) return "near";
  return null;
}

export function syncBudgetAlerts(monthKey: string, rows: BudgetProgressRow[]): BudgetAlert[] {
  const existing = readAlerts();
  const map = new Map(existing.map((item) => [item.id, item]));
  const now = getJakartaTimestamp();

  rows.forEach((row) => {
    const level = levelForProgress(row.progress);
    if (!level) return;
    const id = makeId(monthKey, row.category, level);
    const prev = map.get(id);
    if (prev) {
      map.set(id, { ...prev, spent: row.spent, limit: row.limit, progress: row.progress });
      return;
    }
    map.set(id, {
      id,
      monthKey,
      category: row.category,
      spent: row.spent,
      limit: row.limit,
      progress: row.progress,
      level,
      dismissed: false,
      createdAt: now,
    });
  });

  const pruned = Array.from(map.values()).filter((item) => {
    const yearMonth = item.monthKey.slice(0, 7);
    const currentYearMonth = monthKey.slice(0, 7);
    return item.monthKey === monthKey || yearMonth >= currentYearMonth;
  });

  saveAlerts(pruned);

  const active = pruned
    .filter((item) => item.monthKey === monthKey && !item.dismissed)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level === "over" ? -1 : 1;
      return b.progress - a.progress;
    });

  const byCategory = new Map<string, BudgetAlert>();
  active.forEach((item) => {
    const prev = byCategory.get(item.category);
    if (!prev) {
      byCategory.set(item.category, item);
      return;
    }
    if (prev.level === "near" && item.level === "over") {
      byCategory.set(item.category, item);
      return;
    }
    if (prev.level === item.level && item.progress > prev.progress) {
      byCategory.set(item.category, item);
    }
  });

  return Array.from(byCategory.values()).sort((a, b) => {
    if (a.level !== b.level) return a.level === "over" ? -1 : 1;
    return b.progress - a.progress;
  });
}

export function dismissBudgetAlert(id: string): BudgetAlert[] {
  const next = readAlerts().map((item) => (item.id === id ? { ...item, dismissed: true } : item));
  saveAlerts(next);
  return next.filter((item) => !item.dismissed);
}
