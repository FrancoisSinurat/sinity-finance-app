import { ColorTheme } from "./theme-provider";
import { cn } from "./utils";

// Helper untuk mendapatkan class berdasarkan color theme
export function getThemeClasses(colorTheme: ColorTheme, baseClasses: string) {
  return {
    bg50: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-50",
      colorTheme === "sky" && "bg-sky-50",
      colorTheme === "indigo" && "bg-indigo-50",
      colorTheme === "green" && "bg-green-50",
    ),
    bg100: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-100",
      colorTheme === "sky" && "bg-sky-100",
      colorTheme === "indigo" && "bg-indigo-100",
      colorTheme === "green" && "bg-green-100",
    ),
    bg200: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-200",
      colorTheme === "sky" && "bg-sky-200",
      colorTheme === "indigo" && "bg-indigo-200",
      colorTheme === "green" && "bg-green-200",
    ),
    bg400: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-400",
      colorTheme === "sky" && "bg-sky-400",
      colorTheme === "indigo" && "bg-indigo-400",
      colorTheme === "green" && "bg-green-400",
    ),
    bg500: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-500",
      colorTheme === "sky" && "bg-sky-500",
      colorTheme === "indigo" && "bg-indigo-500",
      colorTheme === "green" && "bg-green-500",
    ),
    bg600: cn(
      baseClasses,
      colorTheme === "pink" && "bg-pink-600",
      colorTheme === "sky" && "bg-sky-600",
      colorTheme === "indigo" && "bg-indigo-600",
      colorTheme === "green" && "bg-green-600",
    ),
    text400: cn(
      baseClasses,
      colorTheme === "pink" && "text-pink-400",
      colorTheme === "sky" && "text-sky-400",
      colorTheme === "indigo" && "text-indigo-400",
      colorTheme === "green" && "text-green-400",
    ),
    text500: cn(
      baseClasses,
      colorTheme === "pink" && "text-pink-500",
      colorTheme === "sky" && "text-sky-500",
      colorTheme === "indigo" && "text-indigo-500",
      colorTheme === "green" && "text-green-500",
    ),
    text600: cn(
      baseClasses,
      colorTheme === "pink" && "text-pink-600",
      colorTheme === "sky" && "text-sky-600",
      colorTheme === "indigo" && "text-indigo-600",
      colorTheme === "green" && "text-green-600",
    ),
    border200: cn(
      baseClasses,
      colorTheme === "pink" && "border-pink-200",
      colorTheme === "sky" && "border-sky-200",
      colorTheme === "indigo" && "border-indigo-200",
      colorTheme === "green" && "border-green-200",
    ),
    border400: cn(
      baseClasses,
      colorTheme === "pink" && "border-pink-400",
      colorTheme === "sky" && "border-sky-400",
      colorTheme === "indigo" && "border-indigo-400",
      colorTheme === "green" && "border-green-400",
    ),
    from500: cn(
      baseClasses,
      colorTheme === "pink" && "from-pink-500",
      colorTheme === "sky" && "from-sky-500",
      colorTheme === "indigo" && "from-indigo-500",
      colorTheme === "green" && "from-green-500",
    ),
    to500: cn(
      baseClasses,
      colorTheme === "pink" && "to-pink-500",
      colorTheme === "sky" && "to-sky-500",
      colorTheme === "indigo" && "to-indigo-500",
      colorTheme === "green" && "to-green-500",
    ),
    from400: cn(
      baseClasses,
      colorTheme === "pink" && "from-pink-400",
      colorTheme === "sky" && "from-sky-400",
      colorTheme === "indigo" && "from-indigo-400",
      colorTheme === "green" && "from-green-400",
    ),
    to400: cn(
      baseClasses,
      colorTheme === "pink" && "to-pink-400",
      colorTheme === "sky" && "to-sky-400",
      colorTheme === "indigo" && "to-indigo-400",
      colorTheme === "green" && "to-green-400",
    ),
  };
}

