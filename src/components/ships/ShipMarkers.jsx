import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PolygonLayer } from "@deck.gl/layers";
import { X } from "lucide-react";
import { useMapController } from "@/context/MapControllerContext";
import { useFilters } from "@/context/FilterContext";
import { matchesVesselTypes } from "@/lib/vesselTypes";
import { useLocale } from "@/context/LocaleContext";
import { useShipPreview } from "@/hooks/useShipPreview";
import {
  getShipCoordinates,
  getShipDetailsNavigation,
} from "@/lib/shipNavigation";
import { getShipMarker } from "@/lib/shipMarkers";
import MapPopup from "../map/MapPopup";
import ShipDetails from "./ShipDetails";

export default function ShipMarkers({ ships = [], map, layerManager }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const { selectedShip, setSelectedShip } = useMapController();
  const { t, direction } = useLocale();
  const { vesselTypes } = useFilters();
  const [hoveredShip, setHoveredShip] = useState(null);

  const selectedId = search.get("shipId");

  const selected = useMemo(() => {
    if (selectedId === null) return null;

    return (
      ships.find((ship) => String(ship.id) === selectedId) ??
      (String(selectedShip?.id) === selectedId ? selectedShip : null) ??
      { id: selectedId }
    );
  }, [ships, selectedShip, selectedId]);

  const preview = useShipPreview(selected, selectedId !== null);
  const displayedShip = { ...(selected ?? {}), ...(preview.ship ?? {}) };
  const selectedVisible = matchesVesselTypes(displayedShip, vesselTypes);

  const selectedCoordinates = useMemo(
    () =>
      getShipCoordinates(selected) ??
      getShipCoordinates(preview.position) ??
      getShipCoordinates(preview.ship),
    [selected, preview.position, preview.ship],
  );

  const subscribeToZoom = useCallback(
    (onChange) => {
      map.on("zoom", onChange);
      return () => map.off("zoom", onChange);
    },
    [map],
  );

  const getZoomSnapshot = useCallback(() => map.getZoom(), [map]);

  const zoom = useSyncExternalStore(
    subscribeToZoom,
    getZoomSnapshot,
    getZoomSnapshot,
  );

  const selectedMarker = useMemo(() => {
    if (!selectedCoordinates || !selectedVisible) return null;

    return getShipMarker(
      {
        ...selected,
        ...preview.ship,
        lon: selectedCoordinates[0],
        lat: selectedCoordinates[1],
      },
      zoom,
      preview.position,
    );
  }, [
    selected,
    preview.ship,
    preview.position,
    selectedCoordinates,
    selectedVisible,
    zoom,
  ]);

  const markers = useMemo(
    () =>
      ships
        .filter((ship) => matchesVesselTypes(ship, vesselTypes))
        .map((ship) =>
          String(ship.id) === selectedId && selectedMarker
            ? selectedMarker
            : getShipMarker(ship, zoom),
        )
        .filter((marker) => marker?.polygon),
    [ships, vesselTypes, selectedId, selectedMarker, zoom],
  );

  const closeSelection = useCallback(() => {
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("shipId");
        return next;
      },
      { replace: true },
    );

    setSelectedShip(null);
    setHoveredShip(null);
  }, [setSearch, setSelectedShip]);

  useEffect(() => {
    layerManager.setGroup("ships", {
      order: 20,

      onEmptyClick: () => {
        setSelectedShip(null);
        setHoveredShip(null);
        setSearch(
          (current) => {
            if (!current.has("shipId")) return current;
            const next = new URLSearchParams(current);
            next.delete("shipId");
            return next;
          },
          { replace: true },
        );
      },

      onHover: ({ object }) => {
        setHoveredShip(object?.ship ?? null);
      },

      layers: [
        new PolygonLayer({
          id: "ship-markers",
          data: markers,
          getPolygon: (marker) => marker.polygon,
          filled: true,
          stroked: true,
          getFillColor: [37, 99, 235, 255],
          getLineColor: [255, 255, 255, 255],
          lineWidthUnits: "pixels",
          getLineWidth: 1.5,
          pickable: true,
          autoHighlight: true,
          highlightColor: [96, 165, 250, 255],

          onClick: ({ object }) => {
            const ship = object?.ship;
            if (ship?.id == null) return false;

            if (String(ship.id) === selectedId) {
              closeSelection();
              return true;
            }

            setSelectedShip(ship);
            setHoveredShip(null);

            setSearch(
              (current) => {
                const next = new URLSearchParams(current);
                next.set("shipId", String(ship.id));
                next.delete("portId");
                return next;
              },
              { replace: true },
            );

            return true;
          },
        }),

        new PolygonLayer({
          id: "selected-ship-outline",
          data: selectedMarker ? [selectedMarker] : [],
          getPolygon: (marker) => marker.selectionPolygon,
          filled: false,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 3,
          getLineColor: [37, 99, 235, 255],
          pickable: false,
        }),
      ],
    });
  }, [
    markers,
    selectedMarker,
    layerManager,
    setSearch,
    setSelectedShip,
    selectedId,
    closeSelection,
  ]);

  useEffect(
    () => () => layerManager.removeGroup("ships"),
    [layerManager],
  );

  const hoverCoordinates = matchesVesselTypes(hoveredShip, vesselTypes)
    ? getShipCoordinates(hoveredShip)
    : null;

  const hoveredMarker = hoveredShip
    ? getShipMarker(hoveredShip, zoom)
    : null;

  return (
    <>
      {hoverCoordinates && String(hoveredShip.id) !== selectedId && (
        <MapPopup
          map={map}
          coordinates={hoverCoordinates}
          markerRadius={hoveredMarker?.radius}
          hover
        >
          <div
            dir={direction}
            className="px-3 py-2 text-sm font-semibold text-slate-900"
          >
            {hoveredShip.name || t("unnamedShip")}
          </div>
        </MapPopup>
      )}

      {selectedId !== null &&
        selectedCoordinates &&
        selectedVisible &&
        selectedMarker && (
          <MapPopup
            map={map}
            coordinates={selectedCoordinates}
            markerRadius={selectedMarker.radius}
          >
            <div dir={direction} className="relative p-3">
              <button
                type="button"
                aria-label={t("closeSelection")}
                onClick={closeSelection}
                className="absolute end-2 top-2 z-10 rounded-full p-1 text-slate-600 hover:bg-white/70"
              >
                <X size={16} />
              </button>

              <ShipDetails
                ship={displayedShip}
                photo={preview.photo}
                position={preview.position}
                voyage={preview.voyage}
                port={preview.port}
                isLoading={preview.isLoading}
                detailsLabel={t("viewDetails")}
                onDetailsClick={() => {
                  setSelectedShip(displayedShip);

                  const target = getShipDetailsNavigation(displayedShip, {
                    source: "map",
                    returnTo: location.pathname + location.search,
                  });

                  navigate(target.to, { state: target.state });
                }}
              />

              {preview.isError && (
                <p role="status" className="mt-2 text-xs text-amber-700">
                  {t("partialShipData")}
                </p>
              )}
            </div>
          </MapPopup>
        )}
    </>
  );
}