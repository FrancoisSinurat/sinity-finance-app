import { api, apiRequest } from "../client";
import type { CategoryBudget, UpsertBudgetPayload } from "../types";

const PATH = "/api/v1/budgets";

function mapBudget(raw: unknown): CategoryBudget {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const scope = String(o.scope ?? "monthly");
  return {
    id: Number(o.id) || undefined,
    category: String(o.category ?? ""),
    limit: Number(o.limit) || 0,
    scope: scope === "weekly" ? "weekly" : "monthly",
  };
}

function mapBudgetList(raw: unknown): CategoryBudget[] {
  if (Array.isArray(raw)) return raw.map(mapBudget).filter((item) => item.category && item.limit > 0);
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data.map(mapBudget).filter((item) => item.category && item.limit > 0);
  }
  return [];
}

export const budgetService = {
  async getAll(scope: "monthly" | "weekly" = "monthly"): Promise<CategoryBudget[]> {
    const res = await api.get<unknown>(PATH, { scope });
    return mapBudgetList(res);
  },

  async upsert(payload: UpsertBudgetPayload): Promise<CategoryBudget> {
    const res = await api.put<unknown>(PATH, payload);
    return mapBudget(res);
  },

  async remove(category: string, scope: "monthly" | "weekly" = "monthly"): Promise<void> {
    await apiRequest<void>(`${PATH}/${encodeURIComponent(category)}`, { method: "DELETE", params: { scope } });
  },
};
