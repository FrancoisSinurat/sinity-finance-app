export type InvoiceStatus = "Lunas" | "Belum Bayar";

export type Invoice = {
  id: string;
  title: string;
  amount: number;      // dalam rupiah
  date: string;        // ISO string
  status: InvoiceStatus;
  by: "aku" | "pasangan";
};
