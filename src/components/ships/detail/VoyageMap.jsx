import { useEffect, useRef, useState } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);

export default function VoyageMap({ coordinates, course }) {
  const container = useRef(null);
  const [failed, setFailed] = useState(false);
  const longitude = coordinates?.[0];
  const latitude = coordinates?.[1];
  useEffect(() => {
    if (longitude == null || latitude == null) return;
    let map;
    let observer;
    try {
      map = new Map({
        container: container.current, center: [longitude, latitude], zoom: 2.5,
        minZoom: 1, maxZoom: 17, attributionControl: true,
        style: {
          version: 8,
          sources: { base: {
            type: "raster", tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
            tileSize: 256, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          } },
          layers: [{ id: "base", type: "raster", source: "base" }],
        },
      });
      const marker = document.createElement("div");
      marker.className = "vessel-map-marker";
      marker.setAttribute("aria-label", "Current vessel position");
      new Marker({ element: marker, rotation: Number(course) || 0 })
        .setLngLat([longitude, latitude]).addTo(map);
      map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
      map.on("error", () => setFailed(true));
      observer = new ResizeObserver(() => map.resize());
      observer.observe(container.current);
    } catch {
      // Defer state update until after this setup effect.
      queueMicrotask(() => setFailed(true));
    }
    return () => { observer?.disconnect(); map?.remove(); };
  }, [longitude, latitude, course]);
  return <div className="vessel-voyage-map">
    <div ref={container} className="vessel-map-canvas" />
    {coordinates ? <span className="vessel-map-coordinate">{latitude.toFixed(4)}°, {longitude.toFixed(4)}°</span>
      : <div className="vessel-map-empty">Position not reported</div>}
    {failed && <span className="vessel-map-warning">Map tiles unavailable · position shown above</span>}
  </div>;
}
