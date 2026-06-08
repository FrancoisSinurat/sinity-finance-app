import { api } from "../client";
import type { Type } from "../types";

const PATH = "/api/v1/types";

function toList<T>(res: T[] | { data?: T[] } | unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray((res as { data?: T[] }).data))
    return (res as { data: T[] }).data;
  return [];
}

export const typesService = {
  async getAll(): Promise<Type[]> {
    const res = await api.get<Type[] | { data: Type[] }>(PATH);
    return toList(res);
  },

  async getById(id: number): Promise<Type> {
    return api.get<Type>(`${PATH}/${id}`);
  },

  async create(name: string): Promise<Type> {
    return api.post<Type>(PATH, { name });
  },

  async update(id: number, name: string): Promise<Type> {
    return api.put<Type>(`${PATH}/${id}`, { name });
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${PATH}/${id}`);
  },
};
