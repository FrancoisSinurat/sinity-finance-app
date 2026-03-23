"use client";

export type CategoryBudget = {
  category: string;
  limit: number;
};

export type BudgetScope = "monthly" | "weekly";

const LEGACY_KEY = "category_budgets_v1";

function getStorageKey(scope: BudgetScope): string {
  return scope === "weekly" ? "category_budgets_weekly_v1" : "category_budgets_monthly_v1";
}

export function getCategoryBudgets(scope: BudgetScope = "monthly"): CategoryBudget[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getStorageKey(scope)) ?? (scope === "monthly" ? localStorage.getItem(LEGACY_KEY) : null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CategoryBudget[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.category === "string" && typeof item.limit === "number");
  } catch {
    return [];
  }
}

export function saveCategoryBudgets(items: CategoryBudget[], scope: BudgetScope = "monthly"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(scope), JSON.stringify(items));
}
