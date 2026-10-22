import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MapLibreOverlay } from "@deck.gl/maplibre";
import { useMapController } from "@/context/MapControllerContext";
import { tileToLngLat } from "@/lib/map/mapTiles";
import { getMapSelectionCoordinates } from "@/lib/map/mapSelection";
import MapInstance from "./MapInstance";
import MapDataLayers from "./MapDataLayers";

setWorkerUrl(maplibreWorkerUrl);

export default function WorldMap({ geoData }) {
  const container = useRef(null);
  const { z, x, y } = useParams();
  const { pathname, search } = useLocation();
  const { mapView } = useMapController();

  const [initialView] = useState(() => {
    const zoom = Number(z);
    const selectionCoordinates = getMapSelectionCoordinates(search);
    if (selectionCoordinates && Number.isInteger(zoom) && zoom >= 2 && zoom <= 19) {
      return { center: selectionCoordinates, zoom };
    }
    if (mapView?.pathname === pathname) return mapView;
    const tileX = Number(x);
    const tileY = Number(y);

    if (
      Number.isInteger(zoom) &&
      zoom >= 2 &&
      zoom <= 19 &&
      Number.isFinite(tileX) &&
      Number.isFinite(tileY)
    ) {
      return {
        center: tileToLngLat(zoom, tileX + 0.5, tileY + 0.5),
        zoom,
      };
    }

    return { center: [121.4737, 31.2304], zoom: 10 };
  });

  const [engine, setEngine] = useState(null);

  useEffect(() => {
    if (!container.current) return;

    const map = new MapLibreMap({
      container: container.current,
      ...initialView,
      minZoom: 2,
      maxZoom: 19,
      zoomSnap: 1,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "base-map",
            type: "raster",
            source: "osm",
          },
        ],
      },
    });

    const overlay = new MapLibreOverlay({
      interleaved: true,
      layers: [],
    });

    map.addControl(overlay);

    // One wheel gesture = one integer zoom level. Avoid rebuilding ship
    // geometries at every fractional zoom step.
    map.scrollZoom.disable();
    const wheelTarget = container.current;
    let wheelLocked = false;
    let wheelUnlockTimer;
    function onWheel(event) {
      event.preventDefault();
      if (wheelLocked || event.deltaY === 0) return;
      wheelLocked = true;
      const direction = event.deltaY < 0 ? 1 : -1;
      const nextZoom = Math.max(2, Math.min(19, Math.round(map.getZoom()) + direction));
      map.zoomTo(nextZoom, { duration: 0 });
      wheelUnlockTimer = setTimeout(() => {
        wheelLocked = false;
      }, 180);
    }
    wheelTarget.addEventListener("wheel", onWheel, { passive: false });

    const handleLoad = () => setEngine({ map, overlay });
    map.once("load", handleLoad);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container.current);

    return () => {
      clearTimeout(wheelUnlockTimer);
      wheelTarget.removeEventListener("wheel", onWheel);
      resizeObserver.disconnect();
      map.remove();
      setEngine(null);
    };
    // The initial view is intentionally used only when the map is created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!engine || !geoData) return;

    const { map } = engine;

    if (map.getSource("countries")) {
      if (map.getLayer("countries-line")) {
        map.removeLayer("countries-line");
      }
      if (map.getLayer("countries-fill")) {
        map.removeLayer("countries-fill");
      }
      map.removeSource("countries");
    }

    map.addSource("countries", {
      type: "geojson",
      data: geoData,
    });

    map.addLayer({
      id: "countries-fill",
      type: "fill",
      source: "countries",
      paint: {
        "fill-color": "#3388ff",
        "fill-opacity": 0.2,
      },
    });

    map.addLayer({
      id: "countries-line",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#3388ff",
        "line-width": 2,
      },
    });

    
    return () => {
      if (map.getLayer("countries-line")) map.removeLayer("countries-line");
      if (map.getLayer("countries-fill")) map.removeLayer("countries-fill");
      if (map.getSource("countries")) map.removeSource("countries");
    };
  }, [engine, geoData]);
  
  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={container} className="h-full w-full" />

      {engine && (
        <>
          <MapInstance map={engine.map} />
          <MapDataLayers map={engine.map} overlay={engine.overlay} />
        </>
      )}
    </div>
  );
}
