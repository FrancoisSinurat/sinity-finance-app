"use client";

import { useMemo, useState } from "react";
import { useInvoicesData } from "@/lib/api";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { monthRange, monthlyTrend, toMonthKey, totalsByType } from "@/lib/finance-analytics";
import { getChartColors } from "@/lib/theme-utils";
import { getJakartaMonthKey } from "@/lib/date-time";

function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escaped = (v: string | number) => `"${String(v).replaceAll("\"", "\"\"")}"`;
  const lines = [headers.join(",")];
  rows.forEach((row) => lines.push(headers.map((h) => escaped(row[h] ?? "")).join(",")));
  return lines.join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function previousMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  if (!year || !mon) return month;
  const d = new Date(year, mon - 1, 1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function deltaPct(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

export default function ReportsPage() {
  const { colorTheme, theme } = useTheme();
  const pemasukkanState = useInvoicesData("pemasukkan");
  const pengeluaranState = useInvoicesData("pengeluaran");
  const loading = pemasukkanState.loading || pengeluaranState.loading;

  const defaultMonth = getJakartaMonthKey();
  const [fromMonth, setFromMonth] = useState(defaultMonth);
  const [toMonth, setToMonth] = useState(defaultMonth);

  const allInvoices = useMemo(
    () => [...pemasukkanState.invoices, ...pengeluaranState.invoices],
    [pemasukkanState.invoices, pengeluaranState.invoices]
  );

  const months = useMemo(() => monthRange(fromMonth, toMonth), [fromMonth, toMonth]);
  const filteredInvoices = useMemo(() => {
    if (months.length === 0) return [];
    const set = new Set(months);
    return allInvoices.filter((inv) => set.has(toMonthKey(inv.date)));
  }, [allInvoices, months]);

  const totals = useMemo(() => totalsByType(filteredInvoices), [filteredInvoices]);
  const monthComparison = useMemo(() => {
    const currentKey = toMonth;
    const previousKey = previousMonth(toMonth);
    const current = totalsByType(allInvoices.filter((inv) => toMonthKey(inv.date) === currentKey));
    const previous = totalsByType(allInvoices.filter((inv) => toMonthKey(inv.date) === previousKey));
    const currentNet = current.pemasukkan - current.pengeluaran;
    const previousNet = previous.pemasukkan - previous.pengeluaran;
    return {
      currentKey,
      previousKey,
      current,
      previous,
      deltaIncome: current.pemasukkan - previous.pemasukkan,
      deltaExpense: current.pengeluaran - previous.pengeluaran,
      deltaNet: currentNet - previousNet,
      pctIncome: deltaPct(current.pemasukkan, previous.pemasukkan),
      pctExpense: deltaPct(current.pengeluaran, previous.pengeluaran),
      pctNet: deltaPct(currentNet, previousNet),
    };
  }, [allInvoices, toMonth]);

  const trend = useMemo(() => {
    const byMonth = monthlyTrend(filteredInvoices);
    const map = new Map(byMonth.map((item) => [item.month, item]));
    return months.map((m) => map.get(m) ?? { month: m, pemasukkan: 0, pengeluaran: 0 });
  }, [filteredInvoices, months]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredInvoices
      .filter((inv) => inv.type === "pengeluaran")
      .forEach((inv) => map.set(inv.category, (map.get(inv.category) ?? 0) + inv.amount));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredInvoices]);

  const exportCsv = () => {
    const rows = filteredInvoices.map((inv) => ({
      id: inv.id,
      date: inv.date,
      type: inv.type,
      category: inv.category,
      amount: inv.amount,
      note: inv.note,
    }));
    downloadCsv(`laporan-${fromMonth}-to-${toMonth}.csv`, toCsv(rows));
  };

  const colors = getChartColors(colorTheme, theme === "dark");

  return (
    <div className="min-h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-2xl md:text-3xl font-bold",
              colorTheme === "pink" && "text-pink-600 dark:text-pink-400",
              colorTheme === "sky" && "text-sky-600 dark:text-sky-400",
              colorTheme === "indigo" && "text-indigo-600 dark:text-indigo-400",
              colorTheme === "green" && "text-green-600 dark:text-green-400"
            )}
          >
            Laporan & Analitik
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Pilih periode, lihat tren, dan export CSV.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="month"
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
            className="h-10 rounded-md border px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            type="month"
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
            className="h-10 rounded-md border px-3 bg-white dark:bg-slate-900 dark:border-slate-700"
          />
          <Button onClick={exportCsv} disabled={filteredInvoices.length === 0}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Summary title="Total Pemasukan" value={totals.pemasukkan} />
        <Summary title="Total Pengeluaran" value={totals.pengeluaran} />
        <Summary title="Selisih" value={totals.pemasukkan - totals.pengeluaran} />
      </div>

      <div className="rounded-2xl border dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-bold">Perbandingan Bulan</h2>
          <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
            {monthComparison.currentKey} vs {monthComparison.previousKey}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <CompareCard
            title="Pemasukan"
            current={monthComparison.current.pemasukkan}
            previous={monthComparison.previous.pemasukkan}
            delta={monthComparison.deltaIncome}
            pct={monthComparison.pctIncome}
            positiveIsGood
          />
          <CompareCard
            title="Pengeluaran"
            current={monthComparison.current.pengeluaran}
            previous={monthComparison.previous.pengeluaran}
            delta={monthComparison.deltaExpense}
            pct={monthComparison.pctExpense}
            positiveIsGood={false}
          />
          <CompareCard
            title="Net"
            current={monthComparison.current.pemasukkan - monthComparison.current.pengeluaran}
            previous={monthComparison.previous.pemasukkan - monthComparison.previous.pengeluaran}
            delta={monthComparison.deltaNet}
            pct={monthComparison.pctNet}
            positiveIsGood
          />
        </div>
      </div>

      <div className="rounded-2xl border dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 md:p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">Memuat data...</div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pemasukkan" stroke={colors[0]} strokeWidth={2.5} />
                <Line type="monotone" dataKey="pengeluaran" stroke={colors[1] ?? "#ef4444"} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 md:p-6">
        {categoryBreakdown.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">Belum ada data kategori pada periode ini.</div>
        ) : (
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%">
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
      <p className="text-xl font-bold mt-1">Rp {value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function CompareCard({
  title,
  current,
  previous,
  delta,
  pct,
  positiveIsGood,
}: {
  title: string;
  current: number;
  previous: number;
  delta: number;
  pct: number | null;
  positiveIsGood: boolean;
}) {
  const isPositive = delta >= 0;
  const good = positiveIsGood ? isPositive : !isPositive;
  return (
    <div className="rounded-xl border dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
      <p className="text-xl font-bold mt-1">Rp {current.toLocaleString("id-ID")}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Bulan lalu: Rp {previous.toLocaleString("id-ID")}</p>
      <p className={cn("text-sm font-semibold mt-2", good ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        {delta >= 0 ? "+" : "-"}Rp {Math.abs(delta).toLocaleString("id-ID")}
        {pct == null ? " (n/a)" : ` (${delta >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
      </p>
    </div>
  );
}
