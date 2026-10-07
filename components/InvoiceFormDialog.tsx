"use client";

import { CalendarDays, FolderKanban, Landmark, ReceiptText, Tag, Target, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerDialog } from "@/components/DatePickerDialog";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/accounts-storage";
import { formatCurrencyCompactLabel, formatCurrencyInput } from "@/lib/currency-input";
import type { SavingsTarget } from "@/lib/goals-storage";

export type FormData = {
  date: string;
  amount: string;
  note: string;
  category: string;
  tags: string;
};

type InvoiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isEditMode: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formKey: number;
  errorMessage: string;
  submitting: boolean;
  categories: string[];
  accounts: Account[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  targets?: SavingsTarget[];
  selectedTargetId?: string | null;
  setSelectedTargetId?: (id: string | null) => void;
  showTargetSelector?: boolean;
  colorTheme: string | null;
  isCustomCategory: boolean;
  setIsCustomCategory: (v: boolean) => void;
  onSave: (e?: React.FormEvent) => void;
  onCancel: () => void;
};

function themeClass(theme: string | null) {
  if (theme === "sky") {
    return {
      border: "border-sky-200/70 dark:border-sky-900/55",
      soft: "bg-sky-50/65 dark:bg-sky-950/18",
      field: "border-sky-200/75 focus-visible:ring-sky-400 dark:border-sky-900/55",
      accent: "text-sky-700 dark:text-sky-200",
      button: "bg-sky-500 hover:bg-sky-600 text-white shadow-[0_10px_24px_-14px_rgba(14,165,233,0.9)]",
      subtleButton: "border-sky-200/80 bg-white text-sky-700 hover:bg-sky-50 dark:border-sky-900/60 dark:bg-slate-950 dark:text-sky-200 dark:hover:bg-sky-950/30",
    };
  }
  if (theme === "indigo") {
    return {
      border: "border-indigo-200/70 dark:border-indigo-900/55",
      soft: "bg-indigo-50/65 dark:bg-indigo-950/18",
      field: "border-indigo-200/75 focus-visible:ring-indigo-400 dark:border-indigo-900/55",
      accent: "text-indigo-700 dark:text-indigo-200",
      button: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_10px_24px_-14px_rgba(99,102,241,0.9)]",
      subtleButton: "border-indigo-200/80 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-slate-950 dark:text-indigo-200 dark:hover:bg-indigo-950/30",
    };
  }
  if (theme === "green") {
    return {
      border: "border-green-200/70 dark:border-green-900/55",
      soft: "bg-green-50/65 dark:bg-green-950/18",
      field: "border-green-200/75 focus-visible:ring-green-400 dark:border-green-900/55",
      accent: "text-green-700 dark:text-green-200",
      button: "bg-green-500 hover:bg-green-600 text-white shadow-[0_10px_24px_-14px_rgba(34,197,94,0.9)]",
      subtleButton: "border-green-200/80 bg-white text-green-700 hover:bg-green-50 dark:border-green-900/60 dark:bg-slate-950 dark:text-green-200 dark:hover:bg-green-950/30",
    };
  }
  return {
    border: "border-pink-200/70 dark:border-pink-900/55",
    soft: "bg-pink-50/65 dark:bg-pink-950/18",
    field: "border-pink-200/75 focus-visible:ring-pink-400 dark:border-pink-900/55",
    accent: "text-pink-700 dark:text-pink-200",
    button: "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_10px_24px_-14px_rgba(236,72,153,0.9)]",
    subtleButton: "border-pink-200/80 bg-white text-pink-700 hover:bg-pink-50 dark:border-pink-900/60 dark:bg-slate-950 dark:text-pink-200 dark:hover:bg-pink-950/30",
  };
}

