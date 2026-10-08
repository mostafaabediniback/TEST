export default function ShipRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="max-w-[150px] truncate text-right text-xs font-semibold text-slate-800">
        {value || "Unknown"}
      </span>
    </div>
  );
}
