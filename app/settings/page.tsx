"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme-provider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Moon, Sun, Bell, Shield, Database, Globe, BellRing, Mail, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { settingsService, ApiError } from "@/lib/api";
import type { SettingsUpdatePayload } from "@/lib/api";

type NotificationsState = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

type PrivacyState = {
  profileVisibility: "public" | "friends" | "private";
  dataSharing: boolean;
};

function parseError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export default function SettingsPage() {
  const { theme, toggleTheme, colorTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationsState>({
    email: true,
    push: false,
    sms: false,
  });
  const [privacy, setPrivacy] = useState<PrivacyState>({
    profileVisibility: "public",
    dataSharing: false,
  });

  const saveSettings = async (payload: SettingsUpdatePayload, successMessage = "Settings berhasil disimpan") => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await settingsService.update(payload);
      setNotifications({
        email: updated.notify_email,
        push: updated.notify_push,
        sms: updated.notify_sms,
      });
      setPrivacy({
        profileVisibility: updated.profile_visibility,
        dataSharing: updated.data_sharing,
      });
      setTheme(updated.theme);
      setMessage(successMessage);
    } catch (err) {
      setMessage(parseError(err, "Gagal menyimpan settings"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      setLoading(true);
      setMessage("");
      try {
        const data = await settingsService.get();
        if (!mounted) return;
        setNotifications({
          email: data.notify_email,
          push: data.notify_push,
          sms: data.notify_sms,
        });
        setPrivacy({
          profileVisibility: data.profile_visibility,
          dataSharing: data.data_sharing,
        });
        setTheme(data.theme);
      } catch (err) {
        if (!mounted) return;
        setMessage(parseError(err, "Gagal memuat settings"));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, [setTheme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    void saveSettings({ theme: nextTheme }, "Theme berhasil disimpan");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Manage your application settings and preferences
        </p>
      </div>

      {message && (
        <div
          className={cn(
            "text-sm rounded-lg px-3 py-2",
            message.toLowerCase().includes("berhasil")
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-neutral-200 dark:border-slate-800 p-6 text-sm text-neutral-600 dark:text-neutral-400">
          Memuat settings...
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}
              >
                {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">Theme Mode</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch between light and dark mode</p>
                </div>
                <button
                  onClick={handleToggleTheme}
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50",
                    colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30",
                    colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/30",
                    colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30",
                    colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                  )}
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
                <div className="mb-3">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Color Theme</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose your preferred color scheme</p>
                </div>
                <ThemeSelector
                  onChange={(selected) => {
                    void saveSettings({ color_theme: selected }, "Color theme berhasil disimpan");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}
              >
                <Bell size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <ToggleCard
                title="Email Notifications"
                subtitle="Receive notifications via email"
                checked={notifications.email}
                icon={<Mail size={18} className="text-neutral-600 dark:text-neutral-400 flex-shrink-0 sm:w-5 sm:h-5" />}
                colorTheme={colorTheme}
                disabled={saving}
                onChange={(checked) => {
                  setNotifications((prev) => ({ ...prev, email: checked }));
                  void saveSettings({ notify_email: checked }, "Preferensi email disimpan");
                }}
              />
              <ToggleCard
                title="Push Notifications"
                subtitle="Receive push notifications in browser"
                checked={notifications.push}
                icon={<BellRing size={20} className="text-neutral-600 dark:text-neutral-400" />}
                colorTheme={colorTheme}
                disabled={saving}
                onChange={(checked) => {
                  setNotifications((prev) => ({ ...prev, push: checked }));
                  void saveSettings({ notify_push: checked }, "Preferensi push disimpan");
                }}
              />
              <ToggleCard
                title="SMS Notifications"
                subtitle="Receive notifications via SMS"
                checked={notifications.sms}
                icon={<Smartphone size={20} className="text-neutral-600 dark:text-neutral-400" />}
                colorTheme={colorTheme}
                disabled={saving}
                onChange={(checked) => {
                  setNotifications((prev) => ({ ...prev, sms: checked }));
                  void saveSettings({ notify_sms: checked }, "Preferensi SMS disimpan");
                }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}
              >
                <Shield size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Privacy</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
                <label className="block mb-2 font-medium text-neutral-900 dark:text-neutral-100">Profile Visibility</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => {
                    const next = e.target.value as PrivacyState["profileVisibility"];
                    setPrivacy((prev) => ({ ...prev, profileVisibility: next }));
                    void saveSettings({ profile_visibility: next }, "Privasi profile disimpan");
                  }}
                  disabled={saving}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 disabled:opacity-50",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400"
                  )}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <ToggleCard
                title="Data Sharing"
                subtitle="Allow data sharing for analytics"
                checked={privacy.dataSharing}
                icon={null}
                colorTheme={colorTheme}
                disabled={saving}
                onChange={(checked) => {
                  setPrivacy((prev) => ({ ...prev, dataSharing: checked }));
                  void saveSettings({ data_sharing: checked }, "Data sharing disimpan");
                }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}
              >
                <Database size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Data Management</h2>
            </div>

            <div className="space-y-4">
              <button
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors",
                  colorTheme === "pink" && "hover:bg-pink-50 dark:hover:bg-pink-900/10",
                  colorTheme === "sky" && "hover:bg-sky-50 dark:hover:bg-sky-900/10",
                  colorTheme === "indigo" && "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
                  colorTheme === "green" && "hover:bg-green-50 dark:hover:bg-green-900/10"
                )}
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-100">Export Data</span>
                <Globe size={16} className="text-neutral-600 dark:text-neutral-400" />
              </button>

              <button
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                )}
              >
                <span className="font-medium">Delete Account</span>
                <span className="text-sm">Permanent</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ToggleCard({
  title,
  subtitle,
  checked,
  icon,
  colorTheme,
  disabled,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  icon: ReactNode;
  colorTheme: "pink" | "sky" | "indigo" | "green";
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-100">{title}</p>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={cn(
            "w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-disabled:opacity-50",
            colorTheme === "pink" && "peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 peer-checked:bg-pink-500",
            colorTheme === "sky" && "peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 peer-checked:bg-sky-500",
            colorTheme === "indigo" && "peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:bg-indigo-500",
            colorTheme === "green" && "peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:bg-green-500"
          )}
        ></div>
      </label>
    </div>
  );
}
