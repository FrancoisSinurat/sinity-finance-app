"use client";

import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme-provider";
import { getThemeColor } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { colorTheme } = useTheme();
  const themeColors = getThemeColor(colorTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+62 812-3456-7890",
    address: "Jakarta, Indonesia",
    birthDate: "1990-01-15",
    bio: "Finance enthusiast and budget tracker.",
  });

  const handleSave = () => {
    // Here you would save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Profile</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-slate-800 p-4 sm:p-6 md:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-slate-800">
          <div className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0",
            colorTheme === "pink" && "bg-gradient-to-br from-pink-400 to-pink-600",
            colorTheme === "sky" && "bg-gradient-to-br from-sky-400 to-sky-600",
            colorTheme === "indigo" && "bg-gradient-to-br from-indigo-400 to-indigo-600",
            colorTheme === "green" && "bg-gradient-to-br from-green-400 to-green-600",
          )}>
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{formData.name}</h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4">{formData.bio}</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/30",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30",
                )}
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formData.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar size={16} />
                Birth Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">
                  {new Date(formData.birthDate).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <MapPin size={16} />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formData.address}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 resize-none",
                    colorTheme === "pink" && "focus:ring-pink-500 dark:focus:ring-pink-400",
                    colorTheme === "sky" && "focus:ring-sky-500 dark:focus:ring-sky-400",
                    colorTheme === "indigo" && "focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    colorTheme === "green" && "focus:ring-green-500 dark:focus:ring-green-400",
                  )}
                />
              ) : (
                <p className="px-4 py-2 text-neutral-900 dark:text-neutral-100">{formData.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-slate-800">
              <button
                onClick={handleSave}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto",
                  colorTheme === "pink" && "bg-pink-500 hover:bg-pink-600 text-white",
                  colorTheme === "sky" && "bg-sky-500 hover:bg-sky-600 text-white",
                  colorTheme === "indigo" && "bg-indigo-500 hover:bg-indigo-600 text-white",
                  colorTheme === "green" && "bg-green-500 hover:bg-green-600 text-white",
                )}
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

