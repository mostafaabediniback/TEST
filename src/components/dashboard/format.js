export function cellValue(row, key, { t, formatNumber, locale }) {
  const value = row[key];
  if (value == null || value === "") return "—";
  if (key.endsWith("At"))
    return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale, {
      timeZone: row.timeZone ?? "Asia/Tehran",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  if (key === "status" || key === "type") return t("dashboard." + value);
  if (typeof value === "number")
    return (
      formatNumber(value, { maximumFractionDigits: 1 }) +
      (key.endsWith("Minutes") ? " " + t("dashboard.minute") : "")
    );
  return String(value);
}
