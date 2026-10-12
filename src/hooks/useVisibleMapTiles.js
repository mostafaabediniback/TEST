import { useEffect, useState } from "react";
import { getVisibleTiles } from "@/lib/mapTiles";

export function useVisibleMapTiles(map) {
  const [tiles, setTiles] = useState([]);
  useEffect(() => {
    if (!map) return;
    let timeoutId;
    let previousKeys = "";
    function updateTiles() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const next = getVisibleTiles(map);
        const keys = next.map(({ z, x, y }) => z + "/" + x + "/" + y).sort().join("|");
        if (keys !== previousKeys) {
          previousKeys = keys;
          setTiles(next);
        }
      }, 200);
    }
    updateTiles();
    map.on("moveend", updateTiles);
    map.on("resize", updateTiles);
    return () => {
      clearTimeout(timeoutId);
      map.off("moveend", updateTiles);
      map.off("resize", updateTiles);
    };
  }, [map]);
  return tiles;
}
