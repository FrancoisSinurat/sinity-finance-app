import { ColorTheme } from "./theme-provider";
import { cn } from "./utils";

export function getThemeColor(colorTheme: ColorTheme): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
} {
  const themes = {
    pink: {
      50: "pink-50",
      100: "pink-100",
      200: "pink-200",
      300: "pink-300",
      400: "pink-400",
      500: "pink-500",
      600: "pink-600",
    },
    sky: {
      50: "sky-50",
      100: "sky-100",
      200: "sky-200",
      300: "sky-300",
      400: "sky-400",
      500: "sky-500",
      600: "sky-600",
    },
    indigo: {
      50: "indigo-50",
      100: "indigo-100",
      200: "indigo-200",
      300: "indigo-300",
      400: "indigo-400",
      500: "indigo-500",
      600: "indigo-600",
    },
    green: {
      50: "green-50",
      100: "green-100",
      200: "green-200",
      300: "green-300",
      400: "green-400",
      500: "green-500",
      600: "green-600",
    },
  };

  return themes[colorTheme];
}

// Helper function untuk mendapatkan class dengan conditional
export function getThemeClass(
  colorTheme: ColorTheme,
  baseClass: string,
  variants: {
    pink?: string;
    sky?: string;
    indigo?: string;
    green?: string;
  }
): string {
  return cn(
    baseClass,
    colorTheme === "pink" && variants.pink,
    colorTheme === "sky" && variants.sky,
    colorTheme === "indigo" && variants.indigo,
    colorTheme === "green" && variants.green
  );
}

// Helper untuk mendapatkan warna chart berdasarkan theme
export function getChartColors(colorTheme: ColorTheme, isDark: boolean = false): string[] {
  if (isDark) {
    return ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];
  }

  const colors = {
    pink: ["#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8", "#FCE7F3"],
    sky: ["#0EA5E9", "#38BDF8", "#7DD3FC", "#BAE6FD", "#E0F2FE"],
    indigo: ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF"],
    green: ["#22C55E", "#4ADE80", "#86EFAC", "#BBF7D0", "#DCFCE7"],
  };

  return colors[colorTheme];
}

