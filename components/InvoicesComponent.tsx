"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { ApiError, cateringService, goalsService, useInvoicesData } from "@/lib/api";
import type { CateringMenu } from "@/lib/api";
import { isSalesCategory } from "@/lib/catering-config";
import type { InvoiceType } from "@/lib/api";
import type { Invoice } from "@/lib/api";
import { InvoiceFormDialog } from "@/components/InvoiceFormDialog";
import { Pencil, Trash2, ChevronLeft, ChevronRight, CalendarDays, Search, Plus, ListFilter } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getAccountsAsync, type Account } from "@/lib/accounts-storage";
import { formatJakartaDateLabel, formatJakartaMonthLabel, getJakartaMonthDate, getJakartaMonthParts, getJakartaToday } from "@/lib/date-time";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-input";
import type { SavingsTarget } from "@/lib/goals-storage";

function buildNoteWithTags(note: string, tagsInput: string): string {
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");
  return tags ? `${note.trim()} ${tags}`.trim() : note.trim();
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  return formatJakartaMonthLabel(date);
}

function formatDateLabel(dateStr: string): string {
  return formatJakartaDateLabel(dateStr);
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type CalendarCell = {
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
};

function buildMonthCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstOfMonth.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];

  if (firstDayIndex > 0) {
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const d = new Date(year, month - 1, day);
      cells.push({ date: toLocalDateInputValue(d), dayNumber: day, inCurrentMonth: false });
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ date: toLocalDateInputValue(d), dayNumber: day, inCurrentMonth: true });
  }

  while (cells.length < 42) {
    const nextDay = cells.length - (firstDayIndex + daysInMonth) + 1;
    const d = new Date(year, month + 1, nextDay);
    cells.push({ date: toLocalDateInputValue(d), dayNumber: nextDay, inCurrentMonth: false });
  }

  return cells;
}

