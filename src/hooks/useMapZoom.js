import { useCallback, useSyncExternalStore } from "react";

export function useMapZoom(map) {
  const subscribe = useCallback((onChange) => {
    let frame = null;
    function onZoom() {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        onChange();
      });
    }
    map.on("zoom", onZoom);
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoom", onZoom);
      map.off("zoomend", onZoom);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [map]);
  const getSnapshot = useCallback(() => map.getZoom(), [map]);
  return useSyncExternalStore(subscribe, getSnapshot);
}