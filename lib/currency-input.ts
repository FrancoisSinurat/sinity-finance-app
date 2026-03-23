export function stripToDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

export function formatCurrencyInput(value: string): string {
  const digits = stripToDigits(value);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export function parseCurrencyInput(value: string): number {
  const digits = stripToDigits(value);
  return digits ? Number(digits) : 0;
}

export function formatCurrencyCompactLabel(value: string | number): string {
  const amount = typeof value === "number" ? value : parseCurrencyInput(value);
  if (!amount) return "Nol rupiah";
  if (amount >= 1_000_000_000_000) {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(amount / 1_000_000_000_000)} triliun`;
  }
  if (amount >= 1_000_000_000) {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(amount / 1_000_000_000)} miliar`;
  }
  if (amount >= 1_000_000) {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(amount / 1_000_000)} juta`;
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(amount / 1_000)} ribu`;
  }
  return `${new Intl.NumberFormat("id-ID").format(amount)} rupiah`;
}
