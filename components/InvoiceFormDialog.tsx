"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  colorTheme: string | null;
  isCustomCategory: boolean;
  setIsCustomCategory: (v: boolean) => void;
  onSave: (e?: React.FormEvent) => void;
  onCancel: () => void;
};

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
  colorTheme,
  isCustomCategory,
  setIsCustomCategory,
  onSave,
  onCancel,
}: InvoiceFormDialogProps) {
  const theme = colorTheme ?? "pink";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-white dark:bg-slate-900 border max-w-md mx-4 sm:mx-auto",
          theme === "pink" && "border-pink-200 dark:border-pink-900/50",
          theme === "sky" && "border-sky-200 dark:border-sky-900/50",
          theme === "indigo" && "border-indigo-200 dark:border-indigo-900/50",
          theme === "green" && "border-green-200 dark:border-green-900/50",
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Tambah"} {title}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Ubah data transaksi di bawah." : "Isi form di bawah untuk menambah transaksi baru."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 dark:bg-red-900/30">
            {errorMessage}
          </div>
        )}

        <div key={formKey} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-200">Tanggal</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                theme === "green" && "border-green-200 dark:border-green-800/50",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-200">Nominal (Rp)</label>
            <Input
              type="number"
              placeholder="Masukkan nominal"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                theme === "green" && "border-green-200 dark:border-green-800/50",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-200">Keterangan</label>
            <Input
              type="text"
              placeholder="Masukkan keterangan"
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                theme === "green" && "border-green-200 dark:border-green-800/50",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-200">Tag (opsional, pisah koma)</label>
            <Input
              type="text"
              placeholder="Contoh: urgent, reimbursement"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                theme === "green" && "border-green-200 dark:border-green-800/50",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-slate-200">Kategori</label>
            {!isCustomCategory ? (
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomCategory(true);
                    setFormData((prev) => ({ ...prev, category: "" }));
                  } else {
                    setFormData((prev) => ({ ...prev, category: value }));
                  }
                }}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                    theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                    theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                    theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                    theme === "green" && "border-green-200 dark:border-green-800/50",
                  )}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent
                  className={cn(
                    "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                    theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                    theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                    theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                    theme === "green" && "border-green-200 dark:border-green-800/50",
                  )}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Kategori Baru</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Masukkan kategori baru"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                    theme === "pink" && "border-pink-200 dark:border-pink-800/50",
                    theme === "sky" && "border-sky-200 dark:border-sky-800/50",
                    theme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                    theme === "green" && "border-green-200 dark:border-green-800/50",
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setFormData((prev) => ({ ...prev, category: "" }));
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  ← Kembali ke pilihan kategori
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-lg">
            Batal
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={(e) => onSave(e)}
            className={cn(
              "text-white rounded-lg shadow-lg disabled:opacity-50",
              theme === "pink" && "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600",
              theme === "sky" && "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600",
              theme === "indigo" && "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600",
              theme === "green" && "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600",
            )}
          >
            {submitting ? "Menyimpan..." : isEditMode ? "Simpan perubahan" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
