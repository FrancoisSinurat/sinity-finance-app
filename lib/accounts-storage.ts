"use client";

import type { Invoice, Account as ApiAccount, AccountType as ApiAccountType } from "@/lib/api";
import { accountsService } from "@/lib/api";
import { getJakartaTimestamp } from "@/lib/date-time";

export type AccountType = ApiAccountType;

export type Account = {
  id: string;
  name: string;
  accountNumber: string;
  type: AccountType;
  initialBalance: number;
  color: "pink" | "sky" | "indigo" | "green";
  createdAt: string;
};

export type TransferRecord = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string;
  expenseInvoiceId?: number;
  incomeInvoiceId?: number;
  createdAt: string;
};

const ACCOUNTS_KEY = "accounts_v1";
const TX_ACCOUNT_MAP_KEY = "invoice_account_map_v1";
const TRANSFERS_KEY = "account_transfers_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Partial<Account>[]>(localStorage.getItem(ACCOUNTS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item) => item && typeof item.id === "string" && typeof item.name === "string")
    .map((item) => ({
      id: item.id as string,
      name: item.name as string,
      accountNumber:
        typeof item.accountNumber === "string" && item.accountNumber.trim()
          ? item.accountNumber.trim()
          : String(item.id).replace(/-/g, "").slice(-10),
      type: (item.type as AccountType) ?? "other",
      initialBalance: Number(item.initialBalance ?? 0),
      color: (item.color as Account["color"]) ?? "pink",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : getJakartaTimestamp(),
    }));
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function createAccount(input: Omit<Account, "id" | "createdAt">): Account {
  const next: Account = {
    id: crypto.randomUUID(),
    createdAt: getJakartaTimestamp(),
    ...input,
  };
  const accounts = getAccounts();
  saveAccounts([next, ...accounts]);
  return next;
}

export function updateAccount(id: string, patch: Partial<Omit<Account, "id" | "createdAt">>): Account | null {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  accounts[idx] = { ...accounts[idx], ...patch };
  saveAccounts(accounts);
  return accounts[idx];
}

export function deleteAccount(id: string): void {
  const accounts = getAccounts().filter((a) => a.id !== id);
  saveAccounts(accounts);

  const map = getInvoiceAccountMap();
  const cleaned: Record<string, string> = {};
  Object.entries(map).forEach(([invoiceId, accountId]) => {
    if (accountId !== id) cleaned[invoiceId] = accountId;
  });
  saveInvoiceAccountMap(cleaned);
}

function saveInvoiceAccountMap(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TX_ACCOUNT_MAP_KEY, JSON.stringify(map));
}

export function getInvoiceAccountMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, string>>(localStorage.getItem(TX_ACCOUNT_MAP_KEY), {});
}

export function setInvoiceAccount(invoiceId: number, accountId: string | null): void {
  const key = String(invoiceId);
  const map = getInvoiceAccountMap();
  if (!accountId) {
    delete map[key];
  } else {
    map[key] = accountId;
  }
  saveInvoiceAccountMap(map);
}

export function getTransfers(): TransferRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<TransferRecord[]>(localStorage.getItem(TRANSFERS_KEY), []);
}

export function createTransfer(
  input: Omit<TransferRecord, "id" | "createdAt">
): TransferRecord {
  const next: TransferRecord = {
    id: crypto.randomUUID(),
    createdAt: getJakartaTimestamp(),
    ...input,
  };
  const transfers = getTransfers();
  localStorage.setItem(TRANSFERS_KEY, JSON.stringify([next, ...transfers]));
  return next;
}

export async function getAccountsAsync(): Promise<Account[]> {
  try {
    const apiAccounts = await accountsService.getAll();
    if (!Array.isArray(apiAccounts)) return getAccounts();

    const accounts: Account[] = apiAccounts.map((a) => ({
      id: String(a.id),
      name: a.name,
      accountNumber: a.account_number || "",
      type: a.type as AccountType,
      initialBalance: a.initial_balance,
      color: a.color as Account["color"],
      createdAt: a.created_at || getJakartaTimestamp(),
    }));
    saveAccounts(accounts); // Sync to local cache
    return accounts;
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return getAccounts(); // Fallback to cache
  }
}

export async function createAccountAsync(input: Omit<Account, "id" | "createdAt">): Promise<Account> {
  const apiAccount = await accountsService.create({
    name: input.name,
    account_number: input.accountNumber,
    type: input.type,
    initial_balance: input.initialBalance,
    color: input.color,
  });
  const next: Account = {
    id: String(apiAccount.id),
    name: apiAccount.name,
    accountNumber: apiAccount.account_number || "",
    type: apiAccount.type,
    initialBalance: apiAccount.initial_balance,
    color: apiAccount.color as Account["color"],
    createdAt: apiAccount.created_at || getJakartaTimestamp(),
  };
  const accounts = getAccounts();
  saveAccounts([next, ...accounts]);
  return next;
}

export async function updateAccountAsync(id: string, patch: Partial<Omit<Account, "id" | "createdAt">>): Promise<Account | null> {
  const apiId = parseInt(id);
  if (isNaN(apiId)) return updateAccount(id, patch);

  const apiAccount = await accountsService.update(apiId, {
    name: patch.name,
    account_number: patch.accountNumber,
    type: patch.type,
    initial_balance: patch.initialBalance,
    color: patch.color,
  });

  const next: Account = {
    id: String(apiAccount.id),
    name: apiAccount.name,
    accountNumber: apiAccount.account_number || "",
    type: apiAccount.type,
    initialBalance: apiAccount.initial_balance,
    color: apiAccount.color as Account["color"],
    createdAt: apiAccount.created_at || getJakartaTimestamp(),
  };

  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    accounts[idx] = next;
    saveAccounts(accounts);
  }
  return next;
}

export async function deleteAccountAsync(id: string): Promise<void> {
  const apiId = parseInt(id);
  if (!isNaN(apiId)) {
    await accountsService.delete(apiId);
  }
  deleteAccount(id); // Clean up local cache
}

export function computeAccountBalances(
  accounts: Account[],
  invoices: Invoice[],
  invoiceAccountMap: Record<string, string>
): Array<Account & { balance: number; income: number; expense: number }> {
  return accounts.map((account) => {
    let income = 0;
    let expense = 0;
    invoices.forEach((invoice) => {
      // Priority 1: Backend linked account_id
      // Priority 2: Frontend local map (fallback/legacy)
      const mappedAccountId = String(invoice.account_id || invoiceAccountMap[String(invoice.id)] || "");
      if (mappedAccountId !== account.id) return;
      if (invoice.type === "pemasukkan") income += invoice.amount;
      if (invoice.type === "pengeluaran") expense += invoice.amount;
    });
    return {
      ...account,
      income,
      expense,
      balance: account.initialBalance + income - expense,
    };
  });
}
