import { Input } from "@/components/ui/input";

export default function FilterInput({ label, value, onChange }) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="—"
      />
    </label>
  );
}
