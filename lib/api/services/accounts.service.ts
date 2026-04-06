import { api } from "../client";
import type { 
  Account, 
  AccountCreatePayload, 
  AccountUpdatePayload 
} from "../types";

const PATH = "/api/v1/accounts";

export const accountsService = {
  getAll: async () => {
    return api.get<Account[]>(PATH);
  },

  getById: async (id: number) => {
    return api.get<{ account: Account; balance: number }>(`${PATH}/${id}`);
  },

  create: async (payload: AccountCreatePayload) => {
    return api.post<Account>(PATH, payload);
  },

  update: async (id: number, payload: AccountUpdatePayload) => {
    return api.put<Account>(`${PATH}/${id}`, payload);
  },

  delete: async (id: number) => {
    return api.delete<{ message: string }>(`${PATH}/${id}`);
  }
};
