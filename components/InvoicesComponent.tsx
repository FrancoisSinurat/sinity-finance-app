"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Invoice = {
  id: number;
  date: string;
  amount: number;
  note: string;
  category: string;
};

const pemasukkanData: Invoice[] = [
  { id: 1, date: "2025-08-01", amount: 500000, note: "Gaji Freelance", category: "Gaji" },
  { id: 2, date: "2025-08-05", amount: 200000, note: "Bonus Project", category: "Bonus" },
  { id: 3, date: "2025-08-08", amount: 150000, note: "Jual Barang", category: "Penjualan" },
  { id: 4, date: "2025-08-10", amount: 300000, note: "Jasa Design", category: "Gaji" },
  { id: 5, date: "2025-08-15", amount: 120000, note: "Cashback", category: "Bonus" },
];

const pengeluaranData: Invoice[] = [
  { id: 1, date: "2025-08-02", amount: 100000, note: "Makan Siang", category: "Makan" },
  { id: 2, date: "2025-08-04", amount: 50000, note: "Transport Grab", category: "Transport" },
  { id: 3, date: "2025-08-07", amount: 200000, note: "Belanja Bulanan", category: "Belanja" },
  { id: 4, date: "2025-08-12", amount: 80000, note: "Ngopi", category: "Makan" },
  { id: 5, date: "2025-08-14", amount: 120000, note: "Ongkos Motor", category: "Transport" },
];

function InvoicesPage({ title, data }: { title: string; data: Invoice[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 3;

  const categories = Array.from(new Set(data.map((d) => d.category)));

  let filtered = data.filter(
    (d) =>
      d.note.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy) {
    filtered = filtered.filter((d) => d.category === sortBy);
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen  bg-pink-50 rounded-lg p-4 md:p-8">
      <div className="max-w-full space-y-4">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-pink-700">{title}</h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="mt-24">
          </div>  
          <div className="flex items-center gap-2">
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-white"
          />
            <Select onValueChange={(val) => console.log("sort:", val)}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="latest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="highest">Nominal Tertinggi</SelectItem>
                <SelectItem value="lowest">Nominal Terendah</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow">
              + Tambah
            </Button>
          </div>
        </div>

        {/* Filter kategori */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={sortBy === cat ? "default" : "outline"}
              onClick={() => setSortBy(sortBy === cat ? null : cat)}
              className={`rounded-full px-4 py-1 transition ${
                sortBy === cat
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "border-pink-300 text-pink-600 hover:bg-pink-100"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-lg  ">
          <table className="w-full text-sm text-center">
            <thead className="bg-pink-100 text-pink-700">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv, idx) => (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-pink-50 transition"
                >
                  <td className="px-4 py-3">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3">{inv.date}</td>
                  <td className="px-4 py-3 font-semibold text-pink-700">
                    Rp {inv.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">{inv.note}</td>
                  <td className="px-4 py-3">{inv.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm text-neutral-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}    
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InvoicesPemasukkanPage() {
  return <InvoicesPage title="Invoices Pemasukkan" data={pemasukkanData} />;
}

export function InvoicesPengeluaranPage() {
  return <InvoicesPage title="Invoices Pengeluaran" data={pengeluaranData} />;
}
