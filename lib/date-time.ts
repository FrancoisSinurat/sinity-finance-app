const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const JAKARTA_OFFSET = "+07:00";

type JakartaParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

function getFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    hour12: false,
    ...options,
  });
}

function getJakartaParts(date: Date): JakartaParts {
  const parts = getFormatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: map.year ?? "1970",
    month: map.month ?? "01",
    day: map.day ?? "01",
    hour: map.hour ?? "00",
    minute: map.minute ?? "00",
    second: map.second ?? "00",
  };
}

export function getJakartaTimeZone(): string {
  return JAKARTA_TIME_ZONE;
}

export function getJakartaToday(date = new Date()): string {
  const parts = getJakartaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getJakartaMonthKey(date = new Date()): string {
  return getJakartaToday(date).slice(0, 7);
}

export function getJakartaMonthDate(date = new Date()): Date {
  const [year, month] = getJakartaMonthKey(date).split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function getJakartaMonthParts(date = new Date()): { year: number; month: number } {
  const [year, month] = getJakartaMonthKey(date).split("-").map(Number);
  return { year, month };
}

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

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getJakartaTimestamp(date = new Date()): string {
  const parts = getJakartaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JAKARTA_OFFSET}`;
}

export function formatJakartaMonthLabel(value: Date | string): string {
  const date = typeof value === "string" ? new Date(`${value}-01T00:00:00${JAKARTA_OFFSET}`) : value;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatJakartaDateLabel(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00${JAKARTA_OFFSET}`));
}

export function formatJakartaDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getJakartaWeekRange(date = new Date()): { start: string; end: string } {
  const today = parseDateKey(getJakartaToday(date));
  const dayOfWeek = today.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = addUtcDays(today, diffToMonday);
  const end = addUtcDays(start, 6);
  return { start: formatDateKey(start), end: formatDateKey(end) };
}

export function formatJakartaWeekLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T00:00:00${JAKARTA_OFFSET}`);
  const endDate = new Date(`${end}T00:00:00${JAKARTA_OFFSET}`);
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("id-ID", {
      timeZone: JAKARTA_TIME_ZONE,
      month: "long",
      year: "numeric",
    }).format(startDate);

    return `${start.slice(8, 10)}-${end.slice(8, 10)} ${monthYear}`;
  }

  const shortFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    day: "2-digit",
    month: "short",
  });

  const endFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${shortFormatter.format(startDate)} - ${endFormatter.format(endDate)}`;
}
