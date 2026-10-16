// MapDataLayers.jsx
import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { createMapLayerManager } from "@/lib/map/mapOverlayLayers";
import MapShipsLayer from "./MapShipsLayer";
import MapPortsLayer from "./MapPortsLayer";
import { useMapController } from "@/context/MapControllerContext";
import { clearMapSelection } from "@/lib/map/mapSelection";

export default function MapDataLayers({ map, overlay }) {
  const [search, setSearch] = useSearchParams();
  const { setSelectedShip, setSelectedPort } = useMapController();
  const hasSelection = search.has("shipId") || search.has("portId");

  const layerManager = useMemo(
    () => createMapLayerManager(overlay, map),
    [overlay, map],
  );

  const clearSelections = useCallback(() => {
    if (!hasSelection) return;
    setSelectedShip(null);
    setSelectedPort(null);

    setSearch(
      (current) => clearMapSelection(current),
      { replace: true },
    );
  }, [hasSelection, setSearch, setSelectedShip, setSelectedPort]);

  useEffect(() => {
    layerManager.setGroup("selection", {
      layers: [],
      onEmptyClick: clearSelections,
    });
  }, [layerManager, clearSelections]);

  useEffect(() => {
    if (!hasSelection) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") clearSelections();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasSelection, clearSelections]);

  useEffect(() => () => layerManager.clear(), [layerManager]);

  return (
    <>
      <MapShipsLayer map={map} layerManager={layerManager} />
      <MapPortsLayer map={map} layerManager={layerManager} />
    </>
  );
}