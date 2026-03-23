"use client";

import type { Invoice } from "@/lib/api";
import { getJakartaTimestamp } from "@/lib/date-time";

export type AccountType = "cash" | "bank" | "ewallet" | "other";

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

export function computeAccountBalances(
  accounts: Account[],
  invoices: Invoice[],
  invoiceAccountMap: Record<string, string>
): Array<Account & { balance: number; income: number; expense: number }> {
  return accounts.map((account) => {
    let income = 0;
    let expense = 0;
    invoices.forEach((invoice) => {
      const mappedAccountId = invoiceAccountMap[String(invoice.id)];
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
