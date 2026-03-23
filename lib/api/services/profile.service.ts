import { api } from "../client";
import type { Profile, ProfileUpdatePayload } from "../types";

const PATH = "/api/v1/profile";

function normalizeString(value: string | null | undefined): string {
  return value ?? "";
}

function mapProfile(raw: unknown): Profile {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: Number(o.id) || 0,
    name: String(o.name ?? ""),
    email: String(o.email ?? ""),
    phone: normalizeString(o.phone as string | null | undefined),
    address: normalizeString(o.address as string | null | undefined),
    birth_date: normalizeString(o.birth_date as string | null | undefined),
    bio: normalizeString(o.bio as string | null | undefined),
  };
}

export const profileService = {
  async getMe(): Promise<Profile> {
    const res = await api.get<unknown>(PATH);
    return mapProfile(res);
  },

  async updateMe(payload: ProfileUpdatePayload): Promise<Profile> {
    const res = await api.put<unknown>(PATH, payload);
    return mapProfile(res);
  },
};
