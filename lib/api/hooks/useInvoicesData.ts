"use client";

import { useState, useEffect, useCallback } from "react";
import { invoicesService, typesService, categoriesService } from "..";
import type { Invoice, InvoiceType, Category } from "../types";
import { ApiError } from "../client";

interface UseInvoicesDataResult {
  invoices: Invoice[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createInvoice: (payload: {
    date: string;
    amount: number;
    note: string;
    category: string;
  }) => Promise<Invoice | null>;
  updateInvoice: (id: number, payload: { date?: string; amount?: number; note?: string; category?: string }) => Promise<Invoice | null>;
  deleteInvoice: (id: number) => Promise<boolean>;
}

/** Resolve type name (pemasukkan/pengeluaran) to type_id from backend */
async function getTypeIdByName(name: InvoiceType): Promise<number | null> {
  const types = await typesService.getAll();
  const found = types.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return found?.id ?? null;
}

export function useInvoicesData(type: InvoiceType): UseInvoicesDataResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [invoicesRes, typeId] = await Promise.all([
        invoicesService.getAll({ type }),
        getTypeIdByName(type),
      ]);
      setInvoices(invoicesRes);

      if (typeId != null) {
        const cats = await categoriesService.getAll(typeId);
        setCategories(cats);
      } else {
        const cats = await categoriesService.getAll();
        setCategories(cats);
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Gagal memuat data";
      setError(message);
      setInvoices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createInvoice = useCallback(
    async (payload: { date: string; amount: number; note: string; category: string }) => {
      setError(null);
      try {
        const created = await invoicesService.create({
          ...payload,
          type,
        });
        setInvoices((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        const message = e instanceof ApiError ? e.message : "Gagal menyimpan";
        setError(message);
        return null;
      }
    },
    [type]
  );

  const updateInvoice = useCallback(
    async (id: number, payload: { date?: string; amount?: number; note?: string; category?: string }) => {
      setError(null);
      try {
        const updated = await invoicesService.update(id, payload);
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
        return updated;
      } catch (e) {
        const message = e instanceof ApiError ? e.message : "Gagal mengubah";
        setError(message);
        return null;
      }
    },
    []
  );

  const deleteInvoice = useCallback(async (id: number) => {
    setError(null);
    try {
      await invoicesService.delete(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      return true;
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Gagal menghapus";
      setError(message);
      return false;
    }
  }, []);

  return {
    invoices,
    categories,
    loading,
    error,
    refetch: fetchData,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
