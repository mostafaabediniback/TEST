import { timestampToDate } from "@/lib/dateTime";

export function savedDateRange(filters, prefix) {
  const from = timestampToDate(filters?.[`${prefix}_time_from`]);
  const to = timestampToDate(filters?.[`${prefix}_time_to`]);

  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
}

export function toOptionalNumber(value) {
  if (value === "" || value == null) return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
