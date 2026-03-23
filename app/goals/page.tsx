"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatePickerDialog } from "@/components/DatePickerDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrencyCompactLabel, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-input";
import { ApiError, goalsService, useInvoicesData } from "@/lib/api";
import { computeTargetProgress, type SavingsTarget, type WishlistItem, type WishlistPriority, type WishlistStatus } from "@/lib/goals-storage";
import { formatJakartaDate } from "@/lib/date-time";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock3, Flag, Gift, Pencil, PiggyBank, Plus, Sparkles, Target, Trash2 } from "lucide-react";

type TargetFormState = {
  name: string;
  targetAmount: string;
  savedAmount: string;
  timelineType: "date" | "term";
  deadline: string;
  termValue: string;
  termUnit: "week" | "month" | "year";
  note: string;
};

type WishlistFormState = {
  name: string;
  price: string;
  priority: WishlistPriority;
  status: WishlistStatus;
  targetId: string;
  note: string;
};

function buildThemeStyles(colorTheme: "pink" | "sky" | "indigo" | "green") {
  if (colorTheme === "sky") {
    return {
      shell: "border-sky-200/70 dark:border-sky-900/55",
      accentSoft: "bg-sky-50/85 dark:bg-sky-950/28",
      accentBorder: "border-sky-200/80 dark:border-sky-900/60",
      iconSoft: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/15 dark:text-sky-200",
      chip: "border-sky-200 bg-sky-100/80 text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/25 dark:text-sky-200",
      action: "bg-sky-500 hover:bg-sky-600 text-white",
      outline: "border-sky-200/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-200 dark:hover:bg-sky-950/30",
      progress: "bg-sky-500",
    };
  }
  if (colorTheme === "indigo") {
    return {
      shell: "border-indigo-200/70 dark:border-indigo-900/55",
      accentSoft: "bg-indigo-50/85 dark:bg-indigo-950/28",
      accentBorder: "border-indigo-200/80 dark:border-indigo-900/60",
      iconSoft: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-200",
      chip: "border-indigo-200 bg-indigo-100/80 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/25 dark:text-indigo-200",
      action: "bg-indigo-500 hover:bg-indigo-600 text-white",
      outline: "border-indigo-200/80 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-200 dark:hover:bg-indigo-950/30",
      progress: "bg-indigo-500",
    };
  }
  if (colorTheme === "green") {
    return {
      shell: "border-green-200/70 dark:border-green-900/55",
      accentSoft: "bg-green-50/85 dark:bg-green-950/28",
      accentBorder: "border-green-200/80 dark:border-green-900/60",
      iconSoft: "bg-green-500/12 text-green-600 dark:bg-green-400/15 dark:text-green-200",
      chip: "border-green-200 bg-green-100/80 text-green-700 dark:border-green-900/60 dark:bg-green-900/25 dark:text-green-200",
      action: "bg-green-500 hover:bg-green-600 text-white",
      outline: "border-green-200/80 text-green-700 hover:bg-green-50 dark:border-green-900/60 dark:text-green-200 dark:hover:bg-green-950/30",
      progress: "bg-green-500",
    };
  }
  return {
    shell: "border-pink-200/70 dark:border-pink-900/55",
    accentSoft: "bg-pink-50/85 dark:bg-pink-950/28",
    accentBorder: "border-pink-200/80 dark:border-pink-900/60",
    iconSoft: "bg-pink-500/12 text-pink-600 dark:bg-pink-400/15 dark:text-pink-200",
    chip: "border-pink-200 bg-pink-100/80 text-pink-700 dark:border-pink-900/60 dark:bg-pink-900/25 dark:text-pink-200",
    action: "bg-pink-500 hover:bg-pink-600 text-white",
    outline: "border-pink-200/80 text-pink-700 hover:bg-pink-50 dark:border-pink-900/60 dark:text-pink-200 dark:hover:bg-pink-950/30",
    progress: "bg-pink-500",
  };
}

