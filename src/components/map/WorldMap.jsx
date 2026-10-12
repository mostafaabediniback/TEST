import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MapLibreOverlay } from "@deck.gl/maplibre";
import { useMapController } from "@/context/MapControllerContext";
import { tileToLngLat } from "@/lib/mapTiles";
import MapInstance from "./MapInstance";
import MapDataLayers from "./MapDataLayers";

setWorkerUrl(maplibreWorkerUrl);

export default function WorldMap({ geoData }) {
  const container = useRef(null);
  const { z, x, y } = useParams();
  const { pathname } = useLocation();
  const { mapView } = useMapController();
  const [initialView] = useState(() => {
    if (mapView?.pathname === pathname) return mapView;
    const zoom = Number(z), tileX = Number(x), tileY = Number(y);
    return Number.isInteger(zoom) && zoom >= 2 && zoom <= 19 && Number.isFinite(tileX) && Number.isFinite(tileY)
      ? { center: tileToLngLat(zoom, tileX + 0.5, tileY + 0.5), zoom }
      : { center: [121.4737, 31.2304], zoom: 10 };
  });
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    const map = new MapLibreMap({
      container: container.current,
      ...initialView,
      minZoom: 2,
      maxZoom: 19,
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' } },
        layers: [{ id: "base-map", type: "raster", source: "osm" }],
      },
    });
    const overlay = new MapLibreOverlay({ interleaved: true, layers: [] });
    map.addControl(overlay);
    map.once("load", () => setEngine({ map, overlay }));
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container.current);
    return () => { resizeObserver.disconnect(); map.remove(); };
  }, [initialView]);

  useEffect(() => {
    if (!engine || !geoData) return;
    const { map } = engine;
    map.addSource("countries", { type: "geojson", data: geoData });
    map.addLayer({ id: "countries-fill", type: "fill", source: "countries", paint: { "fill-color": "#3388ff", "fill-opacity": 0.2 } });
    map.addLayer({ id: "countries-line", type: "line", source: "countries", paint: { "line-color": "#3388ff", "line-width": 2 } });
    return () => {
      if (map.getLayer("countries-line")) map.removeLayer("countries-line");
      if (map.getLayer("countries-fill")) map.removeLayer("countries-fill");
      if (map.getSource("countries")) map.removeSource("countries");
    };
  }, [engine, geoData]);

  return <div className="absolute inset-0 h-full w-full">
    <div ref={container} className="h-full w-full" />
    {engine && <>
      <MapInstance map={engine.map} />
      <MapDataLayers map={engine.map} overlay={engine.overlay} />
    </>}
  </div>;
}
