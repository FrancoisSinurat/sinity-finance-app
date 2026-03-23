import { api } from "../client";
import type { Settings, SettingsUpdatePayload } from "../types";

const PATH = "/api/v1/settings";

function mapSettings(raw: unknown): Settings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const theme = o.theme === "dark" ? "dark" : "light";
  const colorTheme = (["pink", "sky", "indigo", "green"].includes(String(o.color_theme)) ? o.color_theme : "pink") as Settings["color_theme"];
  const visibility = (["public", "friends", "private"].includes(String(o.profile_visibility)) ? o.profile_visibility : "public") as Settings["profile_visibility"];

  return {
    theme,
    color_theme: colorTheme,
    notify_email: Boolean(o.notify_email),
    notify_push: Boolean(o.notify_push),
    notify_sms: Boolean(o.notify_sms),
    profile_visibility: visibility,
    data_sharing: Boolean(o.data_sharing),
  };
}

export const settingsService = {
  async get(): Promise<Settings> {
    const res = await api.get<unknown>(PATH);
    return mapSettings(res);
  },

  async update(payload: SettingsUpdatePayload): Promise<Settings> {
    const res = await api.put<unknown>(PATH, payload);
    return mapSettings(res);
  },
};
