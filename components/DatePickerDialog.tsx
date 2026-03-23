"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getJakartaToday } from "@/lib/date-time";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

type DatePickerDialogProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatYearLabel(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatValueLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${dateKey}T00:00:00+07:00`));
}

function buildCalendarDays(cursor: Date) {
  const firstDay = startOfMonth(cursor);
  const firstWeekday = firstDay.getUTCDay();
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const gridStart = addDays(firstDay, -offset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      key: formatDateKey(date),
      day: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === cursor.getUTCMonth(),
    };
  });
}

function buildYearRange(cursor: Date) {
  const currentYear = cursor.getUTCFullYear();
  const startYear = currentYear - 5;
  return Array.from({ length: 12 }, (_, index) => startYear + index);
}

function setCursorMonth(cursor: Date, month: number): Date {
  return new Date(Date.UTC(cursor.getUTCFullYear(), month, 1));
}

function setCursorYear(cursor: Date, year: number): Date {
  return new Date(Date.UTC(year, cursor.getUTCMonth(), 1));
}

function buildThemeClasses(colorTheme: "pink" | "sky" | "indigo" | "green") {
  if (colorTheme === "sky") {
    return {
      border: "border-sky-200/80 dark:border-sky-900/60",
      chip: "bg-sky-500 text-white",
      soft: "bg-sky-50/85 dark:bg-sky-950/30",
      text: "text-sky-700 dark:text-sky-200",
      ring: "ring-sky-400/50",
    };
  }
  if (colorTheme === "indigo") {
    return {
      border: "border-indigo-200/80 dark:border-indigo-900/60",
      chip: "bg-indigo-500 text-white",
      soft: "bg-indigo-50/85 dark:bg-indigo-950/30",
      text: "text-indigo-700 dark:text-indigo-200",
      ring: "ring-indigo-400/50",
    };
  }
  if (colorTheme === "green") {
    return {
      border: "border-green-200/80 dark:border-green-900/60",
      chip: "bg-green-500 text-white",
      soft: "bg-green-50/85 dark:bg-green-950/30",
      text: "text-green-700 dark:text-green-200",
      ring: "ring-green-400/50",
    };
  }
  return {
    border: "border-pink-200/80 dark:border-pink-900/60",
    chip: "bg-pink-500 text-white",
    soft: "bg-pink-50/85 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-200",
    ring: "ring-pink-400/50",
  };
}

export function DatePickerDialog({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled,
  onClick,
}: DatePickerDialogProps) {
  const { colorTheme } = useTheme();
  const theme = buildThemeClasses(colorTheme);
  const todayKey = getJakartaToday();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(startOfMonth(parseDateKey(value || todayKey)));
  const [view, setView] = useState<"days" | "months" | "years">("days");

  useEffect(() => {
    if (open) {
      setCursor(startOfMonth(parseDateKey(value || todayKey)));
      setView("days");
    }
  }, [open, todayKey, value]);

  const days = useMemo(() => buildCalendarDays(cursor), [cursor]);
  const years = useMemo(() => buildYearRange(cursor), [cursor]);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" }).format(new Date(Date.UTC(2026, index, 1))),
      })),
    []
  );

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.(event);
          setOpen(true);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-md border bg-white px-3 text-left text-sm shadow-xs transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-60 dark:bg-slate-950 dark:hover:bg-slate-900",
          theme.border,
          className
        )}
      >
        <span className={cn("truncate", value ? "text-neutral-950 dark:text-white" : "text-neutral-400 dark:text-slate-500")}>
          {value ? formatValueLabel(value) : placeholder}
        </span>
        <CalendarDays className={cn("h-4 w-4 shrink-0", theme.text)} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn("w-[92vw] max-w-[360px] gap-0 rounded-[24px] border bg-white/96 p-0 shadow-[0_28px_90px_-32px_rgba(15,23,42,0.42)] dark:bg-slate-950/96", theme.border)}>
          <div className="border-b border-neutral-200/80 px-4 py-4 dark:border-slate-800">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-base font-semibold text-neutral-950 dark:text-white">Pilih tanggal</DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (view === "days") setCursor((prev) => addMonths(prev, -1));
                  if (view === "months") setCursor((prev) => addMonths(prev, -12));
                  if (view === "years") setCursor((prev) => setCursorYear(prev, prev.getUTCFullYear() - 12));
                }}
                className={cn("rounded-full border p-2 transition hover:bg-neutral-50 dark:hover:bg-slate-900", theme.border)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView((current) => (current === "months" ? "days" : "months"))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-semibold capitalize transition hover:bg-neutral-50 dark:hover:bg-slate-900",
                    theme.border,
                    view === "months" && theme.soft,
                    view === "months" && theme.text
                  )}
                >
                  {formatMonthLabel(cursor)}
                </button>
                <button
                  type="button"
                  onClick={() => setView((current) => (current === "years" ? "days" : "years"))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition hover:bg-neutral-50 dark:hover:bg-slate-900",
                    theme.border,
                    view === "years" && theme.soft,
                    view === "years" && theme.text
                  )}
                >
                  {formatYearLabel(cursor)}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (view === "days") setCursor((prev) => addMonths(prev, 1));
                  if (view === "months") setCursor((prev) => addMonths(prev, 12));
                  if (view === "years") setCursor((prev) => setCursorYear(prev, prev.getUTCFullYear() + 12));
                }}
                className={cn("rounded-full border p-2 transition hover:bg-neutral-50 dark:hover:bg-slate-900", theme.border)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-4 pt-3">
            {view === "days" ? (
              <>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((item) => {
                    const isSelected = item.key === value;
                    const isToday = item.key === todayKey;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onChange(item.key);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-2xl text-sm font-medium transition",
                          item.isCurrentMonth ? "text-neutral-900 dark:text-white" : "text-neutral-300 dark:text-slate-600",
                          isSelected && cn(theme.chip, "shadow-sm"),
                          !isSelected && "hover:bg-neutral-100 dark:hover:bg-slate-900",
                          isToday && !isSelected && cn("ring-1", theme.ring)
                        )}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {view === "months" ? (
              <div className="grid grid-cols-3 gap-2">
                {months.map((month) => {
                  const isActive = cursor.getUTCMonth() === month.value;
                  return (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => {
                        setCursor((prev) => setCursorMonth(prev, month.value));
                        setView("days");
                      }}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition",
                        theme.border,
                        isActive ? cn(theme.chip, "border-transparent") : "hover:bg-neutral-50 dark:hover:bg-slate-900"
                      )}
                    >
                      {month.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {view === "years" ? (
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => {
                  const isActive = cursor.getUTCFullYear() === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setCursor((prev) => setCursorYear(prev, year));
                        setView("days");
                      }}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                        theme.border,
                        isActive ? cn(theme.chip, "border-transparent") : "hover:bg-neutral-50 dark:hover:bg-slate-900"
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange(todayKey);
                  setCursor(startOfMonth(parseDateKey(todayKey)));
                  setView("days");
                  setOpen(false);
                }}
                className={cn("rounded-full border px-3 py-2 text-xs font-medium transition", theme.border, theme.text, theme.soft)}
              >
                Hari ini
              </button>

              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="rounded-full px-3 py-2 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  Hapus
                </button>
              ) : (
                <span className="px-3 py-2 text-xs text-neutral-400 dark:text-slate-500">Tap tanggal untuk pilih</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
