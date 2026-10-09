import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { X } from "lucide-react";
import { useMapController } from "@/context/MapControllerContext";
import { useFilters } from "@/context/FilterContext";
import { matchesVesselTypes } from "@/lib/vesselTypes";
import { useLocale } from "@/context/LocaleContext";
import { useShipPreview } from "@/hooks/useShipPreview";
import { getShipCoordinates, getShipDetailsNavigation } from "@/lib/shipNavigation";
import { getShipMarker } from "@/lib/shipMarkers";
import MapPopup from "../map/MapPopup";
import ShipDetails from "./ShipDetails";

export default function ShipMarkers({ ships = [], map, overlay }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const { selectedShip, setSelectedShip } = useMapController();
  const { t, direction } = useLocale();
  const { vesselTypes } = useFilters();
  const [hoveredShip, setHoveredShip] = useState(null);
  const selectedId = search.get("shipId");
  const selected = useMemo(() => selectedId === null ? null
    : ships.find((ship) => String(ship.id) === selectedId)
    ?? (String(selectedShip?.id) === selectedId ? selectedShip : { id: selectedId }), [ships, selectedShip, selectedId]);
  const preview = useShipPreview(selected, selectedId !== null);
  const displayedShip = { ...selected, ...preview.ship };
  const selectedVisible = matchesVesselTypes(displayedShip, vesselTypes);
  const selectedCoordinates = useMemo(() => getShipCoordinates(selected) ?? getShipCoordinates(preview.position) ?? getShipCoordinates(preview.ship), [selected, preview.position, preview.ship]);
  const subscribeToZoom = useCallback((onChange) => {
    map.on("zoomend", onChange);
    return () => map.off("zoomend", onChange);
  }, [map]);
  const zoom = useSyncExternalStore(subscribeToZoom, () => map.getZoom());
  const selectedMarker = useMemo(() => selectedCoordinates && selectedVisible ? getShipMarker({
    ...selected,
    ...preview.ship,
    lon: selectedCoordinates[0],
    lat: selectedCoordinates[1],
  }, zoom, preview.position) : null, [selected, preview.ship, preview.position, selectedCoordinates, selectedVisible, zoom]);
  const markers = useMemo(() => ships.filter((ship) => matchesVesselTypes(ship, vesselTypes)).map((ship) => String(ship.id) === selectedId && selectedMarker
    ? selectedMarker : getShipMarker(ship, zoom)).filter(Boolean), [ships, vesselTypes, selectedId, selectedMarker, zoom]);

  const closeSelection = useCallback(() => {
    setSearch((current) => { const next = new URLSearchParams(current); next.delete("shipId"); return next; }, { replace: true });
    setSelectedShip(null);
    setHoveredShip(null);
  }, [setSearch, setSelectedShip]);

  useEffect(() => {
    const interaction = {
      pickable: true,
      autoHighlight: true,
      highlightColor: [147, 197, 253, 255],
      onHover: ({ object }) => {
        setHoveredShip(object?.ship ?? null);
        map.getCanvas().style.cursor = object ? "pointer" : "";
      },
      onClick: ({ object }) => {
        const ship = object?.ship;
        if (ship?.id == null) return;
        if (String(ship.id) === selectedId) {
          closeSelection();
          return true;
        }
        setSelectedShip(ship);
        setHoveredShip(null);
        setSearch((current) => { const next = new URLSearchParams(current); next.set("shipId", String(ship.id)); return next; }, { replace: true });
        return true;
      },
    };
    overlay.setProps({
      onClick: ({ object }) => {
        if (!object && selectedId !== null) closeSelection();
      },
      layers: [
        new ScatterplotLayer({
          id: "ship-markers",
          data: markers.filter((marker) => !marker.polygon),
          getPosition: (marker) => marker.coordinates,
          radiusUnits: "pixels",
          getRadius: (marker) => marker.radius,
          filled: true,
          stroked: true,
          getFillColor: [37, 99, 235, 242],
          getLineColor: [255, 255, 255, 255],
          lineWidthUnits: "pixels",
          getLineWidth: 2,
          ...interaction,
        }),
        new PolygonLayer({
          id: "ship-footprints",
          data: markers.filter((marker) => marker.polygon),
          getPolygon: (marker) => marker.polygon,
          filled: true,
          stroked: true,
          getFillColor: [37, 99, 235, 242],
          getLineColor: [255, 255, 255, 255],
          lineWidthUnits: "pixels",
          getLineWidth: 1.5,
          ...interaction,
        }),
        new PolygonLayer({
          id: "selected-ship-outline",
          data: selectedMarker?.polygon ? [selectedMarker] : [],
          getPolygon: (marker) => marker.selectionPolygon,
          filled: false,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 3,
          getLineColor: [37, 99, 235, 255],
          pickable: false,
        }),
        new ScatterplotLayer({
          id: "selected-ship-ring",
          data: selectedMarker && !selectedMarker.polygon ? [selectedMarker] : [],
          getPosition: (marker) => marker.coordinates,
          radiusUnits: "pixels",
          getRadius: 13,
          filled: false,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 3,
          getLineColor: [37, 99, 235, 255],
          pickable: false,
        }),
      ],
    });
  }, [markers, selectedMarker, map, overlay, setSearch, setSelectedShip, selectedId, closeSelection]);

  useEffect(() => () => { overlay.setProps({ layers: [], onClick: null }); map.getCanvas().style.cursor = ""; }, [overlay, map]);

  useEffect(() => {
    if (selectedId === null) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") closeSelection();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, closeSelection]);

  const hoverCoordinates = matchesVesselTypes(hoveredShip, vesselTypes) ? getShipCoordinates(hoveredShip) : null;
  const hoveredMarker = hoveredShip ? getShipMarker(hoveredShip, zoom) : null;
  return <>
    {hoverCoordinates && String(hoveredShip.id) !== selectedId && (
      <MapPopup map={map} coordinates={hoverCoordinates} markerRadius={hoveredMarker?.radius} hover>
        <div dir={direction} className="px-3 py-2 text-sm font-semibold text-slate-900">{hoveredShip.name || t("unnamedShip")}</div>
      </MapPopup>
    )}
    {selectedId !== null && selectedCoordinates && selectedVisible && (
      <MapPopup map={map} coordinates={selectedCoordinates} markerRadius={selectedMarker?.radius}>
        <div dir={direction} className="relative p-3">
          <button type="button" aria-label={t("closeSelection")} onClick={closeSelection} className="absolute end-2 top-2 z-10 rounded-full p-1 text-slate-600 hover:bg-white/70"><X size={16} /></button>
          <ShipDetails ship={displayedShip} photo={preview.photo} position={preview.position} voyage={preview.voyage} port={preview.port} isLoading={preview.isLoading} detailsLabel={t("viewDetails")} onDetailsClick={() => {
            setSelectedShip(displayedShip);
            const target = getShipDetailsNavigation(displayedShip, { source: "map", returnTo: location.pathname + location.search });
            navigate(target.to, { state: target.state });
          }} />
          {preview.isError && <p role="status" className="mt-2 text-xs text-amber-700">{t("partialShipData")}</p>}
        </div>
      </MapPopup>
    )}
  </>;
}
