import { useCallback, useEffect } from "react";
import { useMap } from "react-leaflet";
import { getVisibleTiles } from "@/utils/getVisibleTiles";

export function VisibleTilesTracker({ onChange }) {
  const map = useMap();

  const updateVisibleTiles = useCallback(() => {
    onChange(getVisibleTiles(map));
  }, [map, onChange]);

  useEffect(() => {
    updateVisibleTiles();

    map.on("moveend", updateVisibleTiles);
    map.on("zoomend", updateVisibleTiles);
    map.on("resize", updateVisibleTiles);

    return () => {
      map.off("moveend", updateVisibleTiles);
      map.off("zoomend", updateVisibleTiles);
      map.off("resize", updateVisibleTiles);
    };
  }, [map, updateVisibleTiles]);

  return null;
}
