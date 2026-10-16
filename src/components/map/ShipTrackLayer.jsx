import { useEffect } from "react";
import { PathLayer } from "@deck.gl/layers";
import { getShipTrackBounds } from "@/lib/map/shipTrack";

export default function ShipTrackLayer({ map, layerManager, path, visible }) {
  useEffect(() => {
    layerManager.setGroup("ship-track", {
      order: 5,
      layers: visible && path.length >= 2 ? [new PathLayer({
        id: "ship-past-track",
        data: [path],
        getPath: (points) => points,
        getColor: [249, 115, 22, 255],
        getWidth: 3,
        widthUnits: "pixels",
        capRounded: true,
        jointRounded: true,
        wrapLongitude: true,
        pickable: false,
      })] : [],
    });
    return () => layerManager.removeGroup("ship-track");
  }, [layerManager, path, visible]);

  useEffect(() => {
    if (!visible) return;
    const bounds = getShipTrackBounds(path, map.getCenter().lng);
    if (!bounds) return;
    const { clientWidth, clientHeight } = map.getContainer();
    map.fitBounds(bounds, {
      padding: {
        top: Math.min(64, clientHeight / 6),
        right: Math.min(64, clientWidth / 4),
        bottom: Math.min(144, clientHeight / 2),
        left: Math.min(64, clientWidth / 4),
      },
      maxZoom: 14,
      duration: 500,
    });
  }, [map, path, visible]);

  return null;
}
