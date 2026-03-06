"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Send, Bot, User, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { colorTheme } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.error || "Gagal mendapat respons. Cek GROQ_API_KEY di .env",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Koneksi gagal. Coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto">
      <div
        className={cn(
          "rounded-2xl border bg-card/50 backdrop-blur-sm flex-1 flex flex-col overflow-hidden shadow-lg",
          "dark:border-slate-800/50 dark:bg-slate-900/30",
          colorTheme === "pink" && "border-pink-200/50",
          colorTheme === "sky" && "border-sky-200/50",
          colorTheme === "indigo" && "border-indigo-200/50",
          colorTheme === "green" && "border-green-200/50"
        )}
      >
        <header
          className={cn(
            "px-4 py-3 border-b font-semibold flex items-center gap-2",
            "dark:border-slate-800/50",
            colorTheme === "pink" && "border-pink-200/50 text-pink-600 dark:text-pink-400",
            colorTheme === "sky" && "border-sky-200/50 text-sky-600 dark:text-sky-400",
            colorTheme === "indigo" && "border-indigo-200/50 text-indigo-600 dark:text-indigo-400",
            colorTheme === "green" && "border-green-200/50 text-green-600 dark:text-green-400"
          )}
        >
          <Bot className="w-5 h-5" />
          AI Assistant Keuangan
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div
              className={cn(
                "text-center py-8 rounded-xl text-sm",
                "dark:text-slate-400",
                colorTheme === "pink" && "bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300",
                colorTheme === "sky" && "bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300",
                colorTheme === "indigo" && "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300",
                colorTheme === "green" && "bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
              )}
            >
              Tanya apa saja tentang keuangan: anggaran, menabung, atau cara mencatat pemasukan & pengeluaran.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" && (
                <div
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
                    colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
                    colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
                    colorTheme === "green" && "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                  )}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? cn(
                        "text-white",
                        colorTheme === "pink" && "bg-pink-500 dark:bg-pink-600",
                        colorTheme === "sky" && "bg-sky-500 dark:bg-sky-600",
                        colorTheme === "indigo" && "bg-indigo-500 dark:bg-indigo-600",
                        colorTheme === "green" && "bg-green-500 dark:bg-green-600"
                      )
                    : cn(
                        "dark:bg-slate-800/60 dark:text-slate-200",
                        colorTheme === "pink" && "bg-pink-50 dark:bg-pink-950/30 text-pink-900 dark:text-pink-100",
                        colorTheme === "sky" && "bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-100",
                        colorTheme === "indigo" && "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100",
                        colorTheme === "green" && "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100"
                      )
                )}
              >
                {m.role === "user" ? (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                ) : (
                  <MarkdownContent content={m.content} className="prose-p:my-1 prose-li:my-0.5 text-inherit [&_ul]:my-2 [&_ol]:my-2" />
                )}
              </div>
              {m.role === "user" && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div
                className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                  colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/40 text-pink-600",
                  colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/40 text-sky-600",
                  colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600",
                  colorTheme === "green" && "bg-green-100 dark:bg-green-900/40 text-green-600"
                )}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 flex items-center gap-2 text-sm",
                  "dark:bg-slate-800/60 dark:text-slate-400",
                  colorTheme === "pink" && "bg-pink-50 dark:bg-pink-950/30",
                  colorTheme === "sky" && "bg-sky-50 dark:bg-sky-950/30",
                  colorTheme === "indigo" && "bg-indigo-50 dark:bg-indigo-950/30",
                  colorTheme === "green" && "bg-green-50 dark:bg-green-950/30"
                )}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengetik...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t dark:border-slate-800/50 flex gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan..."
            className="min-h-0 resize-none py-3 max-h-32"
            rows={1}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "shrink-0 self-end",
              colorTheme === "pink" && "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500",
              colorTheme === "sky" && "bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500",
              colorTheme === "indigo" && "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500",
              colorTheme === "green" && "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
