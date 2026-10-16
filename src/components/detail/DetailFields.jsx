export default function DetailFields({ rows }) {
  return (
    <dl className="divide-y divide-slate-100">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[minmax(120px,0.8fr)_minmax(0,1.2fr)] gap-3 py-2.5 text-sm"
        >
          <dt className="text-slate-500">{label}</dt>
          <dd className="break-words font-medium text-slate-800">
            {value == null || value === "" ? "—" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}