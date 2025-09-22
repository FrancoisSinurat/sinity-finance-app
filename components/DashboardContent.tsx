"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const pemasukanData = [
  { name: "Gaji", value: 4000 },
  { name: "Freelance", value: 2000 },
  { name: "Investasi", value: 1500 },
];

const pengeluaranData = [
  { name: "Makan", value: 2000 },
  { name: "Transport", value: 1000 },
  { name: "Hiburan", value: 1500 },
];

const tabunganData = [
  { name: "Tabungan A", value: 3000 },
  { name: "Tabungan B", value: 1500 },
];

const daruratData = [
  { name: "Dana Darurat A", value: 1000 },
  { name: "Dana Darurat B", value: 500 },
];

const wishlistData = [
  { name: "Laptop", value: 2500 },
  { name: "Liburan", value: 2000 },
];

const COLORS = ["#FF6B6B", "#FF8FAB", "#FFC1D6", "#FFDAE3", "#FFD6E8"];

export default function DashboardContent() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-700">
          Bulan Ini
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-pink-600">
          Total: Rp 7.500.000
        </p>
      </div>

      {/* Grid Pemasukan & Pengeluaran (Chart Besar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="Pemasukan" data={pemasukanData} size="lg" />
        <ChartCard title="Pengeluaran" data={pengeluaranData} size="lg" />
      </div>

      {/* Grid Tabungan, Dana Darurat, Wishlist (Chart Sedang) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ChartCard title="Tabungan" data={tabunganData} size="md" />
        <ChartCard title="Dana Darurat" data={daruratData} size="md" />
        <ChartCard title="Wishlist" data={wishlistData} size="md" />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  size = "md",
}: {
  title: string;
  data: { name: string; value: number }[];
  size?: "lg" | "md";
}) {
  const radius = size === "lg" ? "85%" : "70%";
  const height = size === "lg" ? "h-96" : "h-64";

  return (
    <div className="text-center space-y-4 rounded-2xl p-4">
      <h2 className="text-2xl font-semibold text-pink-700">{title}</h2>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={radius}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

