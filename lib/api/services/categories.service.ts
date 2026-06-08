import { api } from "../client";
import type { Category } from "../types";

const PATH = "/api/v1/categories";

function toList<T>(res: T[] | { data?: T[] } | unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray((res as { data?: T[] }).data))
    return (res as { data: T[] }).data;
  return [];
}

export const categoriesService = {
  async getAll(typeId?: number | null): Promise<Category[]> {
    const params = typeId != null ? { type_id: typeId } : undefined;
    const res = await api.get<Category[] | { data: Category[] }>(PATH, params);
    return toList(res);
  },

  async getById(id: number): Promise<Category> {
    return api.get<Category>(`${PATH}/${id}`);
  },

  async create(payload: { name: string; type_id?: number | null }): Promise<Category> {
    return api.post<Category>(PATH, payload);
  },

  async update(id: number, payload: { name?: string; type_id?: number | null }): Promise<Category> {
    return api.put<Category>(`${PATH}/${id}`, payload);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${PATH}/${id}`);
  },
};
