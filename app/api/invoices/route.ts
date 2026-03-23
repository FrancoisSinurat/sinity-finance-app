import { NextResponse } from "next/server";
import { Invoice } from "@/lib/types";
import { getJakartaToday } from "@/lib/date-time";

let INVOICES: Invoice[] = [
  { id: "1", title: "Belanja Bulanan", amount: 1200000, date: "2025-08-01", status: "Lunas", by: "aku" },
  { id: "2", title: "Makan Malam", amount: 250000, date: "2025-08-05", status: "Belum Bayar", by: "pasangan" },
  { id: "3", title: "Listrik", amount: 475000, date: "2025-08-10", status: "Belum Bayar", by: "aku" },
];

export async function GET() {
  return NextResponse.json(INVOICES, { status: 200 });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Invoice>;
  const id = crypto.randomUUID();
  const inv: Invoice = {
    id,
    title: body.title ?? "Tanpa Judul",
    amount: Number(body.amount ?? 0),
    date: body.date ?? getJakartaToday(),
    status: (body.status as Invoice["status"]) ?? "Belum Bayar",
    by: (body.by as Invoice["by"]) ?? "aku",
  };
  INVOICES.unshift(inv);
  return NextResponse.json(inv, { status: 201 });
}
