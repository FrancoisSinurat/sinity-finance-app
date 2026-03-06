"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Upload, X } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showUpload?: boolean;
  className?: string;
};

export function Logo({ size = "md", showUpload = false, className = "" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { colorTheme } = useTheme();

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        // Save to localStorage for persistence
        localStorage.setItem("appLogo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    localStorage.removeItem("appLogo");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem("appLogo");
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        className={cn(
          `${sizeClasses[size]} rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center relative group transition-all duration-300 hover:scale-110 hover:shadow-xl`,
          colorTheme === "pink" && "from-pink-400 to-pink-500 hover:shadow-pink-500/20 dark:from-pink-500 dark:to-pink-600 dark:hover:shadow-pink-500/30",
          colorTheme === "sky" && "from-sky-400 to-sky-500 hover:shadow-sky-500/20 dark:from-sky-500 dark:to-sky-600 dark:hover:shadow-sky-500/30",
          colorTheme === "indigo" && "from-indigo-400 to-indigo-500 hover:shadow-indigo-500/20 dark:from-indigo-500 dark:to-indigo-600 dark:hover:shadow-indigo-500/30",
          colorTheme === "green" && "from-green-400 to-green-500 hover:shadow-green-500/20 dark:from-green-500 dark:to-green-600 dark:hover:shadow-green-500/30",
          showUpload ? "cursor-pointer" : "cursor-default"
        )}
        onClick={() => showUpload && fileInputRef.current?.click()}
      >
        {logoUrl ? (
          <>
            <Image
              src={logoUrl}
              alt="Logo"
              fill
              className="rounded-2xl object-cover"
              unoptimized
            />
            {showUpload && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <Sparkles className={`text-white ${size === "lg" ? "w-12 h-12" : size === "md" ? "w-8 h-8" : "w-5 h-5"}`} />
        )}
      </div>

      {showUpload && logoUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveLogo();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="Remove logo"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />
    </div>
  );
}

