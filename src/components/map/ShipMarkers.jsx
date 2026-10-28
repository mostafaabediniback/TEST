import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  IconLayer,
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
} from "@deck.gl/layers";
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
import { buildShipMarker, SHIP_MARKER_OPTIONS } from "@/lib/map/shipMarkers";
import { MAX_DETAILED_SHIPS } from "@/lib/map/shipOverviewData";
import { createShipOverviewLayers } from "@/lib/map/shipOverviewLayers";
import { useShipOverview } from "@/hooks/useShipOverview";
import atAnchorIcon from "@/assets/ship-at-anchor.svg";
import mooredIcon from "@/assets/ship-moored.svg";
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

// Each navigation status uses its own SVG asset.
const NAVIGATION_STATUS_ICONS = {
  anchor: {
    url: atAnchorIcon,
    width: 32,
    height: 32,
    anchorX: 16,
    anchorY: 16,
    mask: false,
  },
  moored: {
    url: mooredIcon,
    width: 32,
    height: 32,
    anchorX: 16,
    anchorY: 16,
    mask: false,
  },
};

// Draw the markers and handle selection, hover, and popups.
// shipMarkers.js calculates the shapes and map coordinates.
export default function ShipMarkers({ ships = [], map, layerManager }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedShip, setSelectedShip } = useMapController();
  const { t, direction: textDirection } = useLocale();
  const { vesselTypes } = useFilters();
  const [hoveredShip, setHoveredShip] = useState(null);

  // Find the ship selected in the URL and load its preview details.
  const selectedShipId = searchParams.get("shipId");

  const selectedShipRecord = useMemo(() => {
    if (selectedShipId === null) return null;

    return (
      ships.find((ship) => String(ship.id) === selectedShipId) ??
      (String(selectedShip?.id) === selectedShipId ? selectedShip : null) ?? {
        id: selectedShipId,
      }
    );
  }, [ships, selectedShip, selectedShipId]);

  const shipPreview = useShipPreview(selectedShipRecord, selectedShipId !== null);
  const shipForPopup = { ...(selectedShipRecord ?? {}), ...(shipPreview.ship ?? {}) };
  const isSelectedShipVisible =
    matchesVesselTypes(shipForPopup, vesselTypes) ||
    Boolean(getMapSelectionCoordinates(searchParams));

  // Past tracks show recorded positions; movement lines show projected travel.
  const isPastTrackActive =
    selectedShipId !== null && searchParams.get("pastTrack") === selectedShipId;
  const pastTrack = useShipTrack(
    selectedShipId,
    isPastTrackActive && isSelectedShipVisible,
  );
  const togglePastTrackVisibility = useCallback(() => {
    setSearchParams((current) => toggleShipTrack(current, selectedShipId), {
      replace: true,
    });
  }, [setSearchParams, selectedShipId]);

  const selectedShipCoordinates = useMemo(() => {
    if (selectedShipId === null) return null;

    return (
      getShipCoordinates(selectedShipRecord) ??
      getShipCoordinates(shipPreview.position) ??
      getShipCoordinates(shipPreview.ship) ??
      getMapSelectionCoordinates(searchParams)
    );
  }, [
    selectedShipId,
    selectedShipRecord,
    shipPreview.position,
    shipPreview.ship,
    searchParams,
  ]);

  // Rebuild marker shapes whenever the map zoom changes.
  const subscribeToZoom = useCallback(
    (onChange) => {
      map.on("zoom", onChange);
      return () => map.off("zoom", onChange);
    },
    [map],
  );

  const readMapZoom = useCallback(() => Math.floor(map.getZoom()), [map]);

  const mapZoom = useSyncExternalStore(
    subscribeToZoom,
    readMapZoom,
    readMapZoom,
  );

  const showDetails = mapZoom >= SHIP_MARKER_OPTIONS.minZoomForShipBody &&
    ships.length <= MAX_DETAILED_SHIPS;
  const { overview, isPending: isPreparingMarkers } = useShipOverview(ships, vesselTypes, !showDetails);

  // Include the selected ship's extra position details when building its marker.
  const selectedShipMarker = useMemo(() => {
    if (!selectedShipCoordinates || !isSelectedShipVisible) return null;

    return buildShipMarker(
      {
        ...selectedShipRecord,
        ...shipPreview.ship,
        lon: selectedShipCoordinates[0],
        lat: selectedShipCoordinates[1],
      },
      mapZoom,
      shipPreview.position,
    );
  }, [
    selectedShipRecord,
    shipPreview.ship,
    shipPreview.position,
    selectedShipCoordinates,
    isSelectedShipVisible,
    mapZoom,
  ]);

  // Apply vessel filters, then build the visible markers.
  // Use the enriched marker for the selected ship instead of drawing it twice.
  const shipMarkers = useMemo(() => {
    if (!showDetails) return selectedShipMarker ? [selectedShipMarker] : [];
    const visibleShipMarkers = ships
      .filter((ship) => matchesVesselTypes(ship, vesselTypes))
      .map((ship) =>
        String(ship.id) === selectedShipId && selectedShipMarker
          ? selectedShipMarker
          : buildShipMarker(ship, mapZoom),
      )
      .filter((marker) => marker?.outlineCoordinates);
    if (
      selectedShipMarker &&
      !visibleShipMarkers.some((marker) => String(marker.ship.id) === selectedShipId)
    ) {
      visibleShipMarkers.push(selectedShipMarker);
    }
    return visibleShipMarkers;
  }, [ships, vesselTypes, selectedShipId, selectedShipMarker, mapZoom, showDetails]);

  const detailsNavigation = getShipDetailsNavigation(shipForPopup, {
    source: "map",
    returnTo: location.pathname + location.search,
  });

  const clearShipSelection = useCallback(() => {
    setSearchParams((current) => clearMapSelection(current), { replace: true });

    setSelectedShip(null);
    setHoveredShip(null);
  }, [setSearchParams, setSelectedShip]);

  // Clicking the selected ship closes it; clicking another ship selects that ship.
  const handleShipClick = useCallback(
    ({ object: clickedMarker }) => {
      const clickedShip = clickedMarker?.ship;
      if (clickedShip?.id == null) return false;

      if (String(clickedShip.id) === selectedShipId) {
        clearShipSelection();
        return true;
      }

      setSelectedShip(clickedShip);
      setHoveredShip(null);
      setSearchParams(
        (currentParams) =>
          getMapSelectionSearch(
            "ship",
            clickedShip.id,
            getShipCoordinates(clickedShip),
            currentParams,
          ),
        { replace: true },
      );
      return true;
    },
    [selectedShipId, clearShipSelection, setSelectedShip, setSearchParams],
  );

  // Pass the prepared drawing data to Deck.gl layers.
  useEffect(() => {
    const markersWithMovementLines = shipMarkers.filter(
      (marker) => marker.movementLine,
    );
    const shipBodyMarkers = shipMarkers.filter(
      (marker) => marker.shapeType === "hull",
    );
    const markersWithStatusBadges = shipMarkers.filter(
      (marker) => marker.statusIconName,
    );

    layerManager.setGroup("ships", {
      order: 20,

      onEmptyClick: () => {
        setSelectedShip(null);
        setHoveredShip(null);
        setSearchParams(
          (current) => {
            if (!current.has("shipId")) return current;
            return clearMapSelection(current);
          },
          { replace: true },
        );
      },

      onHover: ({ object: hoveredMarker }) => {
        setHoveredShip(hoveredMarker?.ship ?? null);
      },

      layers: [
        ...(!showDetails ? createShipOverviewLayers(overview, ships, mapZoom, handleShipClick) : []),
        // Clickable main shape: hull, arrow, circle, or diamond.
        new PolygonLayer({
          id: "ship-markers",
          data: shipMarkers,
          getPolygon: (marker) => marker.outlineCoordinates,
          getFillColor: (marker) => marker.fillColor,
          filled: true,
          stroked: false,
          pickable: true,
          autoHighlight: true,
          highlightColor: [96, 165, 250, 255],

          onClick: handleShipClick,
        }),

        // Projected movement line and its arrowhead.
        new PathLayer({
          id: "ship-motion-vectors",
          data: markersWithMovementLines,
          getPath: (marker) => marker.movementLine.lineCoordinates,
          getColor: [82, 99, 108, 255],
          widthUnits: "pixels",
          getWidth: 1,
          pickable: false,
        }),

        new PathLayer({
          id: "ship-motion-vector-heads",
          data: markersWithMovementLines,
          getPath: (marker) => marker.movementLine.arrowHeadCoordinates,
          getColor: [82, 99, 108, 255],
          widthUnits: "pixels",
          getWidth: 1,
          pickable: false,
        }),

        // White dot at the ship's reported position, inside the hull.
        new ScatterplotLayer({
          id: "ship-position-reference",
          data: shipBodyMarkers,
          getPosition: (marker) => marker.positionCoordinates,
          radiusUnits: "pixels",
          getRadius: 3,
          getFillColor: [255, 255, 255, 255],
          stroked: false,
          pickable: true,
          onClick: handleShipClick,
        }),

        // Anchor or mooring badge, slightly offset from the reported position.
        new IconLayer({
          id: "ship-navigation-status",
          data: markersWithStatusBadges,
          getPosition: (marker) => marker.positionCoordinates,
          getIcon: (marker) => NAVIGATION_STATUS_ICONS[marker.statusIconName],
          getSize: 18,
          sizeUnits: "pixels",
          getPixelOffset: [14, -14],
          pickable: true,
          onClick: handleShipClick,
        }),

        // Blue selection outline around the selected ship.
        new PolygonLayer({
          id: "selected-ship-outline",
          data: selectedShipMarker ? [selectedShipMarker] : [],
          getPolygon: (marker) => marker.selectionOutlineCoordinates,
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
    shipMarkers,
    selectedShipMarker,
    layerManager,
    setSearchParams,
    setSelectedShip,
    handleShipClick,
    showDetails,
    overview,
    ships,
    mapZoom,
  ]);

  // Remove this component's layers when it unmounts.
  useEffect(() => () => layerManager.removeGroup("ships"), [layerManager]);

  const hoveredShipCoordinates = matchesVesselTypes(hoveredShip, vesselTypes)
    ? getShipCoordinates(hoveredShip)
    : null;

  const hoveredShipMarker = hoveredShip
    ? buildShipMarker(hoveredShip, mapZoom)
    : null;

  // Show the past track, hover label, and selected ship's popup.
  return (
    <>
      {isPreparingMarkers && <div role="status" className="pointer-events-none absolute left-4 top-4 z-[1000] rounded bg-white px-3 py-2 text-sm shadow">{t("loadingShips")}</div>}
      <ShipTrackLayer
        map={map}
        layerManager={layerManager}
        path={pastTrack.path}
        visible={isPastTrackActive && isSelectedShipVisible}
      />
      {isPastTrackActive && isSelectedShipVisible && (
        <ShipTrackControls
          shipName={shipForPopup.name || t("unnamedShip")}
          track={pastTrack}
          onHide={togglePastTrackVisibility}
          detailsNavigation={detailsNavigation}
          onClose={clearShipSelection}
        />
      )}
      {hoveredShipCoordinates && String(hoveredShip.id) !== selectedShipId && (
        <MapPopup
          map={map}
          coordinates={hoveredShipCoordinates}
          markerRadius={hoveredShipMarker?.popupOffsetPixels}
          hover
        >
          <div
            dir={textDirection}
            className="px-3 py-2 text-sm font-semibold text-slate-900"
          >
            {hoveredShip.name || t("unnamedShip")}
          </div>
        </MapPopup>
      )}

      {selectedShipId !== null &&
        !isPastTrackActive &&
        selectedShipCoordinates &&
        isSelectedShipVisible &&
        selectedShipMarker && (
          <MapPopup
            map={map}
            coordinates={selectedShipCoordinates}
            markerRadius={selectedShipMarker.popupOffsetPixels}
          >
            <div dir={textDirection} className="relative p-3">
              <button
                type="button"
                aria-label={t("closeSelection")}
                onClick={clearShipSelection}
                className="absolute end-2 top-2 z-10 rounded-full p-1 text-slate-600 hover:bg-white/70"
              >
                <X size={16} />
              </button>

              <ShipPreview
                ship={shipForPopup}
                photo={shipPreview.photo}
                position={shipPreview.position}
                voyage={shipPreview.voyage}
                port={shipPreview.port}
                isLoading={shipPreview.isLoading}
                detailsLabel={t("viewDetails")}
                onPastTrackClick={togglePastTrackVisibility}
                isPastTrackActive={isPastTrackActive}
                detailsNavigation={detailsNavigation}
              />

              {shipPreview.isError && (
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

