export default function DetailCard({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}