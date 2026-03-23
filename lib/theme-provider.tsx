"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ColorTheme = "pink" | "sky" | "indigo" | "green";

type ThemeContextType = {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorTheme: (color: ColorTheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default values, will be updated in useEffect
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return savedTheme || (prefersDark ? "dark" : "light");
    }
    return "light";
  });
  
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme | null;
      return savedColorTheme || "pink";
    }
    return "pink";
  });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    const initialColorTheme = savedColorTheme || "pink";
    setTheme(initialTheme);
    setColorThemeState(initialColorTheme);
    updateTheme(initialTheme);
    updateColorTheme(initialColorTheme);
  }, []);

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const updateColorTheme = (newColorTheme: ColorTheme) => {
    const root = document.documentElement;
    // Remove all color theme classes
    root.classList.remove("theme-pink", "theme-sky", "theme-indigo", "theme-green");
    // Add new color theme class
    root.classList.add(`theme-${newColorTheme}`);
    localStorage.setItem("colorTheme", newColorTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    updateColorTheme(color);
  };

  // Always provide context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setTheme: setThemeValue, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

