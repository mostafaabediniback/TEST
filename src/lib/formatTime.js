export default function formatTime(value) {
  if (value == null || value === "") return "—";

  const numeric = Number(value);
  const milliseconds = Number.isFinite(numeric)
    ? numeric < 1e12
      ? numeric * 1000 // Unix seconds
      : numeric // milliseconds
    : Date.parse(value);

  if (!Number.isFinite(milliseconds)) return "—";

  return new Date(milliseconds).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}