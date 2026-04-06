"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { MarkdownContent } from "@/components/MarkdownContent";
import {
  getAssistantUnavailableMessage,
  isAssistantAvailable,
  sendAssistantMessages,
} from "@/lib/assistant-client";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "sinity-assistant-pos";

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { colorTheme } = useTheme();
  const assistantAvailable = isAssistantAvailable();

  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Instant layout effect to load position and prevent flicker as much as possible
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { x, y } = JSON.parse(saved);
        controls.set({ x, y });
      } catch (e) {}
    }
  }, [controls]);

  const handleDragEnd = useCallback(
    async (_event: any, info: any) => {
      setIsDragging(false);
      const screenWidth = window.innerWidth;
      const x = info.point.x;
      const buttonWidth = 56;
      
      // Determine nearest edge (left or right)
      const isLeft = x < screenWidth / 2;
      
      // Calculate snap position relative to initial right-4 (16px) or sm:right-6 (24px)
      const horizontalPadding = window.innerWidth >= 640 ? 24 : 16;
      const targetX = isLeft 
        ? -(screenWidth - buttonWidth - (horizontalPadding * 2)) 
        : 0;

      // Vertical constraints check (prevent top overflow)
      const screenHeight = window.innerHeight;
      const y = info.point.y;
      const buttonHeight = 56;
      const verticalPadding = 24;
      
      let targetY = info.offset.y;
      if (y < verticalPadding) {
        targetY = info.offset.y + (verticalPadding - y);
      } else if (y > screenHeight - buttonHeight - verticalPadding) {
        targetY = info.offset.y - (y - (screenHeight - buttonHeight - verticalPadding));
      }

      await controls.start({
        x: targetX,
        y: targetY,
        transition: { type: "spring", stiffness: 500, damping: 35 }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: targetX, y: targetY }));
    },
    [controls]
  );

  // Re-calculate on resize to keep button in screen
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const buttonWidth = 56;
      const horizontalPadding = window.innerWidth >= 640 ? 24 : 16;
      
      // If currently snapped to left, update the X to the new left edge
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { x } = JSON.parse(saved);
          if (x < -100) { // If it was snapped to left
            const targetX = -(screenWidth - buttonWidth - (horizontalPadding * 2));
            controls.set({ x: targetX });
          }
        } catch (e) {}
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [controls]);

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
      const content = await sendAssistantMessages(
        [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : getAssistantUnavailableMessage(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px]",
              "rounded-3xl shadow-2xl border overflow-hidden",
              "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl",
              "border-white/50 dark:border-slate-700/50",
              colorTheme === "pink" && "sm:border-pink-200/50 dark:sm:border-pink-900/30",
              colorTheme === "sky" && "sm:border-sky-200/50 dark:sm:border-sky-900/30",
              colorTheme === "indigo" && "sm:border-indigo-200/50 dark:sm:border-indigo-900/30",
              colorTheme === "green" && "sm:border-green-200/50 dark:sm:border-green-900/30",
            )}
            style={{ maxHeight: "min(70vh, 520px)" }}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b",
                "dark:border-slate-700/50",
                colorTheme === "pink" && "border-pink-100 dark:border-pink-900/30 bg-pink-50/30 dark:bg-pink-950/20",
                colorTheme === "sky" && "border-sky-100 dark:border-sky-900/30 bg-sky-50/30 dark:bg-sky-950/20",
                colorTheme === "indigo" && "border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/20",
                colorTheme === "green" && "border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/20",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center",
                    colorTheme === "pink" && "bg-pink-500/20 text-pink-600 dark:text-pink-400",
                    colorTheme === "sky" && "bg-sky-500/20 text-sky-600 dark:text-sky-400",
                    colorTheme === "indigo" && "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                    colorTheme === "green" && "bg-green-500/20 text-green-600 dark:text-green-400",
                  )}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
                    AI Assistant
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Tanya keuangan kapan saja 💬
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl h-9 w-9 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex flex-col overflow-hidden" style={{ height: "320px" }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div
                    className={cn(
                      "text-center py-6 px-3 rounded-2xl text-sm",
                      "bg-neutral-50 dark:bg-slate-800/50 text-neutral-600 dark:text-neutral-400",
                    )}
                  >
                    <p className="font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                      Hi, ada yang bisa dibantu? ✨
                    </p>
                    <p className="text-xs">
                      Tanya anggaran, menabung, atau cara catat keuangan.
                    </p>
                  </div>
                )}
                {!assistantAvailable && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    {getAssistantUnavailableMessage()}
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {m.role === "assistant" && (
                      <div
                        className={cn(
                          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
                          colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
                          colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
                          colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
                          colorTheme === "green" && "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
                        )}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        m.role === "user"
                          ? cn(
                              "text-white",
                              colorTheme === "pink" && "bg-pink-500 dark:bg-pink-600",
                              colorTheme === "sky" && "bg-sky-500 dark:bg-sky-600",
                              colorTheme === "indigo" && "bg-indigo-500 dark:bg-indigo-600",
                              colorTheme === "green" && "bg-green-500 dark:bg-green-600",
                            )
                          : cn(
                              "bg-neutral-100 dark:bg-slate-800/80 text-neutral-800 dark:text-slate-200",
                            ),
                      )}
                    >
                      {m.role === "user" ? (
                        <span className="whitespace-pre-wrap break-words">{m.content}</span>
                      ) : (
                        <MarkdownContent content={m.content} className="prose-p:my-1 prose-li:my-0.5 text-inherit [&_ul]:my-2 [&_ol]:my-2" />
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-neutral-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-neutral-600 dark:text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
                        colorTheme === "pink" && "bg-pink-100 dark:bg-pink-900/40 text-pink-600",
                        colorTheme === "sky" && "bg-sky-100 dark:bg-sky-900/40 text-sky-600",
                        colorTheme === "indigo" && "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600",
                        colorTheme === "green" && "bg-green-100 dark:bg-green-900/40 text-green-600",
                      )}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-2xl px-3 py-2 flex items-center gap-2 text-sm bg-neutral-100 dark:bg-slate-800/80 text-neutral-600 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengetik...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="p-3 border-t dark:border-slate-700/50 bg-white dark:bg-slate-800/30"
              >
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pertanyaan..."
                    className="min-h-0 resize-none py-2.5 px-3 text-sm rounded-xl max-h-24 border-neutral-200 dark:border-slate-600"
                    rows={1}
                    disabled={loading || !assistantAvailable}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as unknown as React.FormEvent);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={loading || !input.trim() || !assistantAvailable}
                    size="icon"
                    className={cn(
                      "shrink-0 h-10 w-10 rounded-xl",
                      colorTheme === "pink" && "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500",
                      colorTheme === "sky" && "bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500",
                      colorTheme === "indigo" && "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500",
                      colorTheme === "green" && "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500",
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        ref={btnRef}
        type="button"
        drag
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => {
          if (!isDragging) setOpen((o) => !o);
        }}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-40",
          "flex items-center justify-center",
          "w-14 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-shadow",
          "active:scale-95 touch-none",
          "border border-white/20 dark:border-slate-700/50",
          colorTheme === "pink" && "bg-gradient-to-br from-pink-500 to-pink-600 text-white",
          colorTheme === "sky" && "bg-gradient-to-br from-sky-500 to-sky-600 text-white",
          colorTheme === "indigo" && "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
          colorTheme === "green" && "bg-gradient-to-br from-green-500 to-green-600 text-white",
        )}
        style={{ x: 0, y: 0 }}
        aria-label={open ? "Tutup asisten" : "Buka AI Assistant"}
      >
        {open ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </>
  );
}
