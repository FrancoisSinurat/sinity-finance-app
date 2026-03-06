"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { useInvoicesData } from "@/lib/api";
import type { InvoiceType } from "@/lib/api";
import type { Invoice } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";
import { InvoiceFormDialog } from "@/components/InvoiceFormDialog";

function buildNoteWithTags(note: string, tagsInput: string): string {
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");
  return tags ? `${note.trim()} ${tags}`.trim() : note.trim();
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

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    note: "",
    category: "",
    tags: "",
  });
  const perPage = 10;
  const { colorTheme } = useTheme();

  const categoryNamesFromApi = apiCategories.map((c) => c.name);
  const categoryNamesFromData = Array.from(new Set(data.map((d) => d.category)));
  const categories = Array.from(new Set([...categoryNamesFromApi, ...categoryNamesFromData]));

  const isEditMode = editingInvoice != null;

  const handleSubmitInvoice = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.amount || !formData.note || !formData.category) {
      setErrorMessage("Mohon isi semua field!");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    const noteWithTags = buildNoteWithTags(formData.note, formData.tags);
    const payload = {
      date: formData.date,
      amount: Number(formData.amount),
      note: noteWithTags,
      category: formData.category,
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
    const created = await createInvoice({
      ...payload,
      note: noteWithTags,
    });
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
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      note: "",
      category: "",
      tags: "",
    });
    setEditingInvoice(null);
    setIsCustomCategory(false);
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

  /** Extract #tag from note for edit form */
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
      amount: String(inv.amount),
      note: noteWithoutTags(inv.note),
      category: inv.category,
      tags: parseTagsFromNote(inv.note),
    });
    setFormKey((prev) => prev + 1);
    setIsDialogOpen(true);
    setErrorMessage("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId == null) return;
    const ok = await deleteInvoice(deleteConfirmId);
    setDeleteConfirmId(null);
    if (ok) setPage((p) => Math.max(1, p - 1));
  };

  let filtered = data.filter(
    (d) =>
      d.note.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy) {
    filtered = filtered.filter((d) => d.category === sortBy);
  }

  if (dateFrom) {
    filtered = filtered.filter((d) => d.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((d) => d.date <= dateTo);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="h-full bg-white/50 dark:bg-slate-900/60 rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 backdrop-blur-sm flex flex-col border dark:border-slate-800/50">
      <div className="w-full space-y-4 flex-1 flex flex-col overflow-hidden">
        {/* API error */}
        {apiError && (
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            <span>{apiError}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
              Coba lagi
            </Button>
          </div>
        )}

        {/* Judul */}
        <h1 className={cn(
          "text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-200",
          colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-500 dark:from-pink-400 dark:to-pink-400",
          colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-500 dark:from-sky-400 dark:to-sky-400",
          colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-500 dark:from-indigo-400 dark:to-indigo-400",
          colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-500 dark:from-green-400 dark:to-green-400",
        ) }
        >
          {title}
        </h1>

        {/* Pencarian & filter */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <Input
                placeholder="Cari catatan atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "flex-1 min-w-0 bg-white dark:bg-slate-800 dark:border-slate-700 text-neutral-900 dark:text-slate-100 border focus:ring-2 focus:ring-offset-0 text-sm sm:text-base",
                  colorTheme === "pink" && "border-pink-200 dark:border-pink-800/50 dark:focus:ring-pink-500/50",
                  colorTheme === "sky" && "border-sky-200 dark:border-sky-800/50 dark:focus:ring-sky-500/50",
                  colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-800/50 dark:focus:ring-indigo-500/50",
                  colorTheme === "green" && "border-green-200 dark:border-green-800/50 dark:focus:ring-green-500/50",
                )}
              />
              <Select value={sortBy ?? "__all__"} onValueChange={(val) => setSortBy(val === "__all__" ? null : val)}>
                <SelectTrigger className={cn(
                  "w-full sm:w-48 bg-white dark:bg-slate-800 dark:border-slate-700 text-neutral-900 dark:text-slate-100 border text-sm sm:text-base",
                  colorTheme === "pink" && "border-pink-200 dark:border-pink-800/50",
                  colorTheme === "sky" && "border-sky-200 dark:border-sky-800/50",
                  colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                  colorTheme === "green" && "border-green-200 dark:border-green-800/50",
                ) }
                >
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent className={cn(
                  "bg-white dark:bg-slate-800 dark:border-slate-700 border",
                  colorTheme === "pink" && "border-pink-200 dark:border-pink-800/50",
                  colorTheme === "sky" && "border-sky-200 dark:border-sky-800/50",
                  colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
                  colorTheme === "green" && "border-green-200 dark:border-green-800/50",
                ) }
                >
                  <SelectItem value="__all__">Semua</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
            onClick={() => {
              setEditingInvoice(null);
              setFormData({
                date: new Date().toISOString().slice(0, 10),
                amount: "",
                note: "",
                category: "",
                tags: "",
              });
              setIsCustomCategory(false);
              setFormKey((prev) => prev + 1);
              setErrorMessage("");
              setIsDialogOpen(true);
            }}
            className={cn(
              "w-full sm:w-auto text-white rounded-lg shadow-lg hover:shadow-xl transition-all text-sm sm:text-base whitespace-nowrap",
              colorTheme === "pink" && "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600",
              colorTheme === "sky" && "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600",
              colorTheme === "indigo" && "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600",
              colorTheme === "green" && "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600",
            ) }
            >
            + Tambah
          </Button>
        </div>

        {/* Filter tanggal */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">Tanggal:</span>
          <Input
            type="date"
            placeholder="Dari"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className={cn(
              "w-full sm:w-40 bg-white dark:bg-slate-800 dark:border-slate-700 text-neutral-900 dark:text-slate-100 border text-sm",
              colorTheme === "pink" && "border-pink-200 dark:border-pink-800/50",
              colorTheme === "sky" && "border-sky-200 dark:border-sky-800/50",
              colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
              colorTheme === "green" && "border-green-200 dark:border-green-800/50",
            )}
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-500">–</span>
          <Input
            type="date"
            placeholder="Sampai"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className={cn(
              "w-full sm:w-40 bg-white dark:bg-slate-800 dark:border-slate-700 text-neutral-900 dark:text-slate-100 border text-sm",
              colorTheme === "pink" && "border-pink-200 dark:border-pink-800/50",
              colorTheme === "sky" && "border-sky-200 dark:border-sky-800/50",
              colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-800/50",
              colorTheme === "green" && "border-green-200 dark:border-green-800/50",
            )}
          />
          {(dateFrom || dateTo) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Reset tanggal
            </Button>
          )}
        </div>

        {/* Filter kategori */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={sortBy === cat ? "default" : "outline"}
              onClick={() => setSortBy(sortBy === cat ? null : cat)}
              className={cn(
                "rounded-full px-3 py-1 md:px-4 text-xs md:text-sm transition",
                sortBy === cat
                  ? cn(
                      "text-white shadow-lg",
                      colorTheme === "pink" && "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600",
                      colorTheme === "sky" && "bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600",
                      colorTheme === "indigo" && "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600",
                      colorTheme === "green" && "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600",
                    )
                  : cn(
                      "dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:border-slate-600",
                      colorTheme === "pink" && "border-pink-300 text-pink-500 hover:bg-pink-50 dark:text-pink-400 dark:border-pink-800/50",
                      colorTheme === "sky" && "border-sky-300 text-sky-500 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-800/50",
                      colorTheme === "indigo" && "border-indigo-300 text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800/50",
                      colorTheme === "green" && "border-green-300 text-green-500 hover:bg-green-50 dark:text-green-400 dark:border-green-800/50",
                    )
              ) }
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-300 dark:border-slate-600 border-t-transparent" />
          </div>
        )}

        {/* Tabel */}
        {!loading && (
          <div className="flex flex-col gap-4 flex-1">
            <div className={cn("flex-1 overflow-x-auto overflow-y-auto rounded-2xl border bg-white/80 dark:bg-slate-900/90", colorTheme === "pink" && "border-pink-200 dark:border-pink-900/50", colorTheme === "sky" && "border-sky-200 dark:border-sky-900/50", colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-900/50", colorTheme === "green" && "border-green-200 dark:border-green-900/50")}>
              <table className="w-full text-xs sm:text-sm text-center min-w-[600px]">
                <thead className={cn("bg-gradient-to-r dark:from-slate-800/60 dark:to-slate-800/60", colorTheme === "pink" && "from-pink-400/10 to-pink-400/10 text-pink-600", colorTheme === "sky" && "from-sky-400/10 to-sky-400/10 text-sky-600", colorTheme === "indigo" && "from-indigo-400/10 to-indigo-400/10 text-indigo-600", colorTheme === "green" && "from-green-400/10 to-green-400/10 text-green-600")}>
                  <tr>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold">No</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold">Tanggal</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold">Nominal</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold hidden sm:table-cell">Keterangan</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold">Kategori</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((inv, idx) => (
                    <tr key={inv.id} className={cn("border-t dark:border-slate-800", colorTheme === "pink" && "border-pink-100 hover:bg-pink-50/50", colorTheme === "sky" && "border-sky-100 hover:bg-sky-50/50", colorTheme === "indigo" && "border-indigo-100 hover:bg-indigo-50/50", colorTheme === "green" && "border-green-100 hover:bg-green-50/50")}>
                      <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-neutral-700 dark:text-slate-200">{(page - 1) * perPage + idx + 1}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-neutral-700 dark:text-slate-200">{inv.date}</td>
                      <td className={cn("px-2 sm:px-3 md:px-4 py-2 md:py-3 font-semibold", colorTheme === "pink" && "text-pink-600", colorTheme === "sky" && "text-sky-600", colorTheme === "indigo" && "text-indigo-600", colorTheme === "green" && "text-green-600")}>Rp {inv.amount.toLocaleString("id-ID")}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-neutral-700 dark:text-slate-200 hidden sm:table-cell">{inv.note}</td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3"><span className={cn("px-2 py-1 rounded-full text-xs font-medium", colorTheme === "pink" && "bg-pink-100 text-pink-600", colorTheme === "sky" && "bg-sky-100 text-sky-600", colorTheme === "indigo" && "bg-indigo-100 text-indigo-600", colorTheme === "green" && "bg-green-100 text-green-600")}>{inv.category}</span></td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button type="button" variant="ghost" size="sm" className="p-1.5 rounded-lg" onClick={() => openEditDialog(inv)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="p-1.5 rounded-lg text-red-600 hover:text-red-700" onClick={() => setDeleteConfirmId(inv.id)} title="Hapus"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Halaman {page} dari {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg text-sm">Prev</Button>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg text-sm">Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteConfirmId != null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent
          className={cn(
            "bg-white dark:bg-slate-900 border max-w-sm mx-4 sm:mx-auto",
            colorTheme === "pink" && "border-pink-200 dark:border-pink-900/50",
            colorTheme === "sky" && "border-sky-200 dark:border-sky-900/50",
            colorTheme === "indigo" && "border-indigo-200 dark:border-indigo-900/50",
            colorTheme === "green" && "border-green-200 dark:border-green-900/50",
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-slate-100">Hapus transaksi?</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-slate-400">Transaksi yang dihapus tidak bisa dikembalikan.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-lg">Batal</Button>
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-lg" onClick={handleDeleteConfirm}>Hapus</Button>
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
        colorTheme={colorTheme}
        isCustomCategory={isCustomCategory}
        setIsCustomCategory={setIsCustomCategory}
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
