import { apiConfig } from "@/lib/api";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_UNAVAILABLE_MESSAGE =
  "AI Assistant belum diaktifkan di build ini. Tambahkan NEXT_PUBLIC_CHAT_API_URL ke endpoint backend publik.";

export function isAssistantAvailable(): boolean {
  return Boolean(apiConfig.chatUrl);
}

export function getAssistantUnavailableMessage(): string {
  return DEFAULT_UNAVAILABLE_MESSAGE;
}

export async function sendAssistantMessages(messages: AssistantMessage[]): Promise<string> {
  if (!apiConfig.chatUrl) {
    throw new Error(DEFAULT_UNAVAILABLE_MESSAGE);
  }

  const res = await fetch(apiConfig.chatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : "Gagal mendapat respons dari AI."
    );
  }

  if (typeof data?.message !== "string" || !data.message.trim()) {
    throw new Error("Respons AI kosong.");
  }

  return data.message;
}
