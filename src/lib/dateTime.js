import { parseISO } from "date-fns";

const DISPLAY_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};
// AIS feeds can contain seconds or milliseconds; retain their compact display.
export const AIS_TIMESTAMP_FORMAT = {
  unit: "auto",
  options: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
};
const NUMERIC_TIMESTAMP = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

/**
 * Convert Unix seconds, a Date, or an ISO date string to a new Date.
 * Numeric strings use the same unit as numbers. Empty/invalid values return
 * undefined; zero is a valid Unix timestamp. ISO date-only strings are local
 * calendar dates, while explicit ISO offsets preserve the represented instant.
 * Use unit: "milliseconds" for JS timestamps. "auto" is reserved for legacy
 * feeds: absolute values >= 1e12 are treated as milliseconds.
 */
export function timestampToDate(value, { unit = "seconds" } = {}) {
  if (!["seconds", "milliseconds", "auto"].includes(unit)) {
    throw new RangeError(`Unsupported timestamp unit: ${unit}`);
  }

  let date;
  if (value instanceof Date) {
    date = new Date(value.getTime());
  } else if (typeof value === "number" || typeof value === "string") {
    const input = typeof value === "string" ? value.trim() : value;
    if (input === "") return undefined;

    if (typeof input === "number" || NUMERIC_TIMESTAMP.test(input)) {
      const timestamp = Number(input);
      if (!Number.isFinite(timestamp)) return undefined;
      const milliseconds = unit === "milliseconds" ||
        (unit === "auto" && Math.abs(timestamp) >= 1e12)
        ? timestamp
        : timestamp * 1000;
      date = new Date(milliseconds);
    } else {
      // Reject browser-dependent date formats such as 10/11/2026.
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(input)) return undefined;
      date = parseISO(input);
    }
  } else {
    return undefined;
  }

  return Number.isFinite(date.getTime()) ? date : undefined;
}

/** Convert a picker Date, ISO string, or Unix seconds to integer Unix seconds. */
export function toUnixSeconds(value, options) {
  const date = timestampToDate(value, options);
  return date ? Math.floor(date.getTime() / 1000) : undefined;
}

/** Convert a timestamp to JS milliseconds for elapsed-time calculations. */
export function toUnixMilliseconds(value, options) {
  return timestampToDate(value, options)?.getTime();
}

/**
 * Format a server timestamp for display without modifying the API value.
 * The browser locale/time zone are used unless explicitly provided. `options`
 * accepts Intl.DateTimeFormat options, e.g. dateStyle/timeStyle or hour/minute.
 */
export function formatTimestamp(value, {
  locale,
  timeZone,
  unit = "seconds",
  fallback = "—",
  options = DISPLAY_OPTIONS,
} = {}) {
  const date = timestampToDate(value, { unit });
  if (!date) return fallback;

  return new Intl.DateTimeFormat(locale, {
    ...options,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}


export function formatVesselTimestamp(timestampSeconds, timezoneOffsetHours = 0) {
  if (timestampSeconds == null) return "";

  const date = new Date(
    (Number(timestampSeconds) + Number(timezoneOffsetHours) * 3600) * 1000,
  );

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}


const RELATIVE_TIME_UNITS = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

/**
 * Display a timestamp relative to now, e.g. "20 minutes ago" or "in 2 hours".
 * Accepts the same inputs/units as timestampToDate; `now` can override the
 * reference instant and uses the same numeric unit as the input. Locale defaults
 * to the app's document language, then the browser locale. `options` accepts
 * Intl.RelativeTimeFormat options (numeric: "auto" by default).
 * Months and years use elapsed durations of 30 and 365 days respectively.
 */
export function formatRelativeTime(value, {
  locale,
  unit = "seconds",
  now = new Date(),
  fallback = "—",
  options = {},
} = {}) {
  const date = timestampToDate(value, { unit });
  const reference = timestampToDate(now, { unit });
  if (!date || !reference) return fallback;

  const seconds = (date.getTime() - reference.getTime()) / 1000;
  const [relativeUnit, duration] = RELATIVE_TIME_UNITS.find(
    ([name, size]) => name === "second" || Math.abs(seconds) >= size,
  );
  const amount = Math.trunc(seconds / duration);
  const displayLocale = locale ?? (
    typeof document !== "undefined" ? document.documentElement.lang || undefined : undefined
  );

  return new Intl.RelativeTimeFormat(displayLocale, { numeric: "auto", ...options }).format(amount, relativeUnit);
}
