export function timestampToDate(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || !timestamp) return undefined;

  const date = new Date(timestamp * 1000);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function savedDateRange(filters, prefix) {
  const from = timestampToDate(filters?.[`${prefix}_time_from`]);
  const to = timestampToDate(filters?.[`${prefix}_time_to`]);

  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
}

export function toUnixSeconds(date) {
  return date instanceof Date && !Number.isNaN(date.getTime())
    ? Math.floor(date.getTime() / 1000)
    : undefined;
}

export function formatTimestamp(value, formatNumber) {
  if (value == null) return null;

  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime())
    ? formatNumber(value)
    : date.toLocaleString();
}

export function toOptionalNumber(value) {
  if (value === "" || value == null) return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
