import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { createMapLayerManager } from "@/lib/mapOverlayLayers";
import MapShipsLayer from "./MapShipsLayer";
import MapPortsLayer from "./MapPortsLayer";

export default function MapDataLayers({ map, overlay }) {
  const [search, setSearch] = useSearchParams();
  const hasSelection = search.has("shipId") || search.has("portId");
  const layerManager = useMemo(
    () => createMapLayerManager(overlay, map),
    [overlay, map],
  );
  const clearSelections = useCallback(() => {
    if (!hasSelection) return;
    // One URL update avoids two selection handlers overwriting each other's changes.
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("shipId");
        next.delete("portId");
        return next;
      },
      { replace: true },
    );
  }, [hasSelection, setSearch]);
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
