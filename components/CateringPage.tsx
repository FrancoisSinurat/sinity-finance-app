"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, Pencil, Plus, Save, Trash2, UtensilsCrossed, XCircle } from "lucide-react";
import {
  cateringService,
  ApiError,
  type CateringMenu,
  type CateringDailyLine,
  type CateringDailySales,
} from "@/lib/api";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerDialog } from "@/components/DatePickerDialog";
import { getJakartaToday } from "@/lib/date-time";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-input";

type View = "menus" | "daily" | "summary";

function randomKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type DraftLine = {
  key: string;
  menu_id: number;
  quantity: number;
  unit_price: number;
};

function linesToDraft(lines: CateringDailyLine[]): DraftLine[] {
  return lines.map((l) => ({
    key: randomKey(),
    menu_id: l.menu_id,
    quantity: Math.max(1, l.quantity),
    unit_price: l.unit_price,
  }));
}

export function CateringPage() {
  const { colorTheme } = useTheme();
  const [view, setView] = useState<View>("summary");
  const [menus, setMenus] = useState<CateringMenu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [apiHint, setApiHint] = useState<string | null>(null);

  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CateringMenu | null>(null);
  const [menuForm, setMenuForm] = useState({ name: "", default_price: "" });
  const [menuSaving, setMenuSaving] = useState(false);

  // Daily Sales Draft
  const [salesDate, setSalesDate] = useState(getJakartaToday());
  const [dailyLines, setDailyLines] = useState<DraftLine[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailySaving, setDailySaving] = useState(false);

  // Summary View
  const [summaryList, setSummaryList] = useState<CateringDailySales[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const themeStyles = useMemo(() => {
    if (colorTheme === "sky") {
      return { action: "bg-sky-500 hover:bg-sky-600 text-white", shell: "border-sky-200/80 dark:border-sky-900/55", soft: "bg-sky-50/70 dark:bg-sky-950/20", icon: "text-sky-600 dark:text-sky-400" };
    }
    if (colorTheme === "indigo") {
      return { action: "bg-indigo-500 hover:bg-indigo-600 text-white", shell: "border-indigo-200/80 dark:border-indigo-900/55", soft: "bg-indigo-50/70 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400" };
    }
    if (colorTheme === "green") {
      return { action: "bg-green-500 hover:bg-green-600 text-white", shell: "border-green-200/80 dark:border-green-900/55", soft: "bg-green-50/70 dark:bg-green-950/20", icon: "text-green-600 dark:text-green-400" };
    }
    return { action: "bg-pink-500 hover:bg-pink-600 text-white", shell: "border-pink-200/80 dark:border-pink-900/55", soft: "bg-pink-50/70 dark:bg-pink-950/20", icon: "text-pink-600 dark:text-pink-400" };
  }, [colorTheme]);

  const refreshMenus = useCallback(async () => {
    setLoadingMenus(true);
    try {
      const list = await cateringService.listMenus();
      setMenus(list);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setApiHint("Menu catering belum tersedia.");
      }
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
      const list = await cateringService.listDailySalesRange(firstDay, lastDay);
      setSummaryList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    void refreshMenus();
  }, [refreshMenus]);

  useEffect(() => {
    if (view === "summary") void loadSummary();
  }, [view, loadSummary]);

  const loadDaily = useCallback(async (date: string) => {
    setDailyLoading(true);
    try {
      const data = await cateringService.getDailySales(date);
      setDailyLines(data.lines.length ? linesToDraft(data.lines) : []);
    } catch (e) {
      setDailyLines([]);
    } finally {
      setDailyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "daily") void loadDaily(salesDate);
  }, [view, salesDate, loadDaily]);

  const saveMenu = async () => {
    const name = menuForm.name.trim();
    if (!name) return;
    const price = parseCurrencyInput(menuForm.default_price || "0");
    setMenuSaving(true);
    try {
      if (editingMenu) {
        const u = await cateringService.updateMenu(editingMenu.id, { name, default_price: price });
        setMenus((prev) => prev.map((x) => (x.id === u.id ? u : x)));
      } else {
        const c = await cateringService.createMenu({ name, default_price: price });
        setMenus((prev) => [c, ...prev]);
      }
      setMenuDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setMenuSaving(false);
    }
  };

  const menuById = useMemo(() => {
    const map = new Map<number, CateringMenu>();
    menus.forEach((m) => map.set(m.id, m));
    return map;
  }, [menus]);

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setDailyLines((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        const next = { ...row, ...patch };
        if (patch.menu_id != null) {
          const m = menuById.get(patch.menu_id);
          if (m) next.unit_price = m.default_price;
        }
        return next;
      })
    );
  };

  const dailyTotal = useMemo(
    () => dailyLines.reduce((s, l) => s + l.quantity * l.unit_price, 0),
    [dailyLines]
  );

  const saveDaily = async () => {
    setDailySaving(true);
    try {
      await cateringService.upsertDailySales(salesDate, {
        lines: dailyLines.map((l) => ({
          catering_menu_id: l.menu_id,
          qty: l.quantity,
          unit_price: l.unit_price,
          subtotal: l.quantity * l.unit_price,
        })),
      });
      setView("summary");
    } catch (e) {
      console.error(e);
    } finally {
      setDailySaving(false);
    }
  };

  const openEditDaily = (date: string) => {
    setSalesDate(date);
    setView("daily");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", themeStyles.soft, themeStyles.shell, "border shadow-sm")}>
            <UtensilsCrossed className={cn("h-6 w-6", themeStyles.icon)} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">Catering Management</h1>
            <p className="text-sm text-neutral-600 dark:text-slate-400">Ringkasan & master menu</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl bg-neutral-100/50 p-1 dark:bg-slate-900/50">
          {[
            { id: "summary", label: "Ringkasan" },
            { id: "menus", label: "Master Menu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as View)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
                view === tab.id
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {apiHint && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {apiHint}
        </div>
      )}

      {view === "summary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Penjualan Bulan Ini</h2>
            <Button size="sm" className={themeStyles.action} onClick={() => { setSalesDate(getJakartaToday()); setView("daily"); }}>
              <Plus className="mr-1 h-4 w-4" /> Baru
            </Button>
          </div>
          {loadingSummary ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>
          ) : summaryList.length === 0 ? (
            <div className={cn("rounded-2xl border border-dashed p-12 text-center", themeStyles.shell)}>
              <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
              <p className="text-sm text-neutral-500">Belum ada catatan penjualan bulan ini.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {summaryList.map((s) => (
                <div
                  key={s.date}
                  onClick={() => openEditDaily(s.date)}
                  className={cn(
                    "group cursor-pointer rounded-2xl border bg-white/50 p-4 transition-all hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/50",
                    themeStyles.shell
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{s.date}</p>
                      <p className="mt-1 text-lg font-black text-neutral-900 dark:text-white">Rp {s.total_amount.toLocaleString("id-ID")}</p>
                    </div>
                    {s.is_paid ? (
                      <div className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700 dark:bg-green-950/30 dark:text-green-400">Lunas</div>
                    ) : (
                      <div className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Belum Lunas</div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.lines.length} menu</div>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "daily" && (
        <div className={cn("rounded-2xl border bg-white/60 p-5 dark:bg-slate-900/40", themeStyles.shell)}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white font-mono">{salesDate}</h2>
              <p className="text-xs text-neutral-500">Ringkasan penjualan harian</p>
            </div>
            <div className="flex items-center gap-2">
              <DatePickerDialog value={salesDate} onChange={(d) => setSalesDate(d)} />
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setView("summary")}>Batal</Button>
            </div>
          </div>

          {dailyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {dailyLines.map((line) => (
                  <div key={line.key} className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/20 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <Select
                        value={String(line.menu_id)}
                        onValueChange={(val) => updateLine(line.key, { menu_id: Number(val) })}
                      >
                        <SelectTrigger className="rounded-xl border-neutral-200 dark:border-slate-800 shadow-none">
                          <SelectValue placeholder="Pilih Menu" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {menus.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)} className="rounded-lg">{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-20 rounded-xl"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                      />
                      <div className="w-32 rounded-xl bg-neutral-100 px-3 py-2 text-right text-sm font-mono dark:bg-slate-800">
                        {line.unit_price.toLocaleString("id-ID")}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-neutral-400 hover:text-red-500"
                        onClick={() => setDailyLines((prev) => prev.filter((x) => x.key !== line.key))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full rounded-xl border-2 border-dashed border-neutral-100 text-neutral-400 hover:border-neutral-200 hover:text-neutral-500 dark:border-slate-800"
                  onClick={() => setDailyLines((prev) => [...prev, { key: randomKey(), menu_id: 0, quantity: 1, unit_price: 0 }])}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Baris
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-between border-t pt-6 dark:border-slate-800">
                <div className="text-left">
                  <p className="text-xs text-neutral-500 uppercase font-black tracking-widest">Total Penjualan</p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">Rp {dailyTotal.toLocaleString("id-ID")}</p>
                </div>
                <Button className={cn("px-8 rounded-xl", themeStyles.action)} onClick={saveDaily} disabled={dailySaving || !dailyLines.length}>
                  {dailySaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Transaksi
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "menus" && (
        <div className={cn("rounded-2xl border bg-white/60 p-5 dark:bg-slate-900/40", themeStyles.shell)}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Master Menu</h2>
            <Button size="sm" className={themeStyles.action} onClick={() => { setEditingMenu(null); setMenuForm({ name: "", default_price: "" }); setMenuDialogOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" /> Tambah
            </Button>
          </div>
          {loadingMenus ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>
          ) : menus.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">Belum ada menu. Silakan tambahkan!</p>
          ) : (
            <div className="grid gap-2">
              {menus.map((m) => (
                <div key={m.id} className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-white/80 p-3 transition-all hover:border-neutral-200 dark:border-slate-800 dark:bg-slate-900/30">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{m.name}</p>
                    <p className="text-xs font-mono text-neutral-500">Rp {m.default_price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900" onClick={() => { setEditingMenu(m); setMenuForm({ name: m.name, default_price: m.default_price.toString() }); setMenuDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500" onClick={async () => { if (confirm("Hapus menu ini?")) { await cateringService.deleteMenu(m.id); refreshMenus(); } }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Ubah Menu" : "Tambah Menu Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Nama Menu</label>
              <Input
                placeholder="Nasi Box Ayam Bakar..."
                className="rounded-xl"
                value={menuForm.name}
                onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Harga Default (Rp)</label>
              <Input
                placeholder="0"
                className="rounded-xl font-mono"
                value={formatCurrencyInput(menuForm.default_price)}
                onChange={(e) => setMenuForm((prev) => ({ ...prev, default_price: parseCurrencyInput(e.target.value).toString() }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setMenuDialogOpen(false)}>Batal</Button>
            <Button className={cn("rounded-xl", themeStyles.action)} onClick={saveMenu} disabled={menuSaving}>
              {menuSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingMenu ? "Simpan Perubahan" : "Tambah Menu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
