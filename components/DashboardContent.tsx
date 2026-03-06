"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "@/lib/theme-provider";
import { getChartColors } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, PiggyBank, Shield, Heart } from "lucide-react";

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

export default function DashboardContent() {
  const { colorTheme } = useTheme();
  
  // Calculate totals
  const totalPemasukan = pemasukanData.reduce((sum, item) => sum + item.value, 0);
  const totalPengeluaran = pengeluaranData.reduce((sum, item) => sum + item.value, 0);
  const totalTabungan = tabunganData.reduce((sum, item) => sum + item.value, 0);
  const totalDarurat = daruratData.reduce((sum, item) => sum + item.value, 0);
  const totalWishlist = wishlistData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn(
          "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent",
          colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-500 dark:from-pink-400 dark:to-pink-400",
          colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-500 dark:from-sky-400 dark:to-sky-400",
          colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-500 dark:from-indigo-400 dark:to-indigo-400",
          colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-500 dark:from-green-400 dark:to-green-400",
        )}>
          Bulan Ini
        </h1>
        <p className={cn(
          "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold",
          colorTheme === "pink" && "text-pink-500 dark:text-pink-400",
          colorTheme === "sky" && "text-sky-500 dark:text-sky-400",
          colorTheme === "indigo" && "text-indigo-500 dark:text-indigo-400",
          colorTheme === "green" && "text-green-500 dark:text-green-400",
        )}>
          Total: Rp {totalPemasukan.toLocaleString("id-ID")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <SummaryCard
          title="Pemasukan"
          value={totalPemasukan}
          icon={TrendingUp}
          colorTheme={colorTheme}
        />
        <SummaryCard
          title="Pengeluaran"
          value={totalPengeluaran}
          icon={TrendingDown}
          colorTheme={colorTheme}
        />
        <SummaryCard
          title="Tabungan"
          value={totalTabungan}
          icon={PiggyBank}
          colorTheme={colorTheme}
        />
        <SummaryCard
          title="Dana Darurat"
          value={totalDarurat}
          icon={Shield}
          colorTheme={colorTheme}
        />
      </div>

      {/* Grid Pemasukan & Pengeluaran (Chart Besar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <ChartCard 
          title="Pemasukan" 
          data={pemasukanData} 
          size="lg"
          total={totalPemasukan}
        />
        <ChartCard 
          title="Pengeluaran" 
          data={pengeluaranData} 
          size="lg"
          total={totalPengeluaran}
        />
      </div>

      {/* Grid Tabungan, Dana Darurat, Wishlist (Chart Sedang) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <ChartCard 
          title="Tabungan" 
          data={tabunganData} 
          size="md"
          total={totalTabungan}
        />
        <ChartCard 
          title="Dana Darurat" 
          data={daruratData} 
          size="md"
          total={totalDarurat}
        />
        <ChartCard 
          title="Wishlist" 
          data={wishlistData} 
          size="md"
          total={totalWishlist}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  colorTheme,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorTheme: "pink" | "sky" | "indigo" | "green";
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-xl border shadow-md hover:shadow-lg transition-all duration-300 group",
      colorTheme === "pink" && "bg-gradient-to-br from-pink-50/80 to-pink-100/50 dark:from-slate-900/90 dark:to-slate-800/70 border-pink-200/50 dark:border-slate-800",
      colorTheme === "sky" && "bg-gradient-to-br from-sky-50/80 to-sky-100/50 dark:from-slate-900/90 dark:to-slate-800/70 border-sky-200/50 dark:border-slate-800",
      colorTheme === "indigo" && "bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 dark:from-slate-900/90 dark:to-slate-800/70 border-indigo-200/50 dark:border-slate-800",
      colorTheme === "green" && "bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-slate-900/90 dark:to-slate-800/70 border-green-200/50 dark:border-slate-800",
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">
            {title}
          </p>
          <p className={cn(
            "text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold truncate",
            colorTheme === "pink" && "text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "text-green-600 dark:text-green-400",
          )}>
            Rp {value.toLocaleString("id-ID")}
          </p>
        </div>
        <div className={cn(
          "p-1.5 sm:p-2 md:p-3 rounded-lg flex-shrink-0",
          colorTheme === "pink" && "bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
          colorTheme === "sky" && "bg-sky-100/50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
          colorTheme === "indigo" && "bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
          colorTheme === "green" && "bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        )}>
          <Icon size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  size = "md",
  total,
}: {
  title: string;
  data: { name: string; value: number }[];
  size?: "lg" | "md";
  total?: number;
}) {
  const { theme, colorTheme } = useTheme();
  const radius = size === "lg" ? "75%" : "65%";
  const height = size === "lg" ? "h-[400px] md:h-[450px]" : "h-[300px] md:h-[350px]";
  const isDark = theme === "dark";
  
  // Warna chart yang lebih nyaman untuk dark mode dengan variasi yang lebih baik
  const darkColors = [
    colorTheme === "pink" ? "#ec4899" : colorTheme === "sky" ? "#0ea5e9" : colorTheme === "indigo" ? "#6366f1" : "#22c55e",
    colorTheme === "pink" ? "#f472b6" : colorTheme === "sky" ? "#38bdf8" : colorTheme === "indigo" ? "#818cf8" : "#4ade80",
    colorTheme === "pink" ? "#f9a8d4" : colorTheme === "sky" ? "#7dd3fc" : colorTheme === "indigo" ? "#a5b4fc" : "#86efac",
    colorTheme === "pink" ? "#fbcfe8" : colorTheme === "sky" ? "#bae6fd" : colorTheme === "indigo" ? "#c7d2fe" : "#bbf7d0",
    colorTheme === "pink" ? "#fce7f3" : colorTheme === "sky" ? "#e0f2fe" : colorTheme === "indigo" ? "#e0e7ff" : "#dcfce7",
  ];
  const colors = isDark ? darkColors : getChartColors(colorTheme, false);

  // Custom label function
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / (total || entry.value)) * 100).toFixed(0);
    return `${percent}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = total ? ((data.value / total) * 100).toFixed(1) : "0";
      return (
        <div className={cn(
          "px-3 py-2 rounded-lg shadow-lg border backdrop-blur-xl",
          isDark 
            ? "bg-slate-900/95 border-slate-700 text-slate-100"
            : "bg-white/95 border-neutral-200 text-neutral-900"
        )}>
          <p className="font-semibold text-sm">{data.name}</p>
          <p className={cn(
            "text-lg font-bold",
            colorTheme === "pink" && "text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "text-green-600 dark:text-green-400",
          )}>
            Rp {data.value.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
            {percent}% dari total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 group",
      colorTheme === "pink" && "bg-gradient-to-br from-white/90 to-pink-50/30 dark:from-slate-900/95 dark:to-slate-800/70 border-pink-200/50 dark:border-slate-800",
      colorTheme === "sky" && "bg-gradient-to-br from-white/90 to-sky-50/30 dark:from-slate-900/95 dark:to-slate-800/70 border-sky-200/50 dark:border-slate-800",
      colorTheme === "indigo" && "bg-gradient-to-br from-white/90 to-indigo-50/30 dark:from-slate-900/95 dark:to-slate-800/70 border-indigo-200/50 dark:border-slate-800",
      colorTheme === "green" && "bg-gradient-to-br from-white/90 to-green-50/30 dark:from-slate-900/95 dark:to-slate-800/70 border-green-200/50 dark:border-slate-800",
    )}>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className={cn(
          "text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent mb-2",
          colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500",
          colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-400 dark:to-sky-500",
          colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500",
          colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500",
        )}>
          {title}
        </h2>
        {total && (
          <p className={cn(
            "text-sm md:text-base text-neutral-600 dark:text-slate-300",
          )}>
            Total: Rp {total.toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* Chart */}
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
              innerRadius={size === "lg" ? "45%" : "40%"}
              paddingAngle={2}
              label={renderLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell 
                  key={index} 
                  fill={colors[index % colors.length]}
                  stroke={isDark ? "#1e293b" : "#ffffff"}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
              formatter={(value: string) => (
                <span className="text-xs md:text-sm text-neutral-700 dark:text-slate-200">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Items */}
      <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {data.map((item, index) => {
          const percent = total ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/70 backdrop-blur-sm border dark:border-slate-700/50"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 border dark:border-slate-600"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-700 dark:text-slate-200 truncate">
                  {item.name}
                </p>
                <p className={cn(
                  "text-xs font-semibold",
                  colorTheme === "pink" && "text-pink-600 dark:text-pink-400",
                  colorTheme === "sky" && "text-sky-600 dark:text-sky-400",
                  colorTheme === "indigo" && "text-indigo-600 dark:text-indigo-400",
                  colorTheme === "green" && "text-green-600 dark:text-green-400",
                )}>
                  {percent}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

