import type { Invoice } from "@/lib/api";

export type MonthlyTrendItem = {
  month: string;
  pemasukkan: number;
  pengeluaran: number;
};

export function toMonthKey(dateString: string): string {
  const normalized = dateString.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[1]}-${match[2]}`;

  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function filterByMonth(invoices: Invoice[], monthKey: string): Invoice[] {
  return invoices.filter((inv) => toMonthKey(inv.date) === monthKey);
}

export function totalsByType(invoices: Invoice[]): { pemasukkan: number; pengeluaran: number } {
  return invoices.reduce(
    (acc, inv) => {
      if (inv.type === "pemasukkan") acc.pemasukkan += inv.amount;
      if (inv.type === "pengeluaran") acc.pengeluaran += inv.amount;
      return acc;
    },
    { pemasukkan: 0, pengeluaran: 0 }
  );
}

export function groupByCategory(invoices: Invoice[]): Array<{ name: string; value: number }> {
  const map = new Map<string, number>();
  invoices.forEach((inv) => {
    const prev = map.get(inv.category) ?? 0;
    map.set(inv.category, prev + inv.amount);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function monthlyTrend(invoices: Invoice[]): MonthlyTrendItem[] {
  const map = new Map<string, MonthlyTrendItem>();
  invoices.forEach((inv) => {
    const key = toMonthKey(inv.date);
    if (!key) return;
    const prev = map.get(key) ?? { month: key, pemasukkan: 0, pengeluaran: 0 };
    if (inv.type === "pemasukkan") prev.pemasukkan += inv.amount;
    if (inv.type === "pengeluaran") prev.pengeluaran += inv.amount;
    map.set(key, prev);
  });
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function monthRange(fromMonth: string, toMonth: string): string[] {
  const [fromYear, fromM] = fromMonth.split("-").map(Number);
  const [toYear, toM] = toMonth.split("-").map(Number);
  if (!fromYear || !fromM || !toYear || !toM) return [];

  const start = new Date(fromYear, fromM - 1, 1);
  const end = new Date(toYear, toM - 1, 1);
  if (start > end) return [];

  const result: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    result.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}
