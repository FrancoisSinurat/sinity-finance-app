"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-provider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Moon, Sun, Bell, Shield, Database, Globe, BellRing, Mail, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, toggleTheme, colorTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    dataSharing: false,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          )}>
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Appearance</h2>
        </div>

        <div className="space-y-4">
          {/* Theme Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Theme Mode</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30",
                colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/30",
                colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30",
                colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30",
              )}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>

          {/* Color Theme Selector */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div className="mb-3">
              <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Color Theme</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          )}>
            <Bell size={20} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Mail size={18} className="text-neutral-600 dark:text-neutral-400 flex-shrink-0 sm:w-5 sm:h-5" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-100">Email Notifications</p>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className={cn(
                "w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600",
                colorTheme === "pink" && "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-500",
                colorTheme === "sky" && "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-500",
                colorTheme === "indigo" && "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-500",
                colorTheme === "green" && "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-500",
              )}></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <BellRing size={20} className="text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Push Notifications</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Receive push notifications in browser
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="sr-only peer"
              />
              <div className={cn(
                "w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600",
                colorTheme === "pink" && "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-500",
                colorTheme === "sky" && "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-500",
                colorTheme === "indigo" && "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-500",
                colorTheme === "green" && "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-500",
              )}></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">SMS Notifications</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Receive notifications via SMS
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                className="sr-only peer"
              />
              <div className={cn(
                "w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600",
                colorTheme === "pink" && "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-500",
                colorTheme === "sky" && "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-500",
                colorTheme === "indigo" && "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-500",
                colorTheme === "green" && "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-500",
              )}></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          )}>
            <Shield size={20} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Privacy</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <label className="block mb-2 font-medium text-neutral-900 dark:text-neutral-100">
              Profile Visibility
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
              className={cn(
                "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
              )}
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Data Sharing</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Allow data sharing for analytics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.dataSharing}
                onChange={(e) => setPrivacy({ ...privacy, dataSharing: e.target.checked })}
                className="sr-only peer"
              />
              <div className={cn(
                "w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600",
                colorTheme === "pink" && "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-500",
                colorTheme === "sky" && "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-500",
                colorTheme === "indigo" && "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-500",
                colorTheme === "green" && "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-500",
              )}></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          )}>
            <Database size={20} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Data Management</h2>
        </div>

        <div className="space-y-4">
          <button className={cn(
            "w-full flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors",
            colorTheme === "pink" && "hover:bg-pink-50 dark:hover:bg-pink-900/10",
            colorTheme === "sky" && "hover:bg-sky-50 dark:hover:bg-sky-900/10",
            colorTheme === "indigo" && "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
            colorTheme === "green" && "hover:bg-green-50 dark:hover:bg-green-900/10",
          )}>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">Export Data</span>
            <Globe size={16} className="text-neutral-600 dark:text-neutral-400" />
          </button>

          <button className={cn(
            "w-full flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          )}>
            <span className="font-medium">Delete Account</span>
            <span className="text-sm">Permanent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

