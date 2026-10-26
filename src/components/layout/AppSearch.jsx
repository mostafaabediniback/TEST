import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, MapPin, Search, Ship } from "lucide-react";

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
import { useMapController } from "@/context/MapControllerContext";
import { useShips } from "@/hooks/useShips";
import { usePorts } from "@/hooks/usePorts";
import { getMapSelectionNavigation } from "@/lib/map/mapSelection";
import { getSearchMapFocus } from "@/lib/map/mapFocus";
import { getPortCoordinates } from "@/lib/map/portMarkers";
import { cn } from "@/lib/utils";
import { VesselFlag } from "../VesselFlag";

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;

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

function getRecentSearches() {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getShipCoordinates(ship) {
  const positions = [
    ship?.position,
    ship?.last_position,
    ship?.last_known_position,
    ship?.location,
    ship,
  ];

  for (const position of positions) {
    if (Array.isArray(position) && position.length >= 2) {
      const lng = Number(position[0]);
      const lat = Number(position[1]);

      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        return [lng, lat];
      }
    }

    const rawLng =
      position?.lon ??
      position?.lng ??
      position?.longitude ??
      position?.current_lon ??
      position?.last_position_lon;

    const rawLat =
      position?.lat ??
      position?.latitude ??
      position?.current_lat ??
      position?.last_position_lat;

    if (rawLng == null || rawLat == null) continue;

    const lng = Number(rawLng);
    const lat = Number(rawLat);

    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat];
    }
  }

  return null;
}

function getZoomedSelectionPath(_mapTarget, type, id, coordinates) {
  const [lng, lat] = coordinates;
  const z = 12;
  const tileCount = 2 ** z;

  const safeLng = Math.max(-180, Math.min(180, lng));
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, lat));

  const x = Math.max(
    0,
    Math.min(
      tileCount - 1,
      Math.floor(((safeLng + 180) / 360) * tileCount),
    ),
  );

  const latRadians = (safeLat * Math.PI) / 180;
  const y = Math.max(
    0,
    Math.min(
      tileCount - 1,
      Math.floor(
        ((1 - Math.asinh(Math.tan(latRadians)) / Math.PI) / 2) *
          tileCount,
      ),
    ),
  );

  const url = new URL(window.location.href);
  url.pathname = `/dashboard/${z}/${x}/${y}`;

  url.searchParams.delete("shipId");
  url.searchParams.delete("portId");
  url.searchParams.delete("pastTrack");
  url.searchParams.set(`${type}Id`, String(id));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("lat", String(lat));

  return `${url.pathname}${url.search}${url.hash}`;
}

function getSelectionMapPath(type, id, coordinates) {
  const mapTarget = getMapSelectionNavigation(type, id, coordinates);

  if (!mapTarget) return null;

  return getZoomedSelectionPath(
    mapTarget.to,
    type,
    id,
    coordinates,
  );
}

