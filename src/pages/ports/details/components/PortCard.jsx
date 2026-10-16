export default function PortCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border bg-white p-4 ${className}`}>
      <h2 className="mb-3 border-b pb-2 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