function formatCurrency(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function emptyTargetForm(): TargetFormState {
  return { name: "", targetAmount: "", savedAmount: "", timelineType: "term", deadline: "", termValue: "6", termUnit: "month", note: "" };
}

function emptyWishlistForm(): WishlistFormState {
  return { name: "", price: "", priority: "medium", status: "planning", targetId: "", note: "" };
}

function priorityLabel(priority: WishlistPriority): string {
  if (priority === "high") return "Prioritas";
  if (priority === "medium") return "Sedang";
  return "Santai";
}

function statusLabel(status: WishlistStatus): string {
  if (status === "saving") return "Nabung";
  if (status === "ready") return "Siap";
  if (status === "bought") return "Sudah";
  return "Rencana";
}

function termUnitLabel(unit: "week" | "month" | "year", value?: number | string): string {
  const amount = Number(value || 0);
  if (unit === "week") return amount === 1 ? "minggu" : "minggu";
  if (unit === "year") return amount === 1 ? "tahun" : "tahun";
  return amount === 1 ? "bulan" : "bulan";
}

function formatTargetTimeline(target: SavingsTarget): string | null {
  if (target.timelineType === "term" && target.termValue && target.termUnit) {
    return `${target.termValue} ${termUnitLabel(target.termUnit, target.termValue)}`;
  }
  if (target.deadline) {
    return formatJakartaDate(target.deadline);
  }
  return null;
}

function estimateContributionLabel(target: SavingsTarget): string | null {
  if (target.timelineType !== "term" || !target.termValue || !target.termUnit || target.termValue <= 0) return null;
  const remaining = Math.max(target.targetAmount - target.savedAmount, 0);
  if (remaining <= 0) return "Selesai";

  let divisor = target.termValue;
  let label = "per bulan";
  if (target.termUnit === "week") {
    label = "per minggu";
  }
  if (target.termUnit === "year") {
    divisor = target.termValue * 12;
  }

  const contribution = Math.ceil(remaining / Math.max(divisor, 1));
  return `${formatCurrency(contribution)} ${label}`;
}

export default function GoalsPage() {
  const { colorTheme } = useTheme();
  const themeStyles = buildThemeStyles(colorTheme);
  const pemasukkanState = useInvoicesData("pemasukkan");

  const [targets, setTargets] = useState<SavingsTarget[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editingWishlistId, setEditingWishlistId] = useState<string | null>(null);
  const [targetForm, setTargetForm] = useState<TargetFormState>(emptyTargetForm);
  const [wishlistForm, setWishlistForm] = useState<WishlistFormState>(emptyWishlistForm);
  const [targetError, setTargetError] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadGoals = async () => {
      try {
        const [targetsRes, wishlistRes] = await Promise.all([goalsService.listTargets(), goalsService.listWishlist()]);
        if (!mounted) return;
        setTargets(targetsRes);
        setWishlist(wishlistRes);
        setPageError("");
      } catch (error) {
        if (!mounted) return;
        setPageError(error instanceof ApiError ? error.message : "Gagal memuat target");
      }
    };
    void loadGoals();
    return () => {
      mounted = false;
    };
  }, []);

  const linkedIncomeByTarget = useMemo(() => {
    const map = new Map<string, number>();
    pemasukkanState.invoices.forEach((invoice) => {
      if (!invoice.target_id) return;
      map.set(invoice.target_id, (map.get(invoice.target_id) ?? 0) + invoice.amount);
    });
    return map;
  }, [pemasukkanState.invoices]);

  const targetMap = useMemo(() => new Map(targets.map((item) => [item.id, item])), [targets]);
  const sortedTargets = useMemo(
    () =>
      [...targets].sort((a, b) => {
        const progressB = computeTargetProgress(b, b.savedAmount + (linkedIncomeByTarget.get(b.id) ?? 0));
        const progressA = computeTargetProgress(a, a.savedAmount + (linkedIncomeByTarget.get(a.id) ?? 0));
        return progressB - progressA || a.name.localeCompare(b.name);
      }),
    [linkedIncomeByTarget, targets]
  );
  const sortedWishlist = useMemo(
    () =>
      [...wishlist].sort((a, b) => {
        const statusWeight = { saving: 0, planning: 1, ready: 2, bought: 3 } as const;
        return statusWeight[a.status] - statusWeight[b.status] || a.name.localeCompare(b.name);
      }),
    [wishlist]
  );

  const stats = useMemo(() => {
    const totalTarget = targets.reduce((sum, item) => sum + item.targetAmount, 0);
    const totalSaved = targets.reduce((sum, item) => sum + item.savedAmount + (linkedIncomeByTarget.get(item.id) ?? 0), 0);
    const completed = targets.filter((item) => computeTargetProgress(item, item.savedAmount + (linkedIncomeByTarget.get(item.id) ?? 0)) >= 100).length;
    return {
      targetCount: targets.length,
      wishlistCount: wishlist.length,
      totalTarget,
      totalSaved,
      completed,
      wishlistValue: wishlist.reduce((sum, item) => sum + item.price, 0),
    };
  }, [linkedIncomeByTarget, targets, wishlist]);

  const openCreateTarget = () => {
    setEditingTargetId(null);
    setTargetForm(emptyTargetForm());
    setTargetError("");
    setTargetDialogOpen(true);
  };

  const openEditTarget = (target: SavingsTarget) => {
    setEditingTargetId(target.id);
    setTargetForm({
      name: target.name,
      targetAmount: formatCurrencyInput(String(target.targetAmount)),
      savedAmount: formatCurrencyInput(String(target.savedAmount)),
      timelineType: target.timelineType === "term" ? "term" : "date",
      deadline: target.deadline ?? "",
      termValue: target.termValue ? String(target.termValue) : "6",
      termUnit: target.termUnit ?? "month",
      note: target.note ?? "",
    });
    setTargetError("");
    setTargetDialogOpen(true);
  };

  const saveTarget = async () => {
    const name = targetForm.name.trim();
    const targetAmount = parseCurrencyInput(targetForm.targetAmount);
    const savedAmount = parseCurrencyInput(targetForm.savedAmount);
    const termValue = Number(targetForm.termValue.replace(/[^\d]/g, ""));

    if (!name) return setTargetError("Nama target wajib diisi.");
    if (targetAmount <= 0) return setTargetError("Nominal target belum valid.");
    if (targetForm.timelineType === "date" && !targetForm.deadline) return setTargetError("Pilih tanggal target.");
    if (targetForm.timelineType === "term" && (!termValue || termValue <= 0)) return setTargetError("Isi jangka target.");

    try {
      const payload = {
        name,
        target_amount: targetAmount,
        saved_amount: savedAmount,
        timeline_type: targetForm.timelineType,
        deadline: targetForm.timelineType === "date" ? targetForm.deadline || undefined : undefined,
        term_value: targetForm.timelineType === "term" ? termValue : undefined,
        term_unit: targetForm.timelineType === "term" ? targetForm.termUnit : undefined,
        note: targetForm.note.trim() || undefined,
      };

      const nextItem = editingTargetId
        ? await goalsService.updateTarget(editingTargetId, payload)
        : await goalsService.createTarget(payload);

      setTargets((prev) => {
        const next = prev.some((item) => item.id === nextItem.id) ? prev.map((item) => (item.id === nextItem.id ? nextItem : item)) : [...prev, nextItem];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setTargetDialogOpen(false);
      setTargetForm(emptyTargetForm());
      setTargetError("");
    } catch (error) {
      setTargetError(error instanceof ApiError ? error.message : "Gagal menyimpan target");
    }
  };

  const deleteTarget = async (targetId: string) => {
    try {
      await goalsService.deleteTarget(targetId);
      setTargets((prev) => prev.filter((item) => item.id !== targetId));
      setWishlist((prev) => prev.map((item) => (item.targetId === targetId ? { ...item, targetId: undefined } : item)));
    } catch (error) {
      setPageError(error instanceof ApiError ? error.message : "Gagal menghapus target");
    }
  };

  const openCreateWishlist = () => {
    setEditingWishlistId(null);
    setWishlistForm(emptyWishlistForm());
    setWishlistError("");
    setWishlistDialogOpen(true);
  };

  const openEditWishlist = (item: WishlistItem) => {
    setEditingWishlistId(item.id);
    setWishlistForm({
      name: item.name,
      price: formatCurrencyInput(String(item.price)),
      priority: item.priority,
      status: item.status,
      targetId: item.targetId ?? "",
      note: item.note ?? "",
    });
    setWishlistError("");
    setWishlistDialogOpen(true);
  };

  const saveWishlist = async () => {
    const name = wishlistForm.name.trim();
    const price = parseCurrencyInput(wishlistForm.price);

    if (!name) return setWishlistError("Nama wishlist wajib diisi.");
    if (price <= 0) return setWishlistError("Nominal wishlist belum valid.");

    try {
      const payload = {
        name,
        price,
        priority: wishlistForm.priority,
        status: wishlistForm.status,
        target_id: wishlistForm.targetId ? Number(wishlistForm.targetId) : 0,
        note: wishlistForm.note.trim() || undefined,
      };

      const nextItem = editingWishlistId
        ? await goalsService.updateWishlist(editingWishlistId, payload)
        : await goalsService.createWishlist(payload);

      setWishlist((prev) => {
        const next = prev.some((item) => item.id === nextItem.id) ? prev.map((item) => (item.id === nextItem.id ? nextItem : item)) : [...prev, nextItem];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setWishlistDialogOpen(false);
      setWishlistForm(emptyWishlistForm());
      setWishlistError("");
    } catch (error) {
      setWishlistError(error instanceof ApiError ? error.message : "Gagal menyimpan wishlist");
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    try {
      await goalsService.deleteWishlist(wishlistId);
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch (error) {
      setPageError(error instanceof ApiError ? error.message : "Gagal menghapus wishlist");
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {pageError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{pageError}</div>}
      <section className={cn("rounded-[24px] border p-4 md:p-5", themeStyles.shell, themeStyles.accentSoft)}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", themeStyles.iconSoft, themeStyles.accentBorder)}>
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white md:text-3xl">Target</h1>
                <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", themeStyles.chip)}>{stats.targetCount} target</div>
                <div className={cn("rounded-full border px-3 py-1 text-xs font-medium", themeStyles.chip)}>{stats.wishlistCount} wishlist</div>
              </div>
          </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={openCreateTarget} className={cn("rounded-full text-white", themeStyles.action)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Target
            </Button>
            <Button type="button" variant="outline" onClick={openCreateWishlist} className={cn("rounded-full", themeStyles.outline)}>
              <Gift className="mr-1.5 h-4 w-4" />
              Wishlist
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MiniStat title="Terkumpul" value={formatCurrency(stats.totalSaved)} icon={PiggyBank} styles={themeStyles} />
          <MiniStat title="Target" value={formatCurrency(stats.totalTarget)} icon={Flag} styles={themeStyles} />
          <MiniStat title="Selesai" value={`${stats.completed}`} icon={Sparkles} styles={themeStyles} />
          <MiniStat title="Wishlist" value={formatCurrency(stats.wishlistValue)} icon={Gift} styles={themeStyles} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.95fr]">
        <div className={cn("rounded-[24px] border p-4 md:p-5", themeStyles.shell, "bg-white/85 dark:bg-slate-950/70")}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-neutral-950 dark:text-white">Target tabungan</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Fokus utama yang sedang kamu kejar.</p>
            </div>
            <Button type="button" size="sm" variant="outline" className={cn("rounded-full", themeStyles.outline)} onClick={openCreateTarget}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah
            </Button>
          </div>

          {sortedTargets.length === 0 ? (
            <EmptyState icon={Target} title="Belum ada target" actionLabel="Buat target" onAction={openCreateTarget} styles={themeStyles} />
          ) : (
            <div className="space-y-3">
              {sortedTargets.map((item) => {
                const linkedSaved = linkedIncomeByTarget.get(item.id) ?? 0;
                const totalSaved = item.savedAmount + linkedSaved;
                const progress = computeTargetProgress(item, totalSaved);
                const timelineLabel = formatTargetTimeline(item);
                const contributionLabel = estimateContributionLabel({ ...item, savedAmount: totalSaved });
                return (
                  <div key={item.id} className={cn("rounded-[22px] border p-4 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.35)]", themeStyles.accentSoft, themeStyles.accentBorder)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-neutral-950 dark:text-white">{item.name}</p>
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", themeStyles.chip)}>{progress.toFixed(0)}%</span>
                        </div>
                        <p className="mt-3 text-[1.35rem] font-semibold leading-none tracking-tight text-neutral-950 dark:text-white md:text-[1.55rem]">
                          {formatCurrency(totalSaved)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">dari {formatCurrency(item.targetAmount)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button type="button" size="sm" variant="outline" className={cn("h-9 w-9 rounded-full px-0", themeStyles.outline)} onClick={() => openEditTarget(item)} aria-label="Edit target">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-9 w-9 rounded-full px-0 text-red-600 hover:text-red-700" onClick={() => deleteTarget(item.id)} aria-label="Hapus target">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-neutral-500 dark:text-slate-400">
                        <span>Terkumpul</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-neutral-200/80 dark:bg-slate-800">
                        <div className={cn("h-full rounded-full transition-all duration-500", themeStyles.progress)} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {timelineLabel && (
                        <div className={cn("rounded-[16px] border px-3 py-2.5", themeStyles.accentBorder, "bg-white/70 dark:bg-slate-950/55")}>
                          <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 dark:text-slate-400">
                            {item.timelineType === "term" ? <Clock3 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                            <span>{item.timelineType === "term" ? "Jangka" : "Tanggal"}</span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-neutral-950 dark:text-white">{timelineLabel}</p>
                        </div>
                      )}

                      <div className={cn("rounded-[16px] border px-3 py-2.5", themeStyles.accentBorder, "bg-white/70 dark:bg-slate-950/55")}>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 dark:text-slate-400">
                          <PiggyBank className="h-3.5 w-3.5" />
                          <span>{item.timelineType === "term" ? "Ritme" : "Target"}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-neutral-950 dark:text-white">
                          {contributionLabel ?? formatCurrencyCompactLabel(item.targetAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={cn("rounded-full border px-2.5 py-1 font-semibold", themeStyles.chip)}>
                        {formatCurrencyCompactLabel(item.targetAmount)}
                      </span>
                      {timelineLabel && (
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold", themeStyles.chip)}>
                          {item.timelineType === "term" ? <Clock3 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                          {timelineLabel}
                        </span>
                      )}
                    </div>

                    {item.note && <p className="mt-3 text-sm text-neutral-600 dark:text-slate-300">{item.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={cn("rounded-[24px] border p-4 md:p-5", themeStyles.shell, "bg-white/85 dark:bg-slate-950/70")}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-neutral-950 dark:text-white">Wishlist</p>
              <p className="text-sm text-neutral-500 dark:text-slate-400">Keinginan yang bisa dihubungkan ke target.</p>
            </div>
            <Button type="button" size="sm" variant="outline" className={cn("rounded-full", themeStyles.outline)} onClick={openCreateWishlist}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah
            </Button>
          </div>

          {sortedWishlist.length === 0 ? (
            <EmptyState icon={Gift} title="Belum ada wishlist" actionLabel="Tambah wishlist" onAction={openCreateWishlist} styles={themeStyles} />
          ) : (
            <div className="space-y-3">
              {sortedWishlist.map((item) => {
                const linkedTarget = item.targetId ? targetMap.get(item.targetId) : undefined;
                const linkedProgress = linkedTarget ? computeTargetProgress(linkedTarget) : 0;
                return (
                  <div key={item.id} className={cn("rounded-[20px] border p-4", themeStyles.accentSoft, themeStyles.accentBorder)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-neutral-950 dark:text-white">{item.name}</p>
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", themeStyles.chip)}>{statusLabel(item.status)}</span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-slate-400">{formatCurrency(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button type="button" size="sm" variant="outline" className={cn("h-9 w-9 rounded-full px-0", themeStyles.outline)} onClick={() => openEditWishlist(item)} aria-label="Edit wishlist">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-9 w-9 rounded-full px-0 text-red-600 hover:text-red-700" onClick={() => deleteWishlist(item.id)} aria-label="Hapus wishlist">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className={cn("rounded-full border px-2.5 py-1 font-medium", themeStyles.chip)}>{priorityLabel(item.priority)}</span>
                      {linkedTarget && <span className={cn("rounded-full border px-2.5 py-1 font-medium", themeStyles.chip)}>{linkedTarget.name}</span>}
                    </div>

                    {linkedTarget && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500 dark:text-slate-400">
                          <span>Progress target</span>
                          <span>{linkedProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-200 dark:bg-slate-800">
                          <div className={cn("h-full rounded-full", themeStyles.progress)} style={{ width: `${linkedProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {item.note && <p className="mt-3 text-sm text-neutral-600 dark:text-slate-300">{item.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-lg border bg-white/95 dark:bg-slate-950/95", themeStyles.shell)}>
          <DialogHeader>
            <DialogTitle>{editingTargetId ? "Edit target" : "Tambah target"}</DialogTitle>
            <DialogDescription>Nominal, ritme, selesai.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Nama target" value={targetForm.name} onChange={(e) => setTargetForm((prev) => ({ ...prev, name: e.target.value }))} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Nominal target" inputMode="numeric" value={targetForm.targetAmount} onChange={(e) => setTargetForm((prev) => ({ ...prev, targetAmount: formatCurrencyInput(e.target.value) }))} />
              <Input placeholder="Sudah terkumpul" inputMode="numeric" value={targetForm.savedAmount} onChange={(e) => setTargetForm((prev) => ({ ...prev, savedAmount: formatCurrencyInput(e.target.value) }))} />
            </div>
            <div className={cn("rounded-[20px] border p-2", themeStyles.accentSoft, themeStyles.accentBorder)}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "term", label: "Jangka", icon: Clock3 },
                  { key: "date", label: "Tanggal", icon: CalendarDays },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = targetForm.timelineType === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setTargetForm((prev) => ({
                          ...prev,
                          timelineType: item.key as "date" | "term",
                        }))
                      }
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-[16px] px-3 py-2.5 text-sm font-medium transition",
                        active ? cn(themeStyles.chip, "shadow-sm") : "bg-white/80 text-neutral-500 hover:bg-white dark:bg-slate-950/70 dark:text-slate-300 dark:hover:bg-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2">
                {targetForm.timelineType === "date" ? (
                  <DatePickerDialog
                    value={targetForm.deadline}
                    onChange={(value) => setTargetForm((prev) => ({ ...prev, deadline: value }))}
                    placeholder="Pilih tanggal"
                    className="h-11 rounded-[16px]"
                  />
                ) : (
                  <div className="grid grid-cols-[1fr_0.9fr] gap-2">
                    <Input
                      placeholder="Jangka"
                      inputMode="numeric"
                      value={targetForm.termValue}
                      onChange={(e) => setTargetForm((prev) => ({ ...prev, termValue: e.target.value.replace(/[^\d]/g, "") }))}
                      className="h-11 rounded-[16px]"
                    />
                    <Select value={targetForm.termUnit} onValueChange={(value) => setTargetForm((prev) => ({ ...prev, termUnit: value as "week" | "month" | "year" }))}>
                      <SelectTrigger className="h-11 rounded-[16px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Minggu</SelectItem>
                        <SelectItem value="month">Bulan</SelectItem>
                        <SelectItem value="year">Tahun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <Textarea placeholder="Catatan singkat" value={targetForm.note} onChange={(e) => setTargetForm((prev) => ({ ...prev, note: e.target.value }))} />
            {targetError && <p className="text-sm text-red-600">{targetError}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setTargetDialogOpen(false)}>Batal</Button>
            <Button type="button" className={themeStyles.action} onClick={saveTarget}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={wishlistDialogOpen} onOpenChange={setWishlistDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-lg border bg-white/95 dark:bg-slate-950/95", themeStyles.shell)}>
          <DialogHeader>
            <DialogTitle>{editingWishlistId ? "Edit wishlist" : "Tambah wishlist"}</DialogTitle>
            <DialogDescription>Simpan barang atau tujuan belanja yang ingin dibeli.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Nama wishlist" value={wishlistForm.name} onChange={(e) => setWishlistForm((prev) => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="Nominal wishlist" inputMode="numeric" value={wishlistForm.price} onChange={(e) => setWishlistForm((prev) => ({ ...prev, price: formatCurrencyInput(e.target.value) }))} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select value={wishlistForm.priority} onValueChange={(value) => setWishlistForm((prev) => ({ ...prev, priority: value as WishlistPriority }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Prioritas</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Santai</SelectItem>
                </SelectContent>
              </Select>

              <Select value={wishlistForm.status} onValueChange={(value) => setWishlistForm((prev) => ({ ...prev, status: value as WishlistStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Rencana</SelectItem>
                  <SelectItem value="saving">Nabung</SelectItem>
                  <SelectItem value="ready">Siap</SelectItem>
                  <SelectItem value="bought">Sudah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={wishlistForm.targetId || "__none__"} onValueChange={(value) => setWishlistForm((prev) => ({ ...prev, targetId: value === "__none__" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Hubungkan ke target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Tanpa target</SelectItem>
                {targets.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea placeholder="Catatan singkat" value={wishlistForm.note} onChange={(e) => setWishlistForm((prev) => ({ ...prev, note: e.target.value }))} />
            {wishlistError && <p className="text-sm text-red-600">{wishlistError}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setWishlistDialogOpen(false)}>Batal</Button>
            <Button type="button" className={themeStyles.action} onClick={saveWishlist}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon: Icon,
  styles,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  styles: ReturnType<typeof buildThemeStyles>;
}) {
  return (
    <div className={cn("rounded-[20px] border p-4 md:p-5", styles.accentSoft, styles.accentBorder)}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("rounded-2xl p-3", styles.iconSoft)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium text-neutral-500 dark:text-slate-400">{title}</p>
      </div>
      <p className="mt-5 text-xl font-semibold tracking-tight text-neutral-950 dark:text-white md:text-2xl">{value}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  actionLabel,
  onAction,
  styles,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  actionLabel: string;
  onAction: () => void;
  styles: ReturnType<typeof buildThemeStyles>;
}) {
  return (
    <div className="rounded-[20px] border border-dashed p-8 text-center">
      <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-2xl", styles.iconSoft)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-neutral-950 dark:text-white">{title}</p>
      <Button type="button" size="sm" onClick={onAction} className={cn("mt-4 rounded-full text-white", styles.action)}>
        <Plus className="mr-1.5 h-4 w-4" />
        {actionLabel}
      </Button>
    </div>
  );
}