export default function AppSearch({ className }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recentSearches, setRecentSearches] =
    React.useState(getRecentSearches);

  const navigate = useNavigate();
  const { setSelectedShip, setSelectedPort, requestMapFocus } = useMapController();

  const debouncedQuery = useDebouncedValue(query.trim());
  const hasQuery = debouncedQuery.length > 0;
  const hasInput = query.trim().length > 0;
  const isImoSearch = /^\d+$/.test(debouncedQuery);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(recentSearches),
      );
    } catch {
      // Ignore storage errors, such as browser storage being unavailable.
    }
  }, [recentSearches]);

  const shipSearch = useShips(
    {
      page: 1,
      page_size: 8,
      name: hasQuery && !isImoSearch ? debouncedQuery : undefined,
      imo: isImoSearch ? debouncedQuery : undefined,
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
  const loading =
    hasQuery && (shipSearch.isPending || portSearch.isPending);

  React.useEffect(() => {
    function handleKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
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

  function navigateSearchResult(path) {
    requestMapFocus(getSearchMapFocus(path));
    navigate(path);
  }

  function selectResult(path, title, type, extra = {}) {
    setRecentSearches((current) =>
      [
        { ...extra, path, title, type },
        ...current.filter(
          (item) => item.detailPath !== path && item.path !== path,
        ),
      ].slice(0, MAX_RECENT_SEARCHES),
    );

    setOpen(false);
    navigateSearchResult(path);
  }

  function selectShipDetails(ship) {
    const shipId = ship?.id;
    const coordinates = getShipCoordinates(ship);
    const detailPath = `/ships/${shipId}`;

    selectResult(detailPath, ship.name ?? `Ship ${shipId}`, "ship", {
      detailPath,
      entity: ship,
      mapPath:
        shipId != null && coordinates
          ? getSelectionMapPath("ship", shipId, coordinates)
          : null,
    });
  }

  function selectPortDetails(port) {
    const portId = port?.id ?? port?.port_id;
    const coordinates = getPortCoordinates(port);
    const detailPath = `/ports/${portId}`;

    selectResult(detailPath, port.name ?? `Port ${portId}`, "port", {
      detailPath,
      entity: port,
      mapPath:
        portId != null &&
        Array.isArray(coordinates) &&
        Number.isFinite(coordinates[0]) &&
        Number.isFinite(coordinates[1])
          ? getSelectionMapPath("port", portId, coordinates)
          : null,
    });
  }

  function selectPort(port) {
    const portId = port?.id ?? port?.port_id;
    const coordinates = getPortCoordinates(port);

    if (
      portId == null ||
      !Array.isArray(coordinates) ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      console.warn("Port search result has no usable coordinates:", port);
      return;
    }

    const mapTarget = getMapSelectionNavigation(
      "port",
      portId,
      coordinates,
    );

    if (!mapTarget) return;

    const selectedPort = {
      ...port,
      id: portId,
      lon: coordinates[0],
      lat: coordinates[1],
    };

    setSelectedShip(null);
    setSelectedPort(selectedPort);

    const path = getZoomedSelectionPath(
      mapTarget.to,
      "port",
      portId,
      coordinates,
    );

    const detailPath = `/ports/${portId}`;

    selectResult(path, port.name ?? `Port ${portId}`, "port", {
      detailPath,
      entity: selectedPort,
      mapPath: path,
    });
  }

  function selectShip(ship) {
    const shipId = ship?.id;
    const coordinates = getShipCoordinates(ship);

    if (shipId == null || !coordinates) {
      console.warn("Ship search result has no usable position:", ship);
      return;
    }

    const mapTarget = getMapSelectionNavigation(
      "ship",
      shipId,
      coordinates,
    );

    if (!mapTarget) return;

    const selectedShip = {
      ...ship,
      id: shipId,
      lon: coordinates[0],
      lat: coordinates[1],
    };

    setSelectedPort(null);
    setSelectedShip(selectedShip);

    const path = getZoomedSelectionPath(
      mapTarget.to,
      "ship",
      shipId,
      coordinates,
    );

    const detailPath = `/ships/${shipId}`;

    selectResult(path, ship.name ?? `Ship ${shipId}`, "ship", {
      detailPath,
      entity: selectedShip,
      mapPath: path,
    });
  }

  function selectRecentOnMap(item) {
    if (item.entity && item.type === "ship") {
      selectShip(item.entity);
      return;
    }

    if (item.entity && item.type === "port") {
      selectPort(item.entity);
      return;
    }

    // Fallback for older recent-search entries.
    setOpen(false);
    navigateSearchResult(item.mapPath ?? item.path);
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
          "relative z-[1100] h-9 !w-full shrink-0 justify-center p-0",
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
            placeholder="Search vessels by name or IMO, or search ports..."
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            {!hasInput && recentSearches.length > 0 && (
              <CommandGroup heading="Recent searches">
                {recentSearches.map((item) => (
                  <div
                    key={`${item.type}-${item.title}-${item.detailPath ?? item.path}`}
                    className="flex items-center gap-1"
                  >
                    <CommandItem
                      value={`recent-${item.title}-${item.type}`}
                      onSelect={() =>
                        selectResult(
                          item.detailPath ?? item.path,
                          item.title,
                          item.type,
                          item,
                        )
                      }
                      className="min-w-0 flex-1 gap-2"
                    >
                      {item.type === "ship" ? (
                        <Ship
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Anchor
                          className="size-4 shrink-0 text-amber-500"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{item.title}</span>
                    </CommandItem>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Show ${item.title} on map`}
                      title="Show on map"
                      onClick={() => selectRecentOnMap(item)}
                    >
                      <MapPin className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
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
                <CommandEmpty>No vessels or ports found.</CommandEmpty>
              )}

            {hasQuery && ships.length > 0 && (
              <CommandGroup heading="Ships">
                {ships.map((ship) => (
                  <div
                    key={`ship-${ship.id}`}
                    className="flex items-center gap-1"
                  >
                    <CommandItem
                      value={`ship-${ship.id}`}
                      onSelect={() => selectShipDetails(ship)}
                      className="min-w-0 flex-1 gap-3 py-2"
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
                            <span className="truncate">
                              {ship.vessel_type}
                            </span>
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

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Show ${ship.name ?? "ship"} on map`}
                      title="Show on map"
                      onClick={() => selectShip(ship)}
                    >
                      <MapPin className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </CommandGroup>
            )}

            {hasQuery && ports.length > 0 && (
              <CommandGroup heading="Ports">
                {ports.map((port) => {
                  const portId = port?.id ?? port?.port_id;

                  return (
                    <div
                      key={`port-${portId}`}
                      className="flex items-center gap-1"
                    >
                      <CommandItem
                        value={`port-${portId}`}
                        onSelect={() => selectPortDetails(port)}
                        className="min-w-0 flex-1 gap-3 py-2"
                      >
                        <Anchor
                          className="size-4 shrink-0 text-amber-500"
                          aria-hidden="true"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate">
                            {port.name ?? `Port ${portId}`}
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

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Show ${port.name ?? "port"} on map`}
                        title="Show on map"
                        onClick={() => selectPort(port)}
                      >
                        <MapPin className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
