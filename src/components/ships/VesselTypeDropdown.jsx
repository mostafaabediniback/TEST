import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import DropdownDoneButton from "@/components/DropdownDoneButton";
import {
  VESSEL_TYPE_GROUPS,
  getVesselTypeGroupState,
  updateVesselTypeSelection,
} from "@/lib/vesselTypes";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

export default function VesselTypeDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return VESSEL_TYPE_GROUPS;

    return VESSEL_TYPE_GROUPS.map((group) => ({
      ...group,
      types: group.label.toLowerCase().includes(query)
        ? group.types
        : group.types.filter((type) => type.toLowerCase().includes(query)),
    })).filter((group) => group.types.length > 0);
  }, [search]);

  const label =
    selected.length === 0
      ? "selected Vessel Type/Subtype"
      : `${selected.length} vessel type${selected.length === 1 ? "" : "s"} selected`;

  const menuStyle = useDropdownPosition({
    open,
    setOpen,
    anchorRef: containerRef,
    menuRef,
    searchRef,
  });

  function toggleType(type, checked) {
    onChange(updateVesselTypeSelection(selected, [type], checked));
  }

  function toggleGroup(group, checked) {
    onChange(updateVesselTypeSelection(selected, group.types, checked));
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border bg-background px-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
          open ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          onClick={() => {
            setSearch("");
            setOpen((value) => !value);
          }}
          className="flex h-full min-w-0 flex-1 items-center justify-between gap-2 text-start focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            className={
              selected.length === 0
                ? "truncate text-muted-foreground"
                : "truncate"
            }
          >
            {label}
          </span>
          <span className="shrink-0" aria-hidden="true">
            ▾
          </span>
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            aria-label="Clear selected vessel types"
            onClick={() => onChange([])}
            className="inline-flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600 focus-visible:outline-2 focus-visible:outline-ring"
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
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search vessel types…"
                aria-label="Search vessel types"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="min-h-0 max-h-64 overflow-y-auto overscroll-contain p-2">
              {filteredGroups.map((group) => {
                const state = getVesselTypeGroupState(selected, group);

                return (
                  <fieldset key={group.id} className="mb-2 last:mb-0">
                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground has-checked:bg-accent/60 has-checked:text-accent-foreground">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={state.checked}
                        ref={(element) => {
                          if (element) {
                            element.indeterminate = state.indeterminate;
                          }
                        }}
                        onChange={(event) =>
                          toggleGroup(group, event.target.checked)
                        }
                      />

                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />

                      {group.label}
                    </label>

                    <div className="ms-6 space-y-1">
                      {group.types.map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground has-checked:bg-accent/60 has-checked:text-accent-foreground"
                        >
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={selected.includes(type)}
                            onChange={(event) =>
                              toggleType(type, event.target.checked)
                            }
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}

              {filteredGroups.length === 0 && (
                <p
                  role="status"
                  className="px-3 py-2 text-sm text-muted-foreground"
                >
                  No vessel types found.
                </p>
              )}
            </div>
            <DropdownDoneButton onClick={() => {
              setOpen(false);
              buttonRef.current?.focus({ preventScroll: true });
            }} />
          </div>,
          document.body,
        )}
    </>
  );
}
