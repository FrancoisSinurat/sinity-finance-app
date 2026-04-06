"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, PiggyBank, Target, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ApiError, goalsService, settingsService, useInvoicesData } from "@/lib/api";
import { computeTargetProgress, type SavingsTarget, type WishlistItem } from "@/lib/goals-storage";
import { getCategoryBudgets } from "@/lib/budget-storage";
import { dismissBudgetAlert, syncBudgetAlerts, type BudgetAlert } from "@/lib/budget-notifications";
import { getAccounts, getAccountsAsync } from "@/lib/accounts-storage";
import type { Account } from "@/lib/accounts-storage";
import { filterByMonth, groupByCategory, totalsByType } from "@/lib/finance-analytics";
import { formatJakartaMonthLabel, getJakartaMonthKey } from "@/lib/date-time";
import { useTheme } from "@/lib/theme-provider";
import { getChartColors } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";

type InsightMode = "pemasukkan" | "pengeluaran";

function currentMonthKey(): string {
  return getJakartaMonthKey();
}

function formatCurrency(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function buildThemeStyles(colorTheme: "pink" | "sky" | "indigo" | "green") {
  if (colorTheme === "sky") {
    return {
      shell: "border-sky-200/70 dark:border-sky-900/55",
      soft: "bg-sky-50/70 dark:bg-sky-950/20",
      icon: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/15 dark:text-sky-200",
      accent: "text-sky-700 dark:text-sky-200",
      accentBg: "bg-sky-500 hover:bg-sky-600 text-white",
      accentSoft: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/35 dark:text-sky-200",
      outline: "border-sky-200/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-200 dark:hover:bg-sky-950/25",
      progress: "bg-sky-500",
      gradient: "from-sky-500 via-sky-500 to-sky-600",
    };
  }
  if (colorTheme === "indigo") {
    return {
      shell: "border-indigo-200/70 dark:border-indigo-900/55",
      soft: "bg-indigo-50/70 dark:bg-indigo-950/20",
      icon: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-200",
      accent: "text-indigo-700 dark:text-indigo-200",
      accentBg: "bg-indigo-500 hover:bg-indigo-600 text-white",
      accentSoft: "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/35 dark:text-indigo-200",
      outline: "border-indigo-200/80 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-200 dark:hover:bg-indigo-950/25",
      progress: "bg-indigo-500",
      gradient: "from-indigo-500 via-indigo-500 to-indigo-600",
    };
  }
  if (colorTheme === "green") {
    return {
      shell: "border-green-200/70 dark:border-green-900/55",
      soft: "bg-green-50/70 dark:bg-green-950/20",
      icon: "bg-green-500/12 text-green-600 dark:bg-green-400/15 dark:text-green-200",
      accent: "text-green-700 dark:text-green-200",
      accentBg: "bg-green-500 hover:bg-green-600 text-white",
      accentSoft: "bg-green-100/80 text-green-700 dark:bg-green-900/35 dark:text-green-200",
      outline: "border-green-200/80 text-green-700 hover:bg-green-50 dark:border-green-900/60 dark:text-green-200 dark:hover:bg-green-950/25",
      progress: "bg-green-500",
      gradient: "from-green-500 via-green-500 to-green-600",
    };
  }
  return {
    shell: "border-pink-200/70 dark:border-pink-900/55",
    soft: "bg-pink-50/70 dark:bg-pink-950/20",
    icon: "bg-pink-500/12 text-pink-600 dark:bg-pink-400/15 dark:text-pink-200",
    accent: "text-pink-700 dark:text-pink-200",
    accentBg: "bg-pink-500 hover:bg-pink-600 text-white",
    accentSoft: "bg-pink-100/80 text-pink-700 dark:bg-pink-900/35 dark:text-pink-200",
    outline: "border-pink-200/80 text-pink-700 hover:bg-pink-50 dark:border-pink-900/60 dark:text-pink-200 dark:hover:bg-pink-950/25",
    progress: "bg-pink-500",
    gradient: "from-pink-500 via-pink-500 to-pink-600",
  };
}

export default function DashboardContent() {
  const { theme, colorTheme } = useTheme();
  const themeStyles = buildThemeStyles(colorTheme);
  const chartColors = getChartColors(colorTheme, theme === "dark");
  const monthKey = currentMonthKey();

  const pemasukkanState = useInvoicesData("pemasukkan");
  const pengeluaranState = useInvoicesData("pengeluaran");

  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [budgetNotifEnabled, setBudgetNotifEnabled] = useState(true);
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [insightMode, setInsightMode] = useState<InsightMode>("pengeluaran");
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());

  const loading = pemasukkanState.loading || pengeluaranState.loading;

  const allInvoices = useMemo(
    () => [...pemasukkanState.invoices, ...pengeluaranState.invoices],
    [pemasukkanState.invoices, pengeluaranState.invoices]
  );

  const totals = useMemo(() => totalsByType(allInvoices), [allInvoices]);
  const netBalance = totals.pemasukkan - totals.pengeluaran;
  const savings = Math.max(netBalance, 0);
  const monthInvoices = useMemo(() => filterByMonth(allInvoices, monthKey), [allInvoices, monthKey]);

  const accountBalances = useMemo(() => {
    return accounts.slice(0, 3);
  }, [accounts]);

  const linkedIncomeByTarget = useMemo(() => {
    const map = new Map<string, number>();
    pemasukkanState.invoices.forEach((invoice) => {
      if (!invoice.target_id) return;
      map.set(invoice.target_id, (map.get(invoice.target_id) ?? 0) + invoice.amount);
    });
    return map;
  }, [pemasukkanState.invoices]);

  const topTarget = useMemo(() => {
    return [...savingsTargets]
      .sort(
        (a, b) =>
          computeTargetProgress(b, b.savedAmount + (linkedIncomeByTarget.get(b.id) ?? 0)) -
            computeTargetProgress(a, a.savedAmount + (linkedIncomeByTarget.get(a.id) ?? 0)) ||
          a.name.localeCompare(b.name)
      )[0];
  }, [linkedIncomeByTarget, savingsTargets]);

  const budgetWarnings = useMemo(() => {
    const budgets = getCategoryBudgets();
    const spentMap = new Map<string, number>();

    monthInvoices
      .filter((item) => item.type === "pengeluaran")
      .forEach((item) => {
        spentMap.set(item.category, (spentMap.get(item.category) ?? 0) + item.amount);
      });

    return budgets
      .map((item) => {
        const spent = spentMap.get(item.category) ?? 0;
        const progress = item.limit > 0 ? (spent / item.limit) * 100 : 0;
        return { ...item, spent, progress };
      })
      .filter((item) => item.progress >= 80)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [monthInvoices]);

  const chartData = useMemo(
    () =>
      insightMode === "pemasukkan"
        ? groupByCategory(allInvoices.filter((item) => item.type === "pemasukkan"))
        : groupByCategory(allInvoices.filter((item) => item.type === "pengeluaran")),
    [allInvoices, insightMode]
  );

  const chartTotal = insightMode === "pemasukkan" ? totals.pemasukkan : totals.pengeluaran;

  const chartLegend = useMemo(() => {
    if (chartTotal <= 0) return [];
    return chartData.slice(0, 5).map((item) => ({
      ...item,
      percent: (item.value / chartTotal) * 100,
    }));
  }, [chartData, chartTotal]);

  useEffect(() => {
    let mounted = true;

    const loadGoals = async () => {
      try {
        const [targets, wishlist] = await Promise.all([goalsService.listTargets(), goalsService.listWishlist()]);
        if (!mounted) return;
        setSavingsTargets(targets);
        setWishlistItems(wishlist);
      } catch (error) {
        if (!mounted || !(error instanceof ApiError)) return;
        setSavingsTargets([]);
        setWishlistItems([]);
      }
    };

    const loadNotifyPreference = async () => {
      try {
        const settings = await settingsService.get();
        if (!mounted) return;
        setBudgetNotifEnabled(settings.notify_push);
      } catch {
        if (mounted) setBudgetNotifEnabled(true);
      }
    };

    const loadAccounts = async () => {
      const data = await getAccountsAsync();
      if (mounted) setAccounts(data);
    };

    void loadGoals();
    void loadNotifyPreference();
    void loadAccounts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!budgetNotifEnabled) {
      setBudgetAlerts([]);
      return;
    }
    setBudgetAlerts(syncBudgetAlerts(monthKey, budgetWarnings));
  }, [budgetNotifEnabled, budgetWarnings, monthKey]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent dark:border-slate-600" />
      </div>
    );
  }

  const activeTargetSaved = topTarget ? topTarget.savedAmount + (linkedIncomeByTarget.get(topTarget.id) ?? 0) : 0;
  const activeTargetProgress = topTarget ? computeTargetProgress(topTarget, activeTargetSaved) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
      <section
        className={cn(
          "overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.18)] transition-shadow duration-300 hover:shadow-[0_28px_90px_-42px_rgba(15,23,42,0.22)] dark:bg-slate-950",
          themeStyles.shell
        )}
      >
        <div className={cn("bg-gradient-to-r px-4 py-5 sm:px-5 md:px-6 md:py-6", themeStyles.gradient)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2 text-white">
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Dashboard
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{formatJakartaMonthLabel(monthKey)}</h1>
                <p className="mt-1 text-sm text-white/75">
                  {allInvoices.length} transaksi aktif
                </p>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 text-white sm:min-w-[240px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Saldo Bersih</p>
              <p className="mt-2 text-2xl font-semibold sm:text-3xl">{formatCurrency(netBalance)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 bg-white p-4 dark:border-slate-900 dark:bg-slate-950 sm:p-5 md:px-6 md:pb-6 md:pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard title="Pemasukan" value={totals.pemasukkan} icon={TrendingUp} themeStyles={themeStyles} index={0} href="/invoices/pemasukkan" />
            <MetricCard title="Pengeluaran" value={totals.pengeluaran} icon={TrendingDown} themeStyles={themeStyles} index={1} href="/invoices/pengeluaran" />
            <MetricCard title="Tabungan" value={savings} icon={PiggyBank} themeStyles={themeStyles} index={2} href="/accounts" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.85fr]">
        <div
          className={cn(
            "rounded-[24px] border bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.16)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.2)] dark:bg-slate-950 sm:p-5",
            themeStyles.shell
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">Insight Kategori</p>
            </div>

            <div className={cn("inline-flex rounded-full border p-1", themeStyles.soft, themeStyles.shell)}>
              {[
                { key: "pengeluaran", label: "Pengeluaran" },
                { key: "pemasukkan", label: "Pemasukan" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setInsightMode(item.key as InsightMode)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-xs font-medium transition sm:px-4",
                    insightMode === item.key ? "text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {insightMode === item.key ? (
                    <motion.span
                      layoutId="dashboard-insight-pill"
                      className={cn("absolute inset-0 rounded-full", themeStyles.accentBg)}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-[1]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <motion.div
              layout
              className="rounded-[22px] border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {insightMode === "pemasukkan" ? "Kategori Pemasukan" : "Kategori Pengeluaran"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">{formatCurrency(chartTotal)}</p>
                </div>
                <div className={cn("rounded-full px-3 py-1 text-[11px] font-medium", themeStyles.accentSoft)}>
                  {chartData.length} kategori
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={insightMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-3 h-[240px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.length > 0 ? chartData : [{ name: "Belum ada data", value: 1 }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="48%"
                          outerRadius="78%"
                          paddingAngle={3}
                        >
                          {(chartData.length > 0 ? chartData : [{ name: "Belum ada data", value: 1 }]).map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} stroke={theme === "dark" ? "#0f172a" : "#ffffff"} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid rgba(148,163,184,0.18)",
                            background: theme === "dark" ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.96)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${insightMode}-legend`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                {chartLegend.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-neutral-200 bg-neutral-50/80 p-4 text-sm text-neutral-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Belum ada data kategori.
                  </div>
                ) : (
                  chartLegend.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.18 }}
                      className="rounded-[18px] border border-neutral-200/80 bg-neutral-50/80 p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{item.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-slate-400">
                            <span>{formatCurrency(item.value)}</span>
                            <span>{item.percent.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          {(topTarget || wishlistItems.length > 0) && (
            <section
              className={cn(
                "rounded-[24px] border bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.16)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.2)] dark:bg-slate-950 sm:p-5",
                themeStyles.shell
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">Target & Wishlist</p>
                </div>
                <Link href="/goals" className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition", themeStyles.accentBg)}>
                  Buka
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {topTarget ? (
                  <Link
                    href="/goals"
                    className={cn("block rounded-[20px] border p-3.5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm", themeStyles.soft, themeStyles.shell)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-2xl", themeStyles.icon)}>
                            <Target className="h-4 w-4" />
                          </span>
                          <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{topTarget.name}</p>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500 dark:text-slate-400">
                          {formatCurrency(activeTargetSaved)} / {formatCurrency(topTarget.targetAmount)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{activeTargetProgress.toFixed(0)}%</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-slate-800">
                      <div className={cn("h-full rounded-full", themeStyles.progress)} style={{ width: `${Math.min(activeTargetProgress, 100)}%` }} />
                    </div>
                  </Link>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <MiniInfo title="Target" value={`${savingsTargets.length}`} themeStyles={themeStyles} href="/goals" />
                  <MiniInfo title="Wishlist" value={`${wishlistItems.length}`} themeStyles={themeStyles} href="/goals" />
                </div>
              </div>
            </section>
          )}

          {(budgetAlerts.length > 0 || budgetWarnings.length > 0) && (
            <section
              className={cn(
                "rounded-[24px] border bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.16)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.2)] dark:bg-slate-950 sm:p-5",
                themeStyles.shell
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-2xl", themeStyles.icon)}>
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">Budget Watch</p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">Kategori yang perlu dicek lebih dulu.</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {budgetAlerts.length > 0
                  ? budgetAlerts.slice(0, 3).map((item) => {
                      const isOver = item.level === "over";
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-[18px] border p-3",
                            isOver
                              ? "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/25"
                              : "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={cn("truncate text-sm font-semibold", isOver ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300")}>
                                {item.category}
                              </p>
                              <p className="mt-1 text-xs text-neutral-600 dark:text-slate-300">
                                {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", isOver ? "bg-red-100 text-red-700 dark:bg-red-900/35 dark:text-red-200" : "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-200")}>
                                {item.progress.toFixed(0)}%
                              </span>
                              <button
                                onClick={() => {
                                  dismissBudgetAlert(item.id);
                                  setBudgetAlerts((prev) => prev.filter((alert) => alert.id !== item.id));
                                }}
                                className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
                                aria-label="Tutup notifikasi"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : budgetWarnings.slice(0, 3).map((item) => {
                      const isOver = item.progress >= 100;
                      return (
                        <div
                          key={item.category}
                          className={cn(
                            "rounded-[18px] border p-3",
                            isOver
                              ? "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/25"
                              : "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={cn("truncate text-sm font-semibold", isOver ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300")}>
                                {item.category}
                              </p>
                              <p className="mt-1 text-xs text-neutral-600 dark:text-slate-300">
                                {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                              </p>
                            </div>
                            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", isOver ? "bg-red-100 text-red-700 dark:bg-red-900/35 dark:text-red-200" : "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-200")}>
                              {item.progress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </section>
          )}

          {accountBalances.length > 0 && (
            <section
              className={cn(
                "rounded-[24px] border bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.16)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.2)] dark:bg-slate-950 sm:p-5",
                themeStyles.shell
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-2xl", themeStyles.icon)}>
                  <Wallet className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">Rekening</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {accountBalances.map((account) => (
                  <Link
                    key={account.id}
                    href="/accounts"
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-neutral-200/80 bg-neutral-50/80 p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-slate-500">{account.type}</p>
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{account.name}</p>
                    </div>
                    <p className={cn("text-sm font-semibold", account.balance >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300")}>
                      {formatCurrency(account.balance)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  themeStyles,
  index,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  themeStyles: ReturnType<typeof buildThemeStyles>;
  index: number;
  href: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="block rounded-[22px] border border-neutral-200/80 bg-neutral-50/90 p-3.5 text-neutral-950 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-slate-500">{title}</p>
            <p className="mt-2 truncate text-lg font-semibold sm:text-xl">{formatCurrency(value)}</p>
          </div>
          <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl", themeStyles.icon)}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function MiniInfo({
  title,
  value,
  themeStyles,
  href,
}: {
  title: string;
  value: string;
  themeStyles: ReturnType<typeof buildThemeStyles>;
  href: string;
}) {
  return (
    <Link href={href} className={cn("block rounded-[18px] border p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm", themeStyles.soft, themeStyles.shell)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-neutral-950 dark:text-white">{value}</p>
    </Link>
  );
}
