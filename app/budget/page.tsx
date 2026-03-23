"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Coins, Save, Search, Target, Wallet } from "lucide-react";
import { budgetService, useInvoicesData } from "@/lib/api";
import type { CategoryBudget } from "@/lib/api";
import { getCategoryBudgets, saveCategoryBudgets } from "@/lib/budget-storage";
import { formatJakartaMonthLabel, formatJakartaWeekLabel, getJakartaMonthKey, getJakartaWeekRange } from "@/lib/date-time";
import { formatCurrencyCompactLabel, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-input";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterMode = "all" | "set" | "unset" | "warning";
type BudgetMode = "monthly" | "weekly";
type BudgetRow = {
  category: string;
  limit: number;
  spent: number;
  progress: number;
  hasBudget: boolean;
  isWarning: boolean;
  isOver: boolean;
  remaining: number;
};

function currentMonthKey(): string {
  return getJakartaMonthKey();
}

function buildThemeStyles(colorTheme: "pink" | "sky" | "indigo" | "green") {
  if (colorTheme === "sky") {
    return {
      shell: "border-sky-200/70 dark:border-sky-900/55",
      soft: "bg-sky-50/65 dark:bg-sky-950/18",
      icon: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/15 dark:text-sky-200",
      accentSoft: "bg-sky-50/85 dark:bg-sky-950/30",
      accentBorder: "border-sky-200/80 dark:border-sky-900/60",
      action: "bg-sky-500 hover:bg-sky-600 text-white",
      outline: "border-sky-200/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-200 dark:hover:bg-sky-950/30",
      focus: "focus-visible:ring-sky-400 dark:focus-visible:ring-sky-500",
      progress: "bg-sky-500",
      chip: "border-sky-200 bg-sky-100/80 text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/25 dark:text-sky-200",
    };
  }
  if (colorTheme === "indigo") {
    return {
      shell: "border-indigo-200/70 dark:border-indigo-900/55",
      soft: "bg-indigo-50/65 dark:bg-indigo-950/18",
      icon: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-200",
      accentSoft: "bg-indigo-50/85 dark:bg-indigo-950/30",
      accentBorder: "border-indigo-200/80 dark:border-indigo-900/60",
      action: "bg-indigo-500 hover:bg-indigo-600 text-white",
      outline: "border-indigo-200/80 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-200 dark:hover:bg-indigo-950/30",
      focus: "focus-visible:ring-indigo-400 dark:focus-visible:ring-indigo-500",
      progress: "bg-indigo-500",
      chip: "border-indigo-200 bg-indigo-100/80 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/25 dark:text-indigo-200",
    };
  }
  if (colorTheme === "green") {
    return {
      shell: "border-green-200/70 dark:border-green-900/55",
      soft: "bg-green-50/65 dark:bg-green-950/18",
      icon: "bg-green-500/12 text-green-600 dark:bg-green-400/15 dark:text-green-200",
      accentSoft: "bg-green-50/85 dark:bg-green-950/30",
      accentBorder: "border-green-200/80 dark:border-green-900/60",
      action: "bg-green-500 hover:bg-green-600 text-white",
      outline: "border-green-200/80 text-green-700 hover:bg-green-50 dark:border-green-900/60 dark:text-green-200 dark:hover:bg-green-950/30",
      focus: "focus-visible:ring-green-400 dark:focus-visible:ring-green-500",
      progress: "bg-green-500",
      chip: "border-green-200 bg-green-100/80 text-green-700 dark:border-green-900/60 dark:bg-green-900/25 dark:text-green-200",
    };
  }
  return {
    shell: "border-pink-200/70 dark:border-pink-900/55",
    soft: "bg-pink-50/65 dark:bg-pink-950/18",
    icon: "bg-pink-500/12 text-pink-600 dark:bg-pink-400/15 dark:text-pink-200",
    accentSoft: "bg-pink-50/85 dark:bg-pink-950/30",
    accentBorder: "border-pink-200/80 dark:border-pink-900/60",
    action: "bg-pink-500 hover:bg-pink-600 text-white",
    outline: "border-pink-200/80 text-pink-700 hover:bg-pink-50 dark:border-pink-900/60 dark:text-pink-200 dark:hover:bg-pink-950/30",
    focus: "focus-visible:ring-pink-400 dark:focus-visible:ring-pink-500",
    progress: "bg-pink-500",
    chip: "border-pink-200 bg-pink-100/80 text-pink-700 dark:border-pink-900/60 dark:bg-pink-900/25 dark:text-pink-200",
  };
}

export default function BudgetPage() {
  const { colorTheme } = useTheme();
  const themeStyles = buildThemeStyles(colorTheme);
  const { invoices, categories, loading } = useInvoicesData("pengeluaran");

  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [mode, setMode] = useState<BudgetMode>("monthly");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [draftLimits, setDraftLimits] = useState<Record<string, string>>({});
  const [busyCategory, setBusyCategory] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    const loadBudgets = async () => {
      try {
        const remote = await budgetService.getAll(mode);
        if (!mounted) return;
        setBudgets(remote.map((item) => ({ category: item.category, limit: item.limit })));
        setSyncMessage("");
      } catch {
        if (!mounted) return;
        setBudgets(getCategoryBudgets(mode));
        setSyncMessage("Lokal");
      }
    };
    void loadBudgets();
    return () => {
      mounted = false;
    };
  }, [mode]);

  useEffect(() => {
    saveCategoryBudgets(budgets, mode);
  }, [budgets, mode]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  useEffect(() => {
    setDraftLimits({});
    setPage(1);
  }, [mode]);

  const monthKey = currentMonthKey();
  const monthLabel = formatJakartaMonthLabel(monthKey);
  const weekRange = useMemo(() => getJakartaWeekRange(), []);
  const weekLabel = useMemo(() => formatJakartaWeekLabel(weekRange.start, weekRange.end), [weekRange.end, weekRange.start]);
  const periodLabel = mode === "monthly" ? monthLabel : weekLabel;

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    invoices
      .filter((inv) => (mode === "monthly" ? inv.date.startsWith(monthKey) : inv.date >= weekRange.start && inv.date <= weekRange.end))
      .forEach((inv) => {
        map.set(inv.category, (map.get(inv.category) ?? 0) + inv.amount);
      });
    return map;
  }, [invoices, mode, monthKey, weekRange.end, weekRange.start]);

  const allExpenseCategories = useMemo(() => {
    return Array.from(
      new Set([...categories.map((c) => c.name), ...invoices.map((i) => i.category), ...budgets.map((b) => b.category)].filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [categories, invoices, budgets]);

  const budgetMap = useMemo(() => new Map(budgets.map((b) => [b.category, b.limit])), [budgets]);

  const rows = useMemo<BudgetRow[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allExpenseCategories
      .map((category) => {
        const limit = budgetMap.get(category) ?? 0;
        const spent = spentByCategory.get(category) ?? 0;
        const progress = limit > 0 ? (spent / limit) * 100 : 0;
        const hasBudget = limit > 0;
        const isWarning = hasBudget && progress >= 80;
        const isOver = hasBudget && progress >= 100;

        return {
          category,
          limit,
          spent,
          progress,
          hasBudget,
          isWarning,
          isOver,
          remaining: Math.max(limit - spent, 0),
        };
      })
      .filter((row) => {
        if (normalizedSearch && !row.category.toLowerCase().includes(normalizedSearch)) return false;
        if (filter === "set") return row.hasBudget;
        if (filter === "unset") return !row.hasBudget;
        if (filter === "warning") return row.isWarning;
        return true;
      });
  }, [allExpenseCategories, budgetMap, spentByCategory, search, filter]);

  const stats = useMemo(() => {
    const totalLimit = rows.reduce((sum, row) => sum + row.limit, 0);
    const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);
    return {
      totalCategories: allExpenseCategories.length,
      totalLimit,
      warningCount: rows.filter((row) => row.isWarning).length,
      totalSpent,
    };
  }, [rows, allExpenseCategories.length]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () => rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [rows, currentPage, itemsPerPage]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const upsertBudget = (category: string, limit: number) => {
    setBudgets((prev) => {
      const next = [...prev];
      const index = next.findIndex((b) => b.category === category);
      if (index >= 0) next[index] = { category, limit };
      else next.push({ category, limit });
      return next.sort((a, b) => a.category.localeCompare(b.category));
    });
  };

  const removeBudgetLocal = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  const removeBudget = async (category: string) => {
    setBusyCategory(category);

    try {
      await budgetService.remove(category, mode);
      removeBudgetLocal(category);
      setSyncMessage("");
    } catch {
      removeBudgetLocal(category);
      setSyncMessage("Lokal");
    } finally {
      setDraftLimits((prev) => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      setBusyCategory(null);
    }
  };

  const saveDraft = async (category: string, currentLimit: number) => {
    const raw = draftLimits[category] ?? "";
    const parsed = parseCurrencyInput(raw);

    if (!raw.trim()) {
      if (currentLimit > 0) await removeBudget(category);
      return;
    }
    if (parsed <= 0) return;

    setBusyCategory(category);

    try {
      const saved = await budgetService.upsert({ category, limit: parsed, scope: mode });
      upsertBudget(saved.category, saved.limit);
      setSyncMessage("");
    } catch {
      upsertBudget(category, parsed);
      setSyncMessage("Lokal");
    } finally {
      setBusyCategory(null);
    }
  };

  const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-5xl flex-col gap-3 overflow-hidden md:h-[calc(100dvh-6.25rem)] md:min-h-[660px] sm:gap-4">
      <section
        className={cn(
          "rounded-[24px] border bg-white/88 p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-slate-950/78 sm:p-5",
          themeStyles.shell
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", themeStyles.accentSoft, themeStyles.accentBorder)}>
              <Target className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white md:text-3xl">Budget</h1>
                <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", themeStyles.chip)}>{periodLabel}</div>
                {syncMessage && <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", themeStyles.chip)}>{syncMessage}</div>}
                <div className={cn("inline-flex rounded-full border p-1", themeStyles.accentSoft, themeStyles.accentBorder)}>
                  {[
                    { key: "monthly", label: "Bulanan" },
                    { key: "weekly", label: "Mingguan" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMode(item.key as BudgetMode)}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-xs font-medium transition sm:px-4",
                        mode === item.key ? themeStyles.action : "text-neutral-500 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <MiniStat title="Kategori" value={`${stats.totalCategories}`} icon={Target} themeStyles={themeStyles} />
            <MiniStat title="Dipakai" value={formatCurrencyCompactLabel(stats.totalSpent)} icon={Wallet} themeStyles={themeStyles} />
            <div className="col-span-2 sm:col-span-1">
              <MiniStat title="Limit" value={formatCurrencyCompactLabel(stats.totalLimit)} icon={Coins} themeStyles={themeStyles} />
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "rounded-[22px] border bg-white/88 p-3.5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-slate-950/78 sm:p-4",
          themeStyles.shell
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori"
                className={cn("h-10 rounded-full pl-9", themeStyles.focus)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Semua" },
              { key: "set", label: "Diatur" },
              { key: "unset", label: "Kosong" },
              { key: "warning", label: "Warning" },
            ].map((item) => (
              <Button
                key={item.key}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFilter(item.key as FilterMode)}
                className={cn("h-9 rounded-full px-4", filter === item.key ? themeStyles.action : themeStyles.outline)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section
        className={cn(
          "flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-[24px] border bg-white/88 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-slate-950/78 md:min-h-0",
          themeStyles.shell
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200/70 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-neutral-950 dark:text-white">Kategori</p>
            <p className="text-xs text-neutral-500 dark:text-slate-400">{rows.length} item</p>
          </div>
          <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", themeStyles.chip)}>
            {currentPage} / {totalPages}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-600 dark:text-slate-400">
              Memuat data budget...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", themeStyles.icon)}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-900 dark:text-white">Tidak ada kategori yang cocok</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-slate-400">Coba ubah filter atau pencarian.</p>
            </div>
          ) : (
          <div className="space-y-3">
              {paginatedRows.map((row) => {
                const currentValue = row.limit > 0 ? formatCurrencyInput(String(row.limit)) : "";
                const inputValue = draftLimits[row.category] ?? currentValue;
                const parsedDraft = parseCurrencyInput(inputValue);
                const hasChanged = draftLimits[row.category] != null && inputValue !== currentValue;
                const isValidDraft = inputValue.trim() === "" || parsedDraft > 0;
                const isDeleteAction = row.limit > 0 && hasChanged && !inputValue.trim();

                return (
                  <article
                    key={row.category}
                    className={cn(
                      "rounded-[20px] border bg-white/72 p-3.5 dark:bg-slate-950/45 sm:p-4",
                      row.isOver
                        ? "border-red-200 dark:border-red-900/45"
                        : row.isWarning
                          ? "border-amber-200 dark:border-amber-900/45"
                          : themeStyles.shell
                    )}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="truncate text-[15px] font-semibold text-neutral-950 dark:text-white sm:text-base">
                            {row.category}
                          </h2>
                          <div
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium",
                              row.isOver
                                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                : row.isWarning
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  : cn(themeStyles.chip)
                            )}
                          >
                            {row.isOver ? "Over" : row.isWarning ? "Warning" : row.hasBudget ? "Aman" : "Kosong"}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-[13px] text-neutral-500 dark:text-slate-400">
                            <span className="truncate">{row.hasBudget ? `${formatCurrency(row.spent)} / ${formatCurrency(row.limit)}` : "Belum diatur"}</span>
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {row.hasBudget ? `${row.progress.toFixed(0)}%` : "-"}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-slate-800 sm:h-2">
                            <div
                              className={cn("h-full rounded-full", row.isOver ? "bg-red-500" : row.isWarning ? "bg-amber-500" : themeStyles.progress)}
                              style={{ width: `${Math.min(row.progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-slate-400">
                            Sisa {formatCurrency(row.remaining)} • {formatCurrencyCompactLabel(row.spent)}
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:flex-row">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={mode === "monthly" ? "Limit bulan" : "Limit minggu"}
                          value={inputValue}
                          onChange={(e) =>
                            setDraftLimits((prev) => ({
                              ...prev,
                              [row.category]: formatCurrencyInput(e.target.value),
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && hasChanged && isValidDraft) {
                              void saveDraft(row.category, row.limit);
                            }
                          }}
                          className={cn(
                            "h-10 rounded-full border-neutral-200/80 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:w-[220px]",
                            themeStyles.focus,
                            !isValidDraft && "border-red-400 focus-visible:ring-red-400/60"
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className={cn("h-10 flex-1 rounded-full sm:flex-none sm:px-4", themeStyles.action)}
                            disabled={!hasChanged || !isValidDraft || busyCategory === row.category}
                            onClick={() => void saveDraft(row.category, row.limit)}
                          >
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                            {busyCategory === row.category ? "Menyimpan..." : isDeleteAction ? "Hapus" : "Simpan"}
                          </Button>
                          {row.limit > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className={cn("h-10 rounded-full px-4", themeStyles.outline)}
                              disabled={busyCategory === row.category}
                              onClick={() => void removeBudget(row.category)}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200/70 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              {(currentPage - 1) * itemsPerPage + (paginatedRows.length > 0 ? 1 : 0)}-
              {(currentPage - 1) * itemsPerPage + paginatedRows.length} / {rows.length}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={cn("h-9 rounded-full px-4", themeStyles.outline)}
              >
                Prev
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className={cn("h-9 rounded-full px-4", themeStyles.outline)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon: Icon,
  themeStyles,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  themeStyles: ReturnType<typeof buildThemeStyles>;
}) {
  return (
    <div className={cn("rounded-[18px] border p-3", themeStyles.accentSoft, themeStyles.accentBorder)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-neutral-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 truncate text-sm font-semibold text-neutral-950 dark:text-white sm:text-[15px]">{value}</p>
        </div>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", themeStyles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
