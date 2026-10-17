import { Input } from "@/components/ui/input";

export default function FilterInput({ label, value, onChange }) {
  return (
    <Input
      type="number"
      min="0"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={label}
      aria-label={label}
    />
  );
}
