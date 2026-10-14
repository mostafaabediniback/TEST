import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  VESSEL_TYPE_GROUPS,
  getVesselTypeGroupState,
  updateVesselTypeSelection,
} from "@/lib/vesselTypes";

export default function VesselTypeDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const label =
    selected.length === 0
      ? "Any vessel type"
      : `${selected.length} vessel type${selected.length === 1 ? "" : "s"} selected`;

  useEffect(() => {
    if (!open) return;

    function positionMenu() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = Math.min(rect.width, window.innerWidth - 16);
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - menuWidth - 8
      );

      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left,
        width: menuWidth,
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
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  function toggleType(type, checked) {
    onChange(updateVesselTypeSelection(selected, [type], checked));
  }

  function toggleGroup(group, checked) {
    onChange(updateVesselTypeSelection(selected, group.types, checked));
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm"
      >
        <span>{label}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="max-h-80 overflow-y-auto rounded-md border bg-background p-2 shadow-xl"
          >
            {VESSEL_TYPE_GROUPS.map((group) => {
              const state = getVesselTypeGroupState(selected, group);

              return (
                <fieldset key={group.id} className="mb-2 last:mb-0">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm font-medium hover:bg-muted">
                    <input
                      type="checkbox"
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
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                      >
                        <input
                          type="checkbox"
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
          </div>,
          document.body
        )}
    </>
  );
}