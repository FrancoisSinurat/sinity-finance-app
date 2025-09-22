import { NextResponse } from "next/server";
import { Invoice } from "@/lib/types";

declare const INVOICES: Invoice[]; // shared from module cache of /api/invoices/route, but if isolated, reimport state mgkn berbeda.

let store: Invoice[] = (globalThis as any).__MEMO__INVOICES__ ?? [];
if (!store.length) {
  (globalThis as any).__MEMO__INVOICES__ = store;
}

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const idx = store.findIndex((i) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await _req.json();
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const idx = store.findIndex((i) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const removed = store.splice(idx, 1)[0];
  return NextResponse.json(removed);
}
