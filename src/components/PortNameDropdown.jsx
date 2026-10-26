import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { usePortsByName } from "@/hooks/usePortsByName";

function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

export default function PortNameDropdown({
  selectedId = "",
  onChange,
  placeholder = "Select a port",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState({});

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const {
    data: portsData,
    isPending,
    isError,
    error,
  } = usePortsByName(debouncedSearch.trim());

  // Fetch the selected port separately so its name and alt_name
  // remain visible after the search field is cleared.
  const { data: selectedData } = usePortsByName(
    "",
    1,
    1,
    selectedId,
    Boolean(selectedId),
  );

  const ports = Array.isArray(portsData) ? portsData : [];

  const selectedPort = Array.isArray(selectedData)
    ? selectedData.find(
        (port) => String(port.id) === String(selectedId),
      )
    : selectedData;

  const selectedLabel = selectedPort
    ? [
        selectedPort.name,
        ...(Array.isArray(selectedPort.alt_name)
          ? selectedPort.alt_name
          : []),
      ]
        .filter(Boolean)
        .join(" · ")
    : selectedId
      ? `Port ID: ${selectedId}`
      : placeholder;

  const waitingForDebounce =
    search.trim() !== debouncedSearch.trim();

  useEffect(() => {
    if (!open) return;

    function positionMenu() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = Math.min(rect.width, window.innerWidth - 16);
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8,
      );

      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left,
        width,
        zIndex: 9999,
      });
    }

    function closeOnOutsideClick(event) {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    positionMenu();
    searchRef.current?.focus();

    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  function selectPort(port) {
    onChange?.(port?.id ?? "");
    setSearch("");
    setOpen(false);
  }

  return (
    <>
<div className="relative">
  <button
    ref={buttonRef}
    type="button"
    aria-expanded={open}
    onClick={() => setOpen((value) => !value)}
    className="flex h-8 w-full min-w-0 items-center rounded-lg border bg-background px-2.5 pr-16 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
  >
    <span
      className={`truncate ${
        selectedId ? "" : "text-muted-foreground"
      }`}
    >
      {selectedLabel}
    </span>
  </button>

  <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
    <span aria-hidden="true">▾</span>

    {selectedId && (
      <button
        type="button"
        aria-label="Clear selected port"
        title="Clear selection"
        onClick={() => selectPort(null)}
        className="pointer-events-auto rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    )}
  </div>
</div>


      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="overflow-hidden rounded-md border bg-background shadow-xl"
          >
            <div className="border-b p-2">
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search port names…"
                aria-label="Search port names"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              <button
                type="button"
                onClick={() => selectPort(null)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <Trash2 size={16} aria-hidden="true" />
                Clear selection
              </button>

              {(waitingForDebounce || isPending) && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Loading ports…
                </p>
              )}

              {!waitingForDebounce && isError && (
                <p role="alert" className="px-3 py-2 text-sm text-destructive">
                  {error?.message ?? "Could not load ports."}
                </p>
              )}

              {!waitingForDebounce &&
                !isPending &&
                !isError &&
                ports.map((port) => (
                  <button
                    key={port.id}
                    type="button"
                    onClick={() => selectPort(port)}
                    aria-selected={String(selectedId) === String(port.id)}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <span>{port.name}</span>
                    {Array.isArray(port.alt_name) &&
                      port.alt_name.length > 0 && (
                        <span className="ml-2 text-muted-foreground">
                          ({port.alt_name.join(", ")})
                        </span>
                      )}
                  </button>
                ))}

              {!waitingForDebounce &&
                !isPending &&
                !isError &&
                ports.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {search.trim()
                      ? "No ports found."
                      : "No ports available."}
                  </p>
                )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
