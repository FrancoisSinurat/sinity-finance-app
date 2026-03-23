"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DatePickerDialog } from "@/components/DatePickerDialog";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { profileService, ApiError } from "@/lib/api";
import { getTokenPayload } from "@/lib/auth";
import { formatJakartaDate } from "@/lib/date-time";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  bio: string;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
  bio: "",
};

function parseError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function profileFromToken(): ProfileForm | null {
  const payload = getTokenPayload();
  if (!payload) return null;
  const name = typeof payload.name === "string" ? payload.name : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!name && !email) return null;
  return {
    name,
    email,
    phone: "",
    address: "",
    birthDate: "",
    bio: "",
  };
}

export default function ProfilePage() {
  const { colorTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<ProfileForm>(EMPTY_FORM);
  const [originalData, setOriginalData] = useState<ProfileForm>(EMPTY_FORM);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setMessage("");
      try {
        const profile = await profileService.getMe();
        if (!mounted) return;
        const mapped: ProfileForm = {
          name: profile.name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
          birthDate: profile.birth_date ?? "",
          bio: profile.bio ?? "",
        };
        setFormData(mapped);
        setOriginalData(mapped);
      } catch (err) {
        if (!mounted) return;
        const fallback = profileFromToken();
        if (fallback) {
          setFormData(fallback);
          setOriginalData(fallback);
          if (err instanceof ApiError && err.status === 404) {
            setMessage("Endpoint profile backend belum aktif. Menampilkan data dari token sementara.");
          } else {
            setMessage(parseError(err, "Gagal memuat profil dari backend. Menampilkan data token."));
          }
        } else {
          setMessage(parseError(err, "Gagal memuat profil"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const canSave = useMemo(() => formData.name.trim().length > 0, [formData.name]);

  const handleSave = async () => {
    if (!canSave) {
      setMessage("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const updated = await profileService.updateMe({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        birth_date: formData.birthDate.trim(),
        bio: formData.bio.trim(),
      });
      const mapped: ProfileForm = {
        name: updated.name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        address: updated.address ?? "",
        birthDate: updated.birth_date ?? "",
        bio: updated.bio ?? "",
      };
      setFormData(mapped);
      setOriginalData(mapped);
      setIsEditing(false);
      setMessage("Profil berhasil disimpan");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMessage("Belum bisa simpan: endpoint profile backend belum aktif.");
      } else {
        setMessage(parseError(err, "Gagal menyimpan profil"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setMessage("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-600 dark:text-neutral-400">Memuat profil...</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-slate-800">
              <div
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0",
                  colorTheme === "pink" && "bg-gradient-to-br from-pink-400 to-pink-600",
                  colorTheme === "sky" && "bg-gradient-to-br from-sky-400 to-sky-600",
                  colorTheme === "indigo" && "bg-gradient-to-br from-indigo-400 to-indigo-600",
                  colorTheme === "green" && "bg-gradient-to-br from-green-400 to-green-600"
                )}
              >
                {(formData.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{formData.name || "Unnamed User"}</h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4">{formData.bio || "-"}</p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto",
                      colorTheme === "pink" &&
                        "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30",
                      colorTheme === "sky" &&
                        "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/30",
                      colorTheme === "indigo" &&
                        "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30",
                      colorTheme === "green" &&
                        "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                    )}
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem
                  icon={<User size={16} />}
                  label="Full Name"
                  editing={isEditing}
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  type="text"
                  colorTheme={colorTheme}
                />

                <FormItem
                  icon={<Mail size={16} />}
                  label="Email"
                  editing={false}
                  value={formData.email}
                  onChange={() => {}}
                  type="email"
                  colorTheme={colorTheme}
                />

                <FormItem
                  icon={<Phone size={16} />}
                  label="Phone Number"
                  editing={isEditing}
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  type="tel"
                  colorTheme={colorTheme}
                />

                <FormItem
                  icon={<Calendar size={16} />}
                  label="Birth Date"
                  editing={isEditing}
                  value={formData.birthDate}
                  onChange={(v) => setFormData({ ...formData, birthDate: v })}
                  type="date"
                  colorTheme={colorTheme}
                  formatter={(v) =>
                    v ? formatJakartaDate(v) : "-"
                  }
                />

                <FormItem
                  icon={<MapPin size={16} />}
                  label="Address"
                  editing={isEditing}
                  value={formData.address}
                  onChange={(v) => setFormData({ ...formData, address: v })}
                  type="text"
                  colorTheme={colorTheme}
                  fullWidth
                />

                <TextAreaItem
                  label="Bio"
                  editing={isEditing}
                  value={formData.bio}
                  onChange={(v) => setFormData({ ...formData, bio: v })}
                  colorTheme={colorTheme}
                />
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

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-slate-800">
                  <button
                    onClick={handleSave}
                    disabled={saving || !canSave}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto disabled:opacity-50",
                      colorTheme === "pink" && "bg-pink-500 hover:bg-pink-600 text-white",
                      colorTheme === "sky" && "bg-sky-500 hover:bg-sky-600 text-white",
                      colorTheme === "indigo" && "bg-indigo-500 hover:bg-indigo-600 text-white",
                      colorTheme === "green" && "bg-green-500 hover:bg-green-600 text-white"
                    )}
                  >
                    <Save size={16} />
                    {saving ? "Menyimpan..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base w-full sm:w-auto disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FormItem({
  icon,
  label,
  editing,
  value,
  onChange,
  type,
  colorTheme,
  fullWidth,
  formatter,
}: {
  icon: ReactNode;
  label: string;
  editing: boolean;
  value: string;
  onChange: (value: string) => void;
  type: string;
  colorTheme: "pink" | "sky" | "indigo" | "green";
  fullWidth?: boolean;
  formatter?: (value: string) => string;
}) {
  return (
    <div className={cn(fullWidth && "md:col-span-2")}>
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {icon}
        {label}
      </label>
      {editing ? (
        type === "date" ? (
          <DatePickerDialog
            value={value}
            onChange={onChange}
            className={cn(
              "w-full rounded-lg border border-neutral-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-800",
              colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
              colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
              colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
              colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400"
            )}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
              colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
              colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
              colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
              colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400"
            )}
          />
        )
      ) : (
        <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formatter ? formatter(value) : value || "-"}</p>
      )}
    </div>
  );
}

function TextAreaItem({
  label,
  editing,
  value,
  onChange,
  colorTheme,
}: {
  label: string;
  editing: boolean;
  value: string;
  onChange: (value: string) => void;
  colorTheme: "pink" | "sky" | "indigo" | "green";
}) {
  return (
    <div className="md:col-span-2">
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{label}</label>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(
            "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 resize-none",
            colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
            colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
            colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
            colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400"
          )}
        />
      ) : (
        <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{value || "-"}</p>
      )}
    </div>
  );
}
