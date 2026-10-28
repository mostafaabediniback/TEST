import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const options = [
  { value: "", label: "Any Vessels" },
  { value: "-1", label: "Vessels with an IMO" },
  { value: "0", label: "Vessels without an IMO" },
  { value: "specific", label: "Search by IMO number" },
];

export default function ImoFilter({ value = "", onChange }) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedValue = String(value ?? "");
  const mode =
    normalizedValue === "-1"
      ? "with"
      : normalizedValue === "0"
        ? "without"
        : normalizedValue
          ? "specific"
          : "any";

  const selectedOption =
    mode === "with"
      ? options[1]
      : mode === "without"
        ? options[2]
        : mode === "specific"
          ? options[3]
          : options[0];

  const imoNumber =
    mode === "specific" && normalizedValue !== "specific"
      ? normalizedValue
      : "";

  const menuStyle = useDropdownPosition({
    open,
    setOpen,
    anchorRef: buttonRef,
    menuRef,
  });

  function selectOption(option) {
    onChange?.(option.value);
    setOpen(false);
  }

  return (
    <div className="w-full min-w-0 space-y-2">
      <span className="text-sm font-medium">IMO filter</span>

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-full min-w-0 items-center justify-between rounded-lg border bg-background px-2.5 text-start text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="truncate">{selectedOption.label}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="flex flex-col overflow-hidden rounded-md border bg-background shadow-xl"
          >
            <div role="listbox" aria-label="IMO filter options" className="min-h-0 overflow-y-auto overscroll-contain p-1">
              {options.map((option) => {
                const isSelected =
                  (option.value === "specific" && mode === "specific") ||
                  (option.value === "-1" && mode === "with") ||
                  (option.value === "0" && mode === "without") ||
                  (option.value === "" && mode === "any");

                return (
                  <button
                    key={option.value || "any"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(option)}
                    className="w-full rounded px-3 py-2 text-start text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

      {mode === "specific" && (
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="IMO number"
          placeholder="Enter IMO number"
          value={imoNumber}
          onChange={(event) =>
            onChange?.(event.target.value || "specific")
          }
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
