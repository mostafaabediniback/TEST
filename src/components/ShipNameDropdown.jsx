import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useShipsByName } from "@/hooks/useShipsByName";

function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

export default function ShipNameDropdown({
  selectedId = "",
  onChange,
  placeholder = "Select a Vessels",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isPending, isError, error } = useShipsByName(
    debouncedSearch.trim(),
  );

  // Fetch the selected ship by ID so its name can be shown
  // even when it is not in the current search results.
  const { data: selectedData } = useShipsByName(
    "",
    1,
    1,
    selectedId,
    Boolean(selectedId),
  );

  const ships = Array.isArray(data) ? data : [];

  const selectedShip = Array.isArray(selectedData)
    ? selectedData.find((ship) => String(ship.id) === String(selectedId))
    : selectedData;

  const buttonLabel = selectedShip?.name
    ? selectedShip.name
    : selectedId
      ? `Ship ID: ${selectedId}`
      : placeholder;

  const waitingForDebounce = search.trim() !== debouncedSearch.trim();

  const menuStyle = useDropdownPosition({
    open,
    setOpen,
    anchorRef: buttonRef,
    menuRef,
    searchRef,
  });

  function selectShip(ship) {
    onChange?.(ship?.id ?? "");
    setSearch("");
    setOpen(false);
  }

  return (
    <>
      <div className="flex h-8 w-full min-w-0 items-center rounded-lg border bg-background px-2.5 text-sm hover:bg-accent">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-full min-w-0 flex-1 items-center justify-between text-start focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            className={`truncate ${selectedId ? "" : "text-muted-foreground"}`}
          >
            {buttonLabel}
          </span>
          <span aria-hidden="true" className="ms-2">
            ▾
          </span>
        </button>

        {selectedId && (
          <button
            type="button"
            aria-label="Clear selected ship"
            onClick={() => onChange?.("")}
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
                placeholder="Search ship names…"
                aria-label="Search ship names"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="min-h-0 max-h-64 overflow-y-auto overscroll-contain p-1">
              <button
                type="button"
                onClick={() => selectShip(null)}
                className="w-full rounded px-3 py-2 text-start text-sm hover:bg-accent"
              >
                Clear selection
              </button>

              {(waitingForDebounce || isPending) && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Loading ships…
                </p>
              )}

              {!waitingForDebounce && isError && (
                <p role="alert" className="px-3 py-2 text-sm text-destructive">
                  {error?.message ?? "Could not load ships."}
                </p>
              )}

              {!waitingForDebounce &&
                !isPending &&
                !isError &&
                ships.map((ship) => (
                  <button
                    key={ship.id}
                    type="button"
                    onClick={() => selectShip(ship)}
                    aria-selected={String(selectedId) === String(ship.id)}
                    className="w-full rounded px-3 py-2 text-start text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    {ship.name}
                  </button>
                ))}

              {!waitingForDebounce &&
                !isPending &&
                !isError &&
                ships.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {search.trim() ? "No ships found." : "No ships available."}
                  </p>
                )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
