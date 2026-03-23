"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { useInvoicesData } from "@/lib/api";
import { getJakartaToday } from "@/lib/date-time";
import {
  computeAccountBalances,
  createAccount,
  createTransfer,
  deleteAccount,
  getAccounts,
  getInvoiceAccountMap,
  getTransfers,
  setInvoiceAccount,
  updateAccount,
  type AccountType,
} from "@/lib/accounts-storage";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ChevronDown,
  CreditCard,
  History,
  Landmark,
  Pencil,
  PiggyBank,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";

function cardIconByType(type: AccountType) {
  if (type === "cash") return Wallet;
  if (type === "bank") return Landmark;
  if (type === "ewallet") return Smartphone;
  return CreditCard;
}

function maskAccountNumber(accountNumber: string): string {
  const clean = accountNumber.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `${"*".repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`;
}

function typeLabel(type: AccountType): string {
  if (type === "bank") return "Bank";
  if (type === "ewallet") return "E-Wallet";
  if (type === "cash") return "Cash";
  return "Lainnya";
}

export default function AccountsPage() {
  const { colorTheme } = useTheme();
  const pemasukkanState = useInvoicesData("pemasukkan");
  const pengeluaranState = useInvoicesData("pengeluaran");

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [error, setError] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState("");

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(getJakartaToday());
  const [transferNote, setTransferNote] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const accounts = useMemo(() => getAccounts(), [reloadKey]);
  const invoiceAccountMap = useMemo(() => getInvoiceAccountMap(), [reloadKey]);
  const transfers = useMemo(() => getTransfers(), [reloadKey]);
  const allInvoices = useMemo(() => [...pemasukkanState.invoices, ...pengeluaranState.invoices], [pemasukkanState.invoices, pengeluaranState.invoices]);
  const balances = useMemo(() => computeAccountBalances(accounts, allInvoices, invoiceAccountMap), [accounts, allInvoices, invoiceAccountMap]);

  const totalWalletBalance = useMemo(() => balances.reduce((sum, item) => sum + item.balance, 0), [balances]);
  const totalIncome = useMemo(() => balances.reduce((sum, item) => sum + item.income, 0), [balances]);
  const totalExpense = useMemo(() => balances.reduce((sum, item) => sum + item.expense, 0), [balances]);
  const typeOrder: AccountType[] = ["bank", "ewallet", "cash", "other"];

  const groupedByType = useMemo(() => {
    const groups: Record<AccountType, typeof balances> = { bank: [], ewallet: [], cash: [], other: [] };
    balances.forEach((item) => groups[item.type].push(item));
    return groups;
  }, [balances]);

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((acc) => map.set(acc.id, acc.name));
    return map;
  }, [accounts]);

  const activeAccountTransfers = useMemo(() => transfers.filter((tr) => tr.fromAccountId === activeAccountId || tr.toAccountId === activeAccountId), [transfers, activeAccountId]);
  const themeClasses = useMemo(() => {
    if (colorTheme === "sky") return { chip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200", soft: "border-sky-200/70 bg-white dark:border-sky-900/60 dark:bg-slate-900/80", action: "bg-sky-500 hover:bg-sky-600", accentSoft: "bg-sky-50/85 dark:bg-sky-950/30", accentBorder: "border-sky-200/80 dark:border-sky-900/60", iconSoft: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/15 dark:text-sky-200" };
    if (colorTheme === "indigo") return { chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200", soft: "border-indigo-200/70 bg-white dark:border-indigo-900/60 dark:bg-slate-900/80", action: "bg-indigo-500 hover:bg-indigo-600", accentSoft: "bg-indigo-50/85 dark:bg-indigo-950/30", accentBorder: "border-indigo-200/80 dark:border-indigo-900/60", iconSoft: "bg-indigo-500/12 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-200" };
    if (colorTheme === "green") return { chip: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200", soft: "border-green-200/70 bg-white dark:border-green-900/60 dark:bg-slate-900/80", action: "bg-green-500 hover:bg-green-600", accentSoft: "bg-green-50/85 dark:bg-green-950/30", accentBorder: "border-green-200/80 dark:border-green-900/60", iconSoft: "bg-green-500/12 text-green-600 dark:bg-green-400/15 dark:text-green-200" };
    return { chip: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200", soft: "border-pink-200/70 bg-white dark:border-pink-900/60 dark:bg-slate-900/80", action: "bg-pink-500 hover:bg-pink-600", accentSoft: "bg-pink-50/85 dark:bg-pink-950/30", accentBorder: "border-pink-200/80 dark:border-pink-900/60", iconSoft: "bg-pink-500/12 text-pink-600 dark:bg-pink-400/15 dark:text-pink-200" };
  }, [colorTheme]);

  const resetAccountForm = () => {
    setAccountName("");
    setAccountNumber("");
    setInitialBalance("");
    setAccountType("bank");
    setError("");
  };

  const handleCreateAccount = () => {
    if (!accountName.trim()) return setError("Nama rekening wajib diisi.");
    if (!accountNumber.trim()) return setError("No rekening wajib diisi.");
    const initial = Number(initialBalance || "0");
    if (Number.isNaN(initial)) return setError("Saldo awal tidak valid.");
    createAccount({ name: accountName.trim(), accountNumber: accountNumber.trim(), type: accountType, initialBalance: initial, color: colorTheme ?? "pink" });
    resetAccountForm();
    setIsAddDialogOpen(false);
    setReloadKey((v) => v + 1);
  };

  const handleEditAccount = () => {
    if (!activeAccountId) return;
    if (!accountName.trim()) return setError("Nama rekening wajib diisi.");
    if (!accountNumber.trim()) return setError("No rekening wajib diisi.");
    const initial = Number(initialBalance || "0");
    if (Number.isNaN(initial)) return setError("Saldo awal tidak valid.");
    updateAccount(activeAccountId, { name: accountName.trim(), accountNumber: accountNumber.trim(), type: accountType, initialBalance: initial });
    resetAccountForm();
    setIsEditDialogOpen(false);
    setReloadKey((v) => v + 1);
  };

  const handleTransfer = async () => {
    setTransferError("");
    if (!fromAccountId || !toAccountId) return setTransferError("Pilih rekening asal dan tujuan.");
    if (fromAccountId === toAccountId) return setTransferError("Rekening asal dan tujuan tidak boleh sama.");
    const amount = Number(transferAmount);
    if (!amount || amount <= 0) return setTransferError("Nominal transfer harus lebih dari 0.");

    const fromName = accountNameMap.get(fromAccountId) ?? "Asal";
    const toName = accountNameMap.get(toAccountId) ?? "Tujuan";
    const expense = await pengeluaranState.createInvoice({ date: transferDate, amount, category: "Transfer", note: transferNote.trim() || `Transfer ke ${toName}` });
    const income = await pemasukkanState.createInvoice({ date: transferDate, amount, category: "Transfer", note: transferNote.trim() || `Transfer dari ${fromName}` });
    if (!expense || !income) return setTransferError("Gagal membuat transaksi transfer.");

    setInvoiceAccount(expense.id, fromAccountId);
    setInvoiceAccount(income.id, toAccountId);
    createTransfer({ fromAccountId, toAccountId, amount, date: transferDate, note: transferNote.trim() || undefined, expenseInvoiceId: expense.id, incomeInvoiceId: income.id });

    setTransferAmount("");
    setTransferNote("");
    setIsTransferDialogOpen(false);
    setReloadKey((v) => v + 1);
    await Promise.all([pemasukkanState.refetch(), pengeluaranState.refetch()]);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <section className={cn("rounded-[24px] border p-4 md:p-5", themeClasses.soft)}>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Rekening</h1>
          <Button type="button" size="sm" onClick={() => { resetAccountForm(); setIsAddDialogOpen(true); }} className={cn("h-10 w-10 p-0 text-white", themeClasses.action)} aria-label="Tambah rekening" title="Tambah rekening">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { value: `Rp ${totalWalletBalance.toLocaleString("id-ID")}`, icon: PiggyBank, label: "Total Saldo" },
            { value: `${balances.length}`, icon: Wallet, label: "Jumlah Rekening" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={cn("rounded-[22px] border p-4 md:p-5", themeClasses.accentSoft, themeClasses.accentBorder)}>
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("rounded-2xl p-3.5", themeClasses.iconSoft)}>
                    <Icon className="h-5 w-5 md:h-[22px] md:w-[22px]" />
                  </div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 md:text-sm">{item.label}</p>
                </div>
                <p className="mt-5 text-[28px] font-semibold leading-none tracking-tight text-neutral-950 dark:text-white md:text-[32px]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {typeOrder.map((type) => {
          const items = groupedByType[type];
          if (items.length === 0) return null;

          return (
            <div key={type} className={cn("rounded-[24px] border p-4 md:p-5", themeClasses.soft)}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-base font-semibold">{typeLabel(type)}</p>
                <span className={cn("inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold", themeClasses.chip)}>{items.length}</span>
              </div>

              <div className="space-y-3">
                {items.map((acc) => {
                  const Icon = cardIconByType(acc.type);
                  const isActive = activeAccountId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className={cn(
                        "rounded-[22px] border p-4 shadow-sm transition-all dark:bg-slate-950/60",
                        isActive ? themeClasses.accentSoft : "bg-white/90",
                        themeClasses.accentBorder,
                        isActive && "ring-2 ring-offset-2 ring-offset-transparent",
                        colorTheme === "pink" && isActive && "ring-pink-400/70",
                        colorTheme === "sky" && isActive && "ring-sky-400/70",
                        colorTheme === "indigo" && isActive && "ring-indigo-400/70",
                        colorTheme === "green" && isActive && "ring-green-400/70"
                      )}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveAccountId((current) => (current === acc.id ? "" : acc.id))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveAccountId((current) => (current === acc.id ? "" : acc.id));
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={cn("rounded-2xl p-3", isActive ? "bg-white/70 dark:bg-slate-900/70" : themeClasses.iconSoft)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-base font-semibold uppercase">{acc.name}</p>
                              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", themeClasses.chip)}>{typeLabel(acc.type)}</span>
                            </div>
                            {/* <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{maskAccountNumber(acc.accountNumber)}</p> */}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-semibold tracking-tight md:text-2xl">Rp {acc.balance.toLocaleString("id-ID")}</p>
                          <div className={cn("rounded-full p-1.5 transition-transform duration-300", isActive && "rotate-180", themeClasses.iconSoft)}>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-out",
                          isActive ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-black/5 pt-4 dark:border-white/10">
                            <div className="grid grid-cols-3 gap-2">
                              <div className={cn("rounded-2xl border px-3 py-3", themeClasses.accentSoft, themeClasses.accentBorder)}>
                                <PiggyBank className="h-4 w-4" />
                                <p className="mt-3 text-sm font-medium">Rp {acc.initialBalance.toLocaleString("id-ID")}</p>
                              </div>
                              <div className={cn("rounded-2xl border px-3 py-3", themeClasses.accentSoft, themeClasses.accentBorder)}>
                                <ArrowDownLeft className="h-4 w-4" />
                                <p className="mt-3 text-sm font-medium">Rp {acc.income.toLocaleString("id-ID")}</p>
                              </div>
                              <div className={cn("rounded-2xl border px-3 py-3", themeClasses.accentSoft, themeClasses.accentBorder)}>
                                <ArrowUpRight className="h-4 w-4" />
                                <p className="mt-3 text-sm font-medium">Rp {acc.expense.toLocaleString("id-ID")}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                              <Button size="sm" variant="outline" className="h-9 w-9 px-0" onClick={(e) => { e.stopPropagation(); setActiveAccountId(acc.id); setTransferError(""); setFromAccountId(acc.id); setToAccountId(""); setTransferAmount(""); setTransferDate(getJakartaToday()); setTransferNote(""); setIsTransferDialogOpen(true); }} aria-label="Transfer" title="Transfer">
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-9 w-9 px-0" onClick={(e) => { e.stopPropagation(); setActiveAccountId(acc.id); setIsHistoryDialogOpen(true); }} aria-label="Riwayat" title="Riwayat">
                                <History className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-9 w-9 px-0" onClick={(e) => { e.stopPropagation(); setActiveAccountId(acc.id); setAccountName(acc.name); setAccountNumber(acc.accountNumber); setAccountType(acc.type); setInitialBalance(String(acc.initialBalance)); setError(""); setIsEditDialogOpen(true); }} aria-label="Edit" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-9 w-9 px-0 text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); if (activeAccountId === acc.id) setActiveAccountId(""); setReloadKey((v) => v + 1); }} aria-label="Hapus" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {balances.length === 0 && (
          <div className={cn("rounded-[24px] border border-dashed p-8 text-center text-sm xl:col-span-2", themeClasses.soft)}>
            <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-2xl", themeClasses.iconSoft)}>
              <Wallet className="h-5 w-5" />
            </div>
            <Button type="button" size="sm" onClick={() => { resetAccountForm(); setIsAddDialogOpen(true); }} className={cn("mt-4 text-white", themeClasses.action)}>
              <Plus className="mr-1 h-4 w-4" />
              Tambah Rekening
            </Button>
          </div>
        )}
      </section>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-md border", themeClasses.soft)}>
          <DialogHeader>
            <DialogTitle>Tambah Rekening</DialogTitle>
            <DialogDescription>Buat rekening baru dengan cepat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input placeholder="Nama rekening (contoh: BCA Utama)" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <Input placeholder="No rekening" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <Select value={accountType} onValueChange={(value: AccountType) => setAccountType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe rekening" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Saldo awal" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
            <Button className={cn("text-white", themeClasses.action)} onClick={handleCreateAccount}>Simpan rekening</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-md border", themeClasses.soft)}>
          <DialogHeader>
            <DialogTitle>Edit Rekening</DialogTitle>
            <DialogDescription>Update info rekening.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input placeholder="Nama rekening" className="uppercase" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <Input placeholder="No rekening" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <Select value={accountType} onValueChange={(value: AccountType) => setAccountType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe rekening" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Saldo awal" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button className={cn("text-white", themeClasses.action)} onClick={handleEditAccount}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-md border", themeClasses.soft)}>
          <DialogHeader>
            <DialogTitle>Transfer Antar Rekening</DialogTitle>
            <DialogDescription>{fromAccountId ? `Dari ${accountNameMap.get(fromAccountId) ?? "rekening dipilih"}` : "Pilih rekening asal dan tujuan."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {transferError && <p className="text-sm text-red-600">{transferError}</p>}
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger><SelectValue placeholder="Rekening asal" /></SelectTrigger>
              <SelectContent>{accounts.map((acc) => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger><SelectValue placeholder="Rekening tujuan" /></SelectTrigger>
              <SelectContent>{accounts.map((acc) => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Nominal transfer" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
            <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
            <Input placeholder="Catatan (opsional)" value={transferNote} onChange={(e) => setTransferNote(e.target.value)} />
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Batal</Button>
            <Button className={cn("text-white", themeClasses.action)} onClick={handleTransfer}><ArrowRightLeft className="mr-1 h-4 w-4" />Proses Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className={cn("w-[92vw] max-w-xl border", themeClasses.soft)}>
          <DialogHeader>
            <DialogTitle>Riwayat Transfer</DialogTitle>
            <DialogDescription>{activeAccountId ? `Rekening: ${accountNameMap.get(activeAccountId) ?? "-"}` : "Pilih rekening."}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {activeAccountTransfers.slice(0, 20).map((tr) => (
              <div key={tr.id} className="rounded-xl border border-neutral-200/80 bg-white/70 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/60">
                <p className="font-medium">
                  {accountNameMap.get(tr.fromAccountId) ?? "Asal"}
                  {" -> "}
                  {accountNameMap.get(tr.toAccountId) ?? "Tujuan"}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Rp {tr.amount.toLocaleString("id-ID")} | {tr.date}
                </p>
                {tr.note && <p className="text-neutral-500 dark:text-neutral-400">{tr.note}</p>}
              </div>
            ))}
            {activeAccountTransfers.length === 0 && <p className="text-sm text-neutral-500">Belum ada riwayat transfer untuk rekening ini.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
