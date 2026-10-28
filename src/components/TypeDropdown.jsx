import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import DropdownDoneButton from "@/components/DropdownDoneButton";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useNavigationalStatuses } from "@/hooks/useNavigationalStatuses";

export default function TypeDropdown({
  selectedValue = "",
  onChange,
  placeholder = "Select a status",
  multiple = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const { data, isPending, isError, error } = useNavigationalStatuses();

  const statuses = Array.isArray(data) ? data : [];
  const selectedStatuses = Array.isArray(selectedValue)
    ? selectedValue
    : selectedValue
      ? [selectedValue]
      : [];

  const filteredStatuses = statuses.filter((status) =>
    status.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const menuStyle = useDropdownPosition({
    open,
    setOpen,
    anchorRef: buttonRef,
    menuRef,
    searchRef,
  });

  function selectStatus(status) {
    if (multiple) {
      const next = selectedStatuses.includes(status)
        ? selectedStatuses.filter((item) => item !== status)
        : [...selectedStatuses, status];

      onChange?.(next);
      return;
    }

    onChange?.(status);
    setSearch("");
    setOpen(false);
  }

  function clearSelection() {
    onChange?.(multiple ? [] : "");
    setSearch("");
    if (!multiple) setOpen(false);
  }

  function clearFromIcon() {
    onChange?.(multiple ? [] : "");
  }

  const buttonLabel = multiple
    ? selectedStatuses.length
      ? `${selectedStatuses.length} selected`
      : placeholder
    : selectedStatuses[0] || placeholder;

  return (
    <>
      <div
        ref={buttonRef}
        className="flex h-8 w-full min-w-0 items-center rounded-lg border bg-background px-2.5 text-sm hover:bg-accent"
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-full min-w-0 flex-1 items-center justify-between text-start focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            className={`truncate ${
              selectedStatuses.length ? "" : "text-muted-foreground"
            }`}
          >
            {buttonLabel}
          </span>
          <span aria-hidden="true" className="ms-2">
            ▾
          </span>
        </button>

        {selectedStatuses.length > 0 && (
          <button
            type="button"
            aria-label="Clear selected status"
            onClick={clearFromIcon}
            className="ms-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="flex flex-col overflow-hidden rounded-md border bg-background shadow-xl"
          >
            <div className="shrink-0 border-b p-2">
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search statuses…"
                aria-label="Search navigational statuses"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="min-h-0 max-h-64 overflow-y-auto overscroll-contain p-1">
              <button
                type="button"
                onClick={clearSelection}
                className="w-full rounded px-3 py-2 text-start text-sm hover:bg-accent"
              >
                Clear selection
              </button>

              {isPending && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Loading statuses…
                </p>
              )}

              {isError && (
                <p role="alert" className="px-3 py-2 text-sm text-destructive">
                  {error?.message ?? "Could not load statuses."}
                </p>
              )}

              {!isPending &&
                !isError &&
                filteredStatuses.map((status) => {
                  const isSelected = selectedStatuses.includes(status);

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => selectStatus(status)}
                      aria-selected={isSelected}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-start text-sm hover:bg-accent aria-selected:bg-accent"
                    >
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          tabIndex={-1}
                        />
                      )}
                      {status}
                    </button>
                  );
                })}

              {!isPending && !isError && filteredStatuses.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No statuses found.
                </p>
              )}
            </div>

            {multiple && (
              <DropdownDoneButton onClick={() => {
                setOpen(false);
                buttonRef.current?.querySelector("button")?.focus({ preventScroll: true });
              }} />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