function Label({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-neutral-600 dark:text-slate-300 sm:mb-2 sm:text-sm">
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span>{text}</span>
    </div>
  );
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  title,
  isEditMode,
  formData,
  setFormData,
  formKey,
  errorMessage,
  submitting,
  categories,
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  targets = [],
  selectedTargetId = null,
  setSelectedTargetId,
  showTargetSelector = false,
  colorTheme,
  isCustomCategory,
  setIsCustomCategory,
  onSave,
  onCancel,
}: InvoiceFormDialogProps) {
  const styles = themeClass(colorTheme);
  const inputSurface = cn("h-10 w-full rounded-[18px] bg-white px-3.5 shadow-sm dark:bg-slate-950", styles.field);
  const amountHint = formData.amount ? formatCurrencyCompactLabel(formData.amount) : "Nominal akan diformat otomatis";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex max-h-[86vh] w-[min(92vw,560px)] flex-col gap-0 overflow-hidden rounded-[24px] border bg-white/98 p-0 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.4)] dark:bg-slate-950/98", styles.border)}>
        <div className="px-3.5 pb-3 pt-4 md:px-4 md:pb-3 md:pt-4">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="pr-8 text-[1.05rem] font-semibold tracking-tight text-neutral-950 dark:text-white md:text-[1.08rem]">
              {isEditMode ? "Edit" : "Tambah"} {title}
            </DialogTitle>  
          </DialogHeader>
        </div>

        <div key={formKey} className="min-h-0 overflow-y-auto px-3.5 pb-3.5 md:px-4 md:pb-4">
          <div className="space-y-3">
            <div className={cn("rounded-[18px] border p-2.5 md:rounded-[20px] md:p-3", styles.border, styles.soft)}>
                <Label icon={Wallet} text="Nominal" />
                <div className="flex items-center gap-2 rounded-[16px] border border-white/80 bg-white px-2.5 py-2 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] dark:border-slate-900/80 dark:bg-slate-950 md:rounded-[18px] md:px-3 md:py-2.5">
                  <span className={cn("text-sm font-medium", styles.accent)}>Rp</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: formatCurrencyInput(e.target.value) }))}
                    onClick={(e) => e.stopPropagation()}
                    className="h-auto min-w-0 border-0 bg-transparent px-0 text-lg font-semibold tracking-tight shadow-none focus-visible:ring-0 dark:bg-transparent md:text-xl"
                  />
                </div>
                <p className="mt-2 text-[12px] text-neutral-500 dark:text-slate-400">{amountHint}</p>
            </div>

            <div>
              <Label icon={ReceiptText} text="Catatan" />
              <Textarea
                placeholder="Tulis keterangan singkat"
                value={formData.note}
                onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className={cn("min-h-[84px] resize-none rounded-[16px] bg-white px-3 py-2.5 text-[13px] shadow-sm dark:bg-slate-950 md:min-h-[92px] md:rounded-[18px] md:px-3 md:py-2.5 md:text-[14px]", styles.field)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label icon={CalendarDays} text="Tanggal" />
                <DatePickerDialog
                  value={formData.date}
                  onChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
                  className={inputSurface}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                  <Label icon={FolderKanban} text="Kategori" />
                  {isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData((prev) => ({ ...prev, category: "" }));
                      }}
                      className={cn(
                        "rounded-full border bg-white px-3 py-1 text-[11px] font-medium transition hover:bg-neutral-50 dark:bg-slate-950 dark:hover:bg-slate-900",
                        styles.border,
                        styles.accent
                      )}
                    >
                      Pilih daftar
                    </button>
                  )}
                </div>
                {!isCustomCategory ? (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        setIsCustomCategory(true);
                        setFormData((prev) => ({ ...prev, category: "" }));
                        return;
                      }
                      setFormData((prev) => ({ ...prev, category: value }));
                    }}
                  >
                    <SelectTrigger className={cn("justify-between", inputSurface)}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">Kategori baru</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    placeholder="Nama kategori"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    className={inputSurface}
                  />
                )}
              </div>
            </div>

            <div className={cn("grid gap-3 sm:grid-cols-2", showTargetSelector && "sm:grid-cols-2")}>
              <div>
                <Label icon={Landmark} text="Rekening" />
                <Select value={selectedAccountId ?? "__none__"} onValueChange={(value) => setSelectedAccountId(value === "__none__" ? null : value)}>
                  <SelectTrigger className={cn("justify-between", inputSurface)}>
                    <SelectValue placeholder="Tanpa rekening" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-neutral-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
                    <SelectItem value="__none__">Tanpa rekening</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showTargetSelector && setSelectedTargetId ? (
                <div>
                  <Label icon={Target} text="Target" />
                  <Select value={selectedTargetId ?? "__none__"} onValueChange={(value) => setSelectedTargetId(value === "__none__" ? null : value)}>
                    <SelectTrigger className={cn("justify-between", inputSurface)}>
                      <SelectValue placeholder="Tanpa target" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
                      <SelectItem value="__none__">Tanpa target</SelectItem>
                      {targets.map((target) => (
                        <SelectItem key={target.id} value={target.id}>
                          {target.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className={cn(showTargetSelector && "sm:col-span-2")}>
                <Label icon={Tag} text="Tag" />
                <Input
                  type="text"
                  placeholder="Opsional"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  className={inputSurface}
                />
              </div>
            </div>
          </div>

          <div className="mt-2.5 space-y-2 md:mt-3 md:space-y-2.5">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-neutral-200/80 bg-white/92 px-3 py-2.5 backdrop-blur md:px-4 md:py-3 dark:border-slate-800 dark:bg-slate-950/92">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel} className={cn("h-10 rounded-full px-4 text-sm sm:h-11 sm:min-w-[96px] sm:px-5", styles.subtleButton)}>
              Batal
            </Button>
            <Button type="button" disabled={submitting} onClick={(e) => onSave(e)} className={cn("h-10 rounded-full px-4 text-sm sm:h-11 sm:min-w-[112px] sm:px-5", styles.button)}>
              {submitting ? "Menyimpan..." : isEditMode ? "Simpan perubahan" : "Simpan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
