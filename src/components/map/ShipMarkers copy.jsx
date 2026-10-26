import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
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
import { getShipMarker } from "@/lib/map/shipMarkers";
import MapPopup from "./MapPopup";
import ShipTrackLayer from "./ShipTrackLayer";
import ShipTrackControls from "./ShipTrackControls";
import { useShipTrack } from "@/hooks/useShipTrack";
import ShipPreview from "../ships/ShipPreview";
import {
  clearMapSelection,
  getMapSelectionCoordinates,
  getMapSelectionSearch,
  toggleShipTrack,
} from "@/lib/map/mapSelection";

const MIN_MARKER_PIXELS = 8;

function getPolygonPixelSize(polygon, map) {
  if (!polygon || !map?.project) return null;

  const coordinatePairs = [];

  function collect(value) {
    if (
      Array.isArray(value) &&
      value.length >= 2 &&
      Number.isFinite(value[0]) &&
      Number.isFinite(value[1])
    ) {
      coordinatePairs.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    }
  }

  collect(polygon);
  if (coordinatePairs.length === 0) return null;

  const projected = coordinatePairs.map(([lon, lat]) =>
    map.project([lon, lat]),
  );
  const xs = projected.map((point) => point.x);
  const ys = projected.map((point) => point.y);

  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function isTinyMarker(marker, map) {
  const size = getPolygonPixelSize(marker?.polygon, map);

  return (
    size !== null &&
    size.width < MIN_MARKER_PIXELS &&
    size.height < MIN_MARKER_PIXELS
  );
}

export default function ShipMarkers({ ships = [], map, layerManager }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();

  const { selectedShip, setSelectedShip } = useMapController();
  const { t, direction } = useLocale();
  const { vesselTypes } = useFilters();

  const [hoveredShip, setHoveredShip] = useState(null);
  const [flashOn, setFlashOn] = useState(true);

  const selectedId = search.get("shipId");

  const selected = useMemo(() => {
    if (selectedId === null) return null;

    return (
      ships.find((ship) => String(ship.id) === selectedId) ??
      (String(selectedShip?.id) === selectedId ? selectedShip : null) ?? {
        id: selectedId,
      }
    );
  }, [ships, selectedShip, selectedId]);

  const preview = useShipPreview(selected, selectedId !== null);
  const displayedShip = { ...(selected ?? {}), ...(preview.ship ?? {}) };

  const selectedVisible =
    matchesVesselTypes(displayedShip, vesselTypes) ||
    Boolean(getMapSelectionCoordinates(search));

  const isPastTrackActive =
    selectedId !== null && search.get("pastTrack") === selectedId;

  const track = useShipTrack(selectedId, isPastTrackActive && selectedVisible);

  const togglePastTrack = useCallback(() => {
    if (selectedId === null) return;

    setSearch((current) => toggleShipTrack(current, selectedId), {
      replace: true,
    });
  }, [setSearch, selectedId]);

  const selectedCoordinates = useMemo(() => {
    if (selectedId === null) return null;

    return (
      getShipCoordinates(selected) ??
      getShipCoordinates(preview.position) ??
      getShipCoordinates(preview.ship) ??
      getMapSelectionCoordinates(search)
    );
  }, [selectedId, selected, preview.position, preview.ship, search]);

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

  const markers = useMemo(() => {
    const visibleMarkers = ships
      .filter((ship) => matchesVesselTypes(ship, vesselTypes))
      .map((ship) =>
        String(ship.id) === selectedId && selectedMarker
          ? selectedMarker
          : getShipMarker(ship, zoom),
      )
      .filter((marker) => marker?.polygon);

    if (
      selectedMarker &&
      !visibleMarkers.some((marker) => String(marker.ship?.id) === selectedId)
    ) {
      visibleMarkers.push(selectedMarker);
    }

    return visibleMarkers;
  }, [ships, vesselTypes, selectedId, selectedMarker, zoom]);

  const {
    squareShipMarkers: squareMarkers,
    arrowShipMarkers: arrowMarkers,
    circleShipMarkers: circleMarkers,
  } = useMemo(() => {
    const squareShip = [];
    const arrowShip = [];
    const circleShip = [];

    markers.forEach((marker) => {
      if (zoom < 14) {
        if (marker.ship.speed == null || marker.ship.speed == 0) {
          if (zoom >= 10) circleShip.push(marker.ship);
        } else arrowShip.push(marker);
      } else if (zoom >= 14) {
        if (marker.ship.heading != null) {
          if (marker.ship.speed != null || marker.ship.speed > 0.1)
            squareShip.push(marker);
          else circleShip.push(marker);
          // TODO: if not at anchor -> draw circle
          // TODO: speed > 1, draw new arrow on square ship according to heading
        } //else if(marker.ship.speed != null || marker.ship.speed > 0.1)
        else arrowShip.push(marker);
        // if (isTinyMarker(marker, map) && getShipCoordinates(marker.ship)) {
        //   arrowShip.push(marker);
        // } else {
        //   squareShip.push(marker);
        // }
      } // else arrowShip.push(marker);
      // TODO: filter little ship
    });

    return {
      squareShipMarkers: squareShip,
      arrowShipMarkers: arrowShip,
      circleShipMarkers: circleShip,
    };
  }, [markers, map]);

  useEffect(() => {
    if (arrowMarkers.length === 0) return undefined;

    const timer = window.setInterval(() => {
      setFlashOn((current) => !current);
    }, 500);

    return () => window.clearInterval(timer);
  }, [arrowMarkers.length]);

  const showShipDetails = useCallback(() => {
    setSelectedShip(displayedShip);

    const target = getShipDetailsNavigation(displayedShip, {
      source: "map",
      returnTo: location.pathname + location.search,
    });

    navigate(target.to, { state: target.state });
  }, [
    displayedShip,
    location.pathname,
    location.search,
    navigate,
    setSelectedShip,
  ]);

  const closeSelection = useCallback(() => {
    setSearch((current) => clearMapSelection(current), { replace: true });
    setSelectedShip(null);
    setHoveredShip(null);
  }, [setSearch, setSelectedShip]);

  const handleShipClick = useCallback(
    ({ object }) => {
      const ship = object?.ship;
      if (ship?.id == null) return false;

      if (String(ship.id) === selectedId) {
        closeSelection();
        return true;
      }

      setSelectedShip(ship);
      setHoveredShip(null);

      setSearch(
        (current) =>
          getMapSelectionSearch(
            "ship",
            ship.id,
            getShipCoordinates(ship),
            current,
          ),
        { replace: true },
      );

      return true;
    },
    [selectedId, closeSelection, setSearch, setSelectedShip],
  );

  useEffect(() => {
    layerManager.setGroup("ships", {
      order: 20,

      onEmptyClick: () => {
        setSelectedShip(null);
        setHoveredShip(null);
        setSearch(
          (current) =>
            current.has("shipId") ? clearMapSelection(current) : current,
          { replace: true },
        );
      },

      onHover: ({ object }) => {
        setHoveredShip(object?.ship ?? null);
      },

      layers: [
        new PolygonLayer({
          id: "ship-markers",
          data: squareMarkers,
          getPolygon: (marker) => marker.polygon,
          getFillColor: (marker) => marker.color,
          filled: true,
          stroked: true,
          getLineColor: [255, 255, 255, 255],
          lineWidthUnits: "pixels",
          getLineWidth: 0.25,
          pickable: true,
          autoHighlight: true,
          highlightColor: [96, 165, 250, 255],
          onClick: handleShipClick,
        }),

        new ScatterplotLayer({
          id: "tiny-ship-flashes",
          data: arrowMarkers,
          getPosition: (marker) => getShipCoordinates(marker.ship),
          getRadius: flashOn ? 7 : 3,
          radiusUnits: "pixels",
          getFillColor: flashOn ? [37, 99, 235, 255] : [37, 99, 235, 100],
          stroked: true,
          getLineColor: [255, 255, 255, 220],
          getLineWidth: 1,
          pickable: true,
          onClick: handleShipClick,
        }),

        new PolygonLayer({
          id: "selected-ship-outline",
          data:
            selectedMarker && !isTinyMarker(selectedMarker, map)
              ? [selectedMarker]
              : [],
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
    squareMarkers,
    arrowMarkers,
    flashOn,
    selectedMarker,
    map,
    layerManager,
    setSearch,
    setSelectedShip,
    handleShipClick,
  ]);

  useEffect(() => {
    return () => layerManager.removeGroup("ships");
  }, [layerManager]);

  const hoverCoordinates = matchesVesselTypes(hoveredShip, vesselTypes)
    ? getShipCoordinates(hoveredShip)
    : null;

  const hoveredMarker = hoveredShip ? getShipMarker(hoveredShip, zoom) : null;

  return (
    <>
      <ShipTrackLayer
        map={map}
        layerManager={layerManager}
        path={track.path}
        visible={isPastTrackActive && selectedVisible}
      />

      {isPastTrackActive && selectedVisible && (
        <ShipTrackControls
          shipName={displayedShip.name || t("unnamedShip")}
          track={track}
          onHide={togglePastTrack}
          onDetails={showShipDetails}
          onClose={closeSelection}
        />
      )}

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
        !isPastTrackActive &&
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

              <ShipPreview
                ship={displayedShip}
                photo={preview.photo}
                position={preview.position}
                voyage={preview.voyage}
                port={preview.port}
                isLoading={preview.isLoading}
                detailsLabel={t("viewDetails")}
                onPastTrackClick={togglePastTrack}
                isPastTrackActive={isPastTrackActive}
                onDetailsClick={showShipDetails}
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
