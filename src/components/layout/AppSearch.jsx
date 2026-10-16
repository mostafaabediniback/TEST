import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, Search, Ship } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useShips } from "@/hooks/useShips";
import { usePorts } from "@/hooks/usePorts";
import { cn } from "@/lib/utils";
import { VesselFlag } from "../VesselFlag";

const searchItems = [
  { title: "Dashboard", path: "/" },
  { title: "Ships", path: "/ships" },
  { title: "Voyages", path: "/voyage" },
  { title: "Ports", path: "/ports" },
];

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getRows(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.results ?? data?.data ?? [];
}

export default function AppSearch({ className }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(query.trim());
  const hasQuery = debouncedQuery.length > 0;

  const shipSearch = useShips(
    {
      page: 1,
      page_size: 8,
      name: debouncedQuery || undefined,
      sort_by: "id",
      sort_order: "desc",
    },
    { enabled: hasQuery },
  );

  const portSearch = usePorts(
    {
      page: 1,
      page_size: 8,
      name: debouncedQuery || undefined,
      sort_by: "id",
      sort_order: "asc",
    },
    { enabled: hasQuery },
  );

  const ships = getRows(shipSearch.data);
  const ports = getRows(portSearch.data);
  const loading = hasQuery && (shipSearch.isPending || portSearch.isPending);

  React.useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function selectResult(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Open search"
        onClick={() => setOpen(true)}
        className={cn(
          "relative z-[1100] h-9 w-9 shrink-0 justify-center p-0",
          "text-muted-foreground sm:h-10 sm:w-64 sm:justify-start sm:gap-2 sm:px-3",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="sr-only sm:not-sr-only sm:inline">Search...</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-xs sm:inline-block">
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ships and ports..."
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            {!hasQuery && (
              <CommandGroup heading="Pages">
                {searchItems.map(({ title, path }) => (
                  <CommandItem
                    key={path}
                    value={title}
                    onSelect={() => selectResult(path)}
                  >
                    {title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasQuery && loading && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {hasQuery &&
              !loading &&
              ships.length === 0 &&
              ports.length === 0 && (
                <CommandEmpty>No ships or ports found.</CommandEmpty>
              )}

            {ships.length > 0 && (
              <CommandGroup heading="Ships">
                {ships.map((ship) => (
                  <CommandItem
                    key={`ship-${ship.id}`}
                    value={`ship-${ship.id}`}
                    onSelect={() => selectResult(`/ships/${ship.id}`)}
                    className="gap-3 py-2"
                  >
                    <Ship
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        {ship.name ?? `Ship ${ship.id}`}
                      </span>
                      <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                        {ship.vessel_type && (
                          <span className="truncate">{ship.vessel_type}</span>
                        )}

                        {ship.flag && (
                          <>
                            {ship.vessel_type && <span>·</span>}
                            <VesselFlag country={ship.flag} />
                          </>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {ports.length > 0 && (
              <CommandGroup heading="Ports">
                {ports.map((port) => (
                  <CommandItem
                    key={`port-${port.id}`}
                    value={`port-${port.id}`}
                    onSelect={() => selectResult(`/ports/${port.id}`)}
                    className="gap-3 py-2"
                  >
                    <Anchor
                      className="size-4 shrink-0 text-amber-500"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        {port.name ?? `Port ${port.id}`}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {port.country_name
                          ? `Port [${port.country_name}]`
                          : port.country_code
                            ? `Port [${port.country_code}]`
                            : "Port"}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
