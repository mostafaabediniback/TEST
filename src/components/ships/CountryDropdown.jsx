import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useCountryFlags } from "@/hooks/useCountryFlags";
import { VesselFlag } from "@/components/VesselFlag";

export default function CountryDropdown({
  selected = "",
  onChange,
  placeholder = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const { data, isPending, isError, error } = useCountryFlags();
  const countries = Array.isArray(data) ? data : [];

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter((country) => country.toLowerCase().includes(query));
  }, [countries, search]);

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

  function selectCountry(country) {
    onChange?.(country);
    setSearch("");
    setOpen(false);
  }

  return (
    <>
      <div
        ref={buttonRef}
        className={`flex h-8 w-full min-w-0 items-center rounded-lg border bg-background px-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
          open ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-full min-w-0 flex-1 items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-ring"
        >
          {selected ? (
            <VesselFlag country={selected} />
          ) : (
            <span className="text-muted-foreground">
              {placeholder || "selected Flag"}
            </span>
          )}
          <span aria-hidden="true" className="ml-2">
            ▾
          </span>
        </button>

        {selected && (
          <button
            type="button"
            aria-label="Clear selected country"
            onClick={() => onChange?.("")}
            className="ml-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600 focus-visible:outline-2 focus-visible:outline-ring"
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
            className="overflow-hidden rounded-md border bg-background shadow-xl"
          >
            <div className="border-b p-2">
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search countries…"
                aria-label="Search countries"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              <button
                type="button"
                onClick={() => selectCountry("")}
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
              >
                Any country
              </button>

              {isPending && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Loading countries…
                </p>
              )}

              {isError && (
                <p role="alert" className="px-3 py-2 text-sm text-destructive">
                  {error?.message ?? "Could not load countries."}
                </p>
              )}

              {!isPending &&
                !isError &&
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => selectCountry(country)}
                    aria-selected={selected === country}
                    className="flex w-full items-center rounded px-3 py-2 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <VesselFlag country={country} />
                  </button>
                ))}

              {!isPending && !isError && filteredCountries.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No countries found.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
