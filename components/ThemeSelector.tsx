"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme-provider";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const colorThemes = [
  { name: "pink", label: "Pink", color: "#ec4899" },
  { name: "sky", label: "Sky Blue", color: "#0ea5e9" },
  { name: "indigo", label: "Indigo", color: "#6366f1" },
  { name: "green", label: "Green", color: "#22c55e" },
] as const;

export function ThemeSelector({ onChange }: { onChange?: (theme: "pink" | "sky" | "indigo" | "green") => void }) {
  const { colorTheme, setColorTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-slate-700 p-2 min-w-[200px]">
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-1 mb-1">
              Choose Color
            </div>
            <div className="flex flex-col gap-1">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    const selected = theme.name as "pink" | "sky" | "indigo" | "green";
                    setColorTheme(selected);
                    onChange?.(selected);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    colorTheme === theme.name
                      ? "bg-neutral-100 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100"
                      : "hover:bg-neutral-50 dark:hover:bg-slate-800 text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-slate-600"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="font-medium">{theme.label}</span>
                  {colorTheme === theme.name && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-current" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