function InvoicesPage({ title, type }: { title: string; type: InvoiceType }) {
  const {
    invoices: data,
    categories: apiCategories,
    loading,
    error: apiError,
    refetch,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  } = useInvoicesData(type);

  const todayStr = getJakartaToday();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [monthCursor, setMonthCursor] = useState(() => getJakartaMonthDate());
  const [monthDirection, setMonthDirection] = useState(1);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(() => getJakartaMonthParts().month);
  const [draftYear, setDraftYear] = useState(() => getJakartaMonthParts().year);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: getJakartaToday(),
    amount: "",
    note: "",
    category: "",
    tags: "",
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [targets, setTargets] = useState<SavingsTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [cateringMenus, setCateringMenus] = useState<CateringMenu[]>([]);
  const [cateringMenusLoading, setCateringMenusLoading] = useState(false);
  const [selectedCateringMenuId, setSelectedCateringMenuId] = useState<string | null>(null);
  const [cateringQty, setCateringQty] = useState("1");

  const perPage = 10;
  const { colorTheme } = useTheme();
  const themeStyles = useMemo(() => {
    if (colorTheme === "pink") {
      return {
        calendarTitle: "text-pink-600 dark:text-pink-400",
        weekdayText: "text-pink-500/90 dark:text-pink-300/90",
        currentMonthText: "text-pink-700 dark:text-pink-200",
        currentMonthBorder: "border-pink-200/80 dark:border-pink-900/60",
        hasDataBorder: "border-pink-300 dark:border-pink-700",
        hasDataBg: "bg-pink-50/50 dark:bg-pink-900/20",
        hasDataDot: "bg-pink-500",
        hasDataText: "text-pink-700 dark:text-pink-300",
        calendarShell: "border-pink-200/90 dark:border-pink-900/60 bg-gradient-to-b from-pink-50/80 via-white to-pink-50/40 dark:from-pink-950/30 dark:via-slate-900/80 dark:to-pink-950/20",
        monthButton: "border-pink-200/80 text-pink-600 hover:bg-pink-50 dark:border-pink-900/60 dark:text-pink-300 dark:hover:bg-pink-900/20",
        cellSelected: "bg-pink-100/80 dark:bg-pink-900/35 shadow-[0_6px_18px_-10px_rgba(236,72,153,0.8)]",
      };
    }

    if (colorTheme === "sky") {
      return {
        calendarTitle: "text-sky-600 dark:text-sky-400",
        weekdayText: "text-sky-500/90 dark:text-sky-300/90",
        currentMonthText: "text-sky-700 dark:text-sky-200",
        currentMonthBorder: "border-sky-200/80 dark:border-sky-900/60",
        hasDataBorder: "border-sky-300 dark:border-sky-700",
        hasDataBg: "bg-sky-50/50 dark:bg-sky-900/20",
        hasDataDot: "bg-sky-500",
        hasDataText: "text-sky-700 dark:text-sky-300",
        calendarShell: "border-sky-200/90 dark:border-sky-900/60 bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 dark:from-sky-950/30 dark:via-slate-900/80 dark:to-sky-950/20",
        monthButton: "border-sky-200/80 text-sky-600 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-300 dark:hover:bg-sky-900/20",
        cellSelected: "bg-sky-100/80 dark:bg-sky-900/35 shadow-[0_6px_18px_-10px_rgba(14,165,233,0.85)]",
      };
    }

    if (colorTheme === "indigo") {
      return {
        calendarTitle: "text-indigo-600 dark:text-indigo-400",
        weekdayText: "text-indigo-500/90 dark:text-indigo-300/90",
        currentMonthText: "text-indigo-700 dark:text-indigo-200",
        currentMonthBorder: "border-indigo-200/80 dark:border-indigo-900/60",
        hasDataBorder: "border-indigo-300 dark:border-indigo-700",
        hasDataBg: "bg-indigo-50/50 dark:bg-indigo-900/20",
        hasDataDot: "bg-indigo-500",
        hasDataText: "text-indigo-700 dark:text-indigo-300",
        calendarShell: "border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-indigo-950/20",
        monthButton: "border-indigo-200/80 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-900/20",
        cellSelected: "bg-indigo-100/80 dark:bg-indigo-900/35 shadow-[0_6px_18px_-10px_rgba(99,102,241,0.85)]",
      };
    }

    return {
      calendarTitle: "text-green-600 dark:text-green-400",
      weekdayText: "text-green-500/90 dark:text-green-300/90",
      currentMonthText: "text-green-700 dark:text-green-200",
      currentMonthBorder: "border-green-200/80 dark:border-green-900/60",
      hasDataBorder: "border-green-300 dark:border-green-700",
      hasDataBg: "bg-green-50/50 dark:bg-green-900/20",
      hasDataDot: "bg-green-500",
      hasDataText: "text-green-700 dark:text-green-300",
      calendarShell: "border-green-200/90 dark:border-green-900/60 bg-gradient-to-b from-green-50/80 via-white to-green-50/40 dark:from-green-950/30 dark:via-slate-900/80 dark:to-green-950/20",
      monthButton: "border-green-200/80 text-green-600 hover:bg-green-50 dark:border-green-900/60 dark:text-green-300 dark:hover:bg-green-900/20",
      cellSelected: "bg-green-100/80 dark:bg-green-900/35 shadow-[0_6px_18px_-10px_rgba(34,197,94,0.8)]",
    };
  }, [colorTheme]);

  const categories = useMemo(() => {
    const categoryNamesFromApi = apiCategories.map((c) => c.name);
    const categoryNamesFromData = Array.from(new Set(data.map((d) => d.category)));
    return Array.from(new Set([...categoryNamesFromApi, ...categoryNamesFromData]));
  }, [apiCategories, data]);

  const isEditMode = editingInvoice != null;
  const activeMonthKey = toMonthKey(monthCursor);

  const monthRows = useMemo(() => data.filter((d) => d.date.startsWith(activeMonthKey)), [data, activeMonthKey]);
  const monthTotal = useMemo(() => monthRows.reduce((sum, row) => sum + row.amount, 0), [monthRows]);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    monthRows.forEach((item) => {
      map.set(item.date, (map.get(item.date) ?? 0) + item.amount);
    });
    return map;
  }, [monthRows]);

  const selectedRows = useMemo(() => {
    let rows = data.filter((d) => d.date === selectedDate);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.note.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          (d.catering_menu?.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (sortBy) rows = rows.filter((d) => d.category === sortBy);
    return rows;
  }, [data, selectedDate, search, sortBy]);

  const activeRows = selectedRows;
  const totalPages = Math.max(1, Math.ceil(activeRows.length / perPage));
  const paginated = activeRows.slice((page - 1) * perPage, page * perPage);

  const selectedTotal = selectedDate ? dayTotals.get(selectedDate) ?? 0 : 0;
  const cells = useMemo(() => buildMonthCells(monthCursor), [monthCursor]);
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((acc) => map.set(acc.id, acc.name));
    return map;
  }, [accounts]);

  useEffect(() => {
    let mounted = true;
    getAccountsAsync().then((data) => {
      if (mounted) setAccounts(data);
    });
    return () => {
      mounted = false;
    };
  }, [isDialogOpen, isDayModalOpen]);

  useEffect(() => {
    let mounted = true;
    if (type !== "pemasukkan") {
      setTargets([]);
      return;
    }

    const loadTargets = async () => {
      try {
        const items = await goalsService.listTargets();
        if (mounted) setTargets(items);
      } catch (error) {
        if (mounted && error instanceof ApiError) {
          setTargets([]);
        }
      }
    };

    void loadTargets();
    return () => {
      mounted = false;
    };
  }, [type]);

  useEffect(() => {
    if (!isDialogOpen || type !== "pemasukkan") return;
    let mounted = true;
    setCateringMenusLoading(true);
    cateringService
      .listMenus()
      .then((menus) => {
        if (mounted) setCateringMenus(menus.filter((m) => m.is_active !== false));
      })
      .catch(() => {
        if (mounted) setCateringMenus([]);
      })
      .finally(() => {
        if (mounted) setCateringMenusLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isDialogOpen, type]);

  useEffect(() => {
    if (!isSalesCategory(formData.category)) {
      setSelectedCateringMenuId(null);
      setCateringQty("1");
    }
  }, [formData.category]);

  const handleCateringMenuChange = (menuId: string | null) => {
    setSelectedCateringMenuId(menuId);
    if (!menuId || type !== "pemasukkan" || !isSalesCategory(formData.category)) return;
    const menu = cateringMenus.find((m) => String(m.id) === menuId);
    if (!menu) return;
    const q = Math.max(1, parseInt(cateringQty, 10) || 1);
    setFormData((prev) => ({ ...prev, amount: formatCurrencyInput(String(menu.default_price * q)) }));
  };

  const handleCateringQtyChange = (qty: string) => {
    setCateringQty(qty);
    const qtyNum = Math.max(1, parseInt(qty, 10) || 1);
    if (!selectedCateringMenuId || type !== "pemasukkan" || !isSalesCategory(formData.category)) return;
    const menu = cateringMenus.find((m) => String(m.id) === selectedCateringMenuId);
    if (!menu) return;
    setFormData((prev) => ({ ...prev, amount: formatCurrencyInput(String(menu.default_price * qtyNum)) }));
  };

  const handleSubmitInvoice = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.amount || !formData.note || !formData.category) {
      setErrorMessage("Mohon isi semua field!");
      return;
    }

    if (
      type === "pemasukkan" &&
      isSalesCategory(formData.category) &&
      cateringMenus.length > 0 &&
      !selectedCateringMenuId
    ) {
      setErrorMessage("Pilih menu catering untuk kategori penjualan ini (atau tambah menu di halaman Catering).");
      return;
    }

    setErrorMessage("");
    setSubmitting(true);

    const noteWithTags = buildNoteWithTags(formData.note, formData.tags);
    const cateringExtra =
      type === "pemasukkan" && isSalesCategory(formData.category) && selectedCateringMenuId
        ? {
            catering_menu_id: Number(selectedCateringMenuId),
            catering_quantity: Math.max(1, parseInt(cateringQty, 10) || 1),
          }
        : {};

    const payload = {
      date: formData.date,
      amount: parseCurrencyInput(formData.amount),
      note: noteWithTags,
      category: formData.category,
      ...(type === "pemasukkan" ? { target_id: selectedTargetId ? Number(selectedTargetId) : 0 } : {}),
      account_id: selectedAccountId ? Number(selectedAccountId) : undefined,
      ...cateringExtra,
    };

    if (isEditMode && editingInvoice) {
      const updated = await updateInvoice(editingInvoice.id, payload);
      setSubmitting(false);
      if (updated) {
        setEditingInvoice(null);
        setIsDialogOpen(false);
        resetFormAndClose();
      } else {
        setErrorMessage("Gagal mengubah. Cek koneksi atau backend.");
      }
      return;
    }

    const created = await createInvoice({ ...payload });
    setSubmitting(false);
    if (created) {
      resetFormAndClose();
      setPage(1);
    } else {
      setErrorMessage("Gagal menyimpan. Cek koneksi atau backend.");
    }
  };

  function resetFormAndClose() {
    setFormData({
      date: selectedDate || getJakartaToday(),
      amount: "",
      note: "",
      category: "",
      tags: "",
    });
    setEditingInvoice(null);
    setIsCustomCategory(false);
    setSelectedAccountId(null);
    setSelectedTargetId(null);
    setSelectedCateringMenuId(null);
    setCateringQty("1");
    setFormKey((prev) => prev + 1);
    setIsDialogOpen(false);
    setErrorMessage("");
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingInvoice(null);
      resetFormAndClose();
    } else {
      setErrorMessage("");
    }
  };

  function parseTagsFromNote(note: string): string {
    const matches = note.match(/#[\w\u00a0-\u024f]+/gi) || [];
    return matches.map((m) => m.slice(1)).join(", ");
  }

  function noteWithoutTags(note: string): string {
    return note.replace(/\s*#[\w\u00a0-\u024f]+/gi, "").trim();
  }

  const openEditDialog = (inv: Invoice) => {
    setEditingInvoice(inv);
    setFormData({
      date: inv.date,
      amount: formatCurrencyInput(String(inv.amount)),
      note: noteWithoutTags(inv.note),
      category: inv.category,
      tags: parseTagsFromNote(inv.note),
    });
    setSelectedAccountId(inv.account_id ? String(inv.account_id) : null);
    setSelectedTargetId(type === "pemasukkan" ? (inv.target_id ? String(inv.target_id) : null) : null);
    setSelectedCateringMenuId(inv.catering_menu_id != null ? String(inv.catering_menu_id) : null);
    setCateringQty(inv.catering_quantity != null && inv.catering_quantity > 0 ? String(inv.catering_quantity) : "1");
    setFormKey((prev) => prev + 1);
    setIsDialogOpen(true);
    setErrorMessage("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId == null) return;
    const deletingId = deleteConfirmId;
    const ok = await deleteInvoice(deleteConfirmId);
    setDeleteConfirmId(null);
    if (ok) {
      setPage((p) => Math.max(1, p - 1));
    }
  };

  const openDayModal = (date: string) => {
    setSelectedDate(date);
    setSearch("");
    setSortBy(null);
    setPage(1);
    setIsDayModalOpen(true);
  };

  const openMonthPicker = () => {
    setDraftMonth(monthCursor.getMonth() + 1);
    setDraftYear(monthCursor.getFullYear());
    setIsMonthPickerOpen(true);
  };

  const applyMonthPicker = () => {
    if (draftMonth < 1 || draftMonth > 12) return;
    if (draftYear < 2000 || draftYear > 2100) return;
    const target = new Date(draftYear, draftMonth - 1, 1);
    setMonthDirection(target.getTime() >= monthCursor.getTime() ? 1 : -1);
    setMonthCursor(target);
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto bg-white/50 dark:bg-slate-900/60 rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm flex flex-col border dark:border-slate-800/50">
      <div className="w-full space-y-3.5 flex-1 flex flex-col overflow-visible">
        {apiError && (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            <span>{apiError}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
              Coba lagi
            </Button>
          </div>
        )}

        <>
            <div
              className={cn(
                "rounded-2xl border p-4 sm:p-5 text-white relative overflow-hidden",
                colorTheme === "pink" && "border-pink-300/60 bg-gradient-to-br from-pink-500 to-pink-600",
                colorTheme === "sky" && "border-sky-300/60 bg-gradient-to-br from-sky-500 to-sky-600",
                colorTheme === "indigo" && "border-indigo-300/60 bg-gradient-to-br from-indigo-500 to-indigo-600",
                colorTheme === "green" && "border-green-300/60 bg-gradient-to-br from-green-500 to-green-600"
              )}
            >
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-center">
                {title} {monthLabel(monthCursor)}
              </motion.p>
              <motion.p
                key={activeMonthKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "text-xl sm:text-2xl font-bold mt-1 text-center",
                  "text-white"
                )}
              >
                {formatCurrency(monthTotal)}
              </motion.p>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15" />
              <div className="absolute -left-6 -bottom-10 h-20 w-20 rounded-full bg-white/10" />
            </div>

            <div
              className={cn(
                "rounded-3xl border p-3.5 sm:p-4 relative overflow-hidden shadow-sm",
                themeStyles.calendarShell
              )}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/45 blur-xl dark:bg-white/5" />
              <div className="pointer-events-none absolute -left-8 -bottom-14 h-24 w-24 rounded-full bg-white/30 blur-xl dark:bg-white/5" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-slate-800/70">
                    <CalendarDays className={cn("w-4 h-4", themeStyles.calendarTitle)} />
                  </span>
                  <p className={cn("font-semibold tracking-wide", themeStyles.calendarTitle)}>Kalender {title}</p>
                </div>

                <div className="flex w-full max-w-md self-center items-center gap-2 sm:max-w-none">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                    onClick={() => {
                      setMonthDirection(-1);
                      setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                    }}
                    aria-label="Bulan sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-9 sm:h-10 flex-1 text-sm justify-center rounded-full border bg-white/70 dark:bg-slate-800/60 sm:text-base",
                      themeStyles.monthButton
                    )}
                    onClick={openMonthPicker}
                    aria-label="Buka pemilih bulan"
                  >
                    {monthLabel(monthCursor)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                    onClick={() => {
                      setMonthDirection(1);
                      setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                    }}
                    aria-label="Bulan berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className={cn("grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-semibold mb-2 mt-4", themeStyles.weekdayText)}>
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeMonthKey}
                  initial={{ opacity: 0, x: monthDirection * 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: monthDirection * -16 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-7 gap-1 sm:gap-1.5"
                >
                  {cells.map((cell) => {
                  const total = dayTotals.get(cell.date) ?? 0;
                  const isToday = cell.date === todayStr;
                  const isSelected = cell.date === selectedDate;
                  const hasData = total > 0;

                  return (
                    <motion.button
                      layout
                      key={cell.date}
                      type="button"
                      onClick={() => openDayModal(cell.date)}
                      className={cn(
                        "relative min-h-[52px] sm:min-h-[60px] rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 flex items-center justify-center transition-all duration-500 ease-out hover:shadow-md active:scale-[0.99]",
                        cell.inCurrentMonth
                          ? cn("bg-white dark:bg-slate-950/40", themeStyles.currentMonthBorder, themeStyles.currentMonthText)
                          : "bg-neutral-100/70 text-neutral-400 border-neutral-200 dark:bg-slate-900/30 dark:text-slate-500 dark:border-slate-800",
                        hasData && themeStyles.hasDataBorder,
                        hasData && themeStyles.hasDataBg,
                        colorTheme === "pink" && "hover:border-pink-300 hover:ring-2 hover:ring-pink-300/70",
                        colorTheme === "sky" && "hover:border-sky-300 hover:ring-2 hover:ring-sky-300/70",
                        colorTheme === "indigo" && "hover:border-indigo-300 hover:ring-2 hover:ring-indigo-300/70",
                        colorTheme === "green" && "hover:border-green-300 hover:ring-2 hover:ring-green-300/70",
                        isSelected && "shadow-md",
                        isToday &&
                          (colorTheme === "pink"
                            ? "ring-2 ring-pink-400 border-pink-300"
                            : colorTheme === "sky"
                              ? "ring-2 ring-sky-400 border-sky-300"
                              : colorTheme === "indigo"
                                ? "ring-2 ring-indigo-400 border-indigo-300"
                                : "ring-2 ring-green-400 border-green-300"),
                        isSelected && themeStyles.cellSelected
                      )}
                      >
                      <p className="text-[11px] sm:text-xs font-semibold">{cell.dayNumber}</p>
                      {hasData && (
                        <>
                          <span className={cn("absolute top-1.5 right-1.5 inline-block h-1.5 w-1.5 rounded-full", themeStyles.hasDataDot)} />
                        </>
                      )}
                    </motion.button>
                  );
                })}
                </motion.div>
              </AnimatePresence>
              {/* <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 sm:hidden">
                Titik berwarna menandakan ada transaksi. Tap tanggal untuk lihat detail.
              </p> */}
            </div>
        </>

        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-300 dark:border-slate-600 border-t-transparent" />
          </div>
        )}
      </div>

      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent
          className={cn(
            "w-[92vw] max-w-2xl p-4 md:p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border",
            colorTheme === "pink" && "border-pink-200 dark:border-pink-900/50",
            colorTheme === "sky" && "border-sky-200 dark:border-sky-900/50",
            colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-900/50",
            colorTheme === "green" && "border-green-200 dark:border-green-900/50"
          )}
        >
          <DialogHeader>
            <DialogTitle>Detail {title}</DialogTitle>
            <DialogDescription>
              {selectedDate ? `${formatDateLabel(selectedDate)} • ${formatCurrency(selectedTotal)}` : "Pilih tanggal dari kalender"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Cari note, kategori, atau menu..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <Select
                value={sortBy ?? "__all__"}
                onValueChange={(val) => {
                  setSortBy(val === "__all__" ? null : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[170px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <ListFilter className="w-4 h-4 text-neutral-500" />
                    <SelectValue placeholder="Kategori" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                title="Tambah transaksi"
                className={cn(
                  "h-10 w-full sm:w-10 p-0 text-white",
                  colorTheme === "pink" && "bg-pink-500 hover:bg-pink-600",
                  colorTheme === "sky" && "bg-sky-500 hover:bg-sky-600",
                  colorTheme === "indigo" && "bg-indigo-500 hover:bg-indigo-600",
                  colorTheme === "green" && "bg-green-500 hover:bg-green-600"
                )}
                onClick={() => {
                  setEditingInvoice(null);
                  setFormData({
                    date: selectedDate || todayStr,
                    amount: "",
                    note: "",
                    category: "",
                    tags: "",
                  });
                  setSelectedAccountId(null);
                  setSelectedTargetId(null);
                  setSelectedCateringMenuId(null);
                  setCateringQty("1");
                  setIsCustomCategory(false);
                  setFormKey((prev) => prev + 1);
                  setErrorMessage("");
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-[420px] overflow-auto space-y-2 pr-1">
              {paginated.length === 0 ? (
                <div className="text-sm text-neutral-500 text-center py-8">Belum ada transaksi pada tanggal ini.</div>
              ) : (
                <AnimatePresence initial={false}>
                  {paginated.map((inv) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-neutral-200 dark:border-slate-700 p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">{inv.note}</p>
                      <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-slate-800 dark:text-slate-200">
                        {inv.category}
                      </span>
                      {inv.account_id && (
                        <span className="inline-block mt-2 ml-2 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                          {accountNameMap.get(String(inv.account_id)) ?? "Rekening"}
                        </span>
                      )}
                      {inv.target_id && type === "pemasukkan" && (
                        <span className="inline-block mt-2 ml-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          {targets.find((item) => item.id === inv.target_id)?.name ?? "Target"}
                        </span>
                      )}
                      {inv.catering_menu && type === "pemasukkan" && (
                        <span className="inline-block mt-2 ml-2 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
                          {inv.catering_menu.name}
                          {inv.catering_quantity != null && inv.catering_quantity > 1 ? ` ×${inv.catering_quantity}` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" className="p-1.5 rounded-lg" onClick={() => openEditDialog(inv)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="p-1.5 rounded-lg text-red-600 hover:text-red-700" onClick={() => setDeleteConfirmId(inv.id)} title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
        <DialogContent className="w-[92vw] max-w-xs p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-neutral-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>Pilih Bulan</DialogTitle>
            <DialogDescription>Mode compact untuk pilih bulan dan tahun.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Select value={String(draftMonth)} onValueChange={(val) => setDraftMonth(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Januari</SelectItem>
                <SelectItem value="2">Februari</SelectItem>
                <SelectItem value="3">Maret</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">Mei</SelectItem>
                <SelectItem value="6">Juni</SelectItem>
                <SelectItem value="7">Juli</SelectItem>
                <SelectItem value="8">Agustus</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">Oktober</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">Desember</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={draftYear}
              onChange={(e) => setDraftYear(Number(e.target.value))}
              placeholder="Tahun"
            />
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setIsMonthPickerOpen(false)}>
              Batal
            </Button>
            <Button onClick={applyMonthPicker}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId != null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent
          className={cn(
            "w-[92vw] max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border",
            colorTheme === "pink" && "border-pink-200 dark:border-pink-900/50",
            colorTheme === "sky" && "border-sky-200 dark:border-sky-900/50",
            colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-900/50",
            colorTheme === "green" && "border-green-200 dark:border-green-900/50"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-slate-100">Hapus transaksi?</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-slate-400">Transaksi yang dihapus tidak bisa dikembalikan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-lg">
              Batal
            </Button>
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-lg" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={title}
        isEditMode={isEditMode}
        formData={formData}
        setFormData={setFormData}
        formKey={formKey}
        errorMessage={errorMessage}
        submitting={submitting}
        categories={categories}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        targets={targets}
        selectedTargetId={selectedTargetId}
        setSelectedTargetId={setSelectedTargetId}
        showTargetSelector={type === "pemasukkan"}
        colorTheme={colorTheme}
        isCustomCategory={isCustomCategory}
        setIsCustomCategory={setIsCustomCategory}
        showCateringMenuSelector={type === "pemasukkan"}
        cateringMenus={cateringMenus}
        cateringMenusLoading={cateringMenusLoading}
        selectedCateringMenuId={selectedCateringMenuId}
        onCateringMenuChange={handleCateringMenuChange}
        cateringQty={cateringQty}
        onCateringQtyChange={handleCateringQtyChange}
        onSave={handleSubmitInvoice}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

export function InvoicesPemasukkanPage() {
  return <InvoicesPage title="Pemasukkan" type="pemasukkan" />;
}

export function InvoicesPengeluaranPage() {
  return <InvoicesPage title="Pengeluaran" type="pengeluaran" />;
}
