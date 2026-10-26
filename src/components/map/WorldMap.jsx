// import { useEffect, useRef, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";
// import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
// import { MapLibreOverlay } from "@deck.gl/maplibre";

// import { useMapController } from "@/context/MapControllerContext";
// import { tileToLngLat } from "@/lib/map/mapTiles";
// import { getMapSelectionCoordinates } from "@/lib/map/mapSelection";
// import MapInstance from "./MapInstance";
// import MapDataLayers from "./MapDataLayers";

// setWorkerUrl(maplibreWorkerUrl);

// export default function WorldMap({ geoData }) {
//   const container = useRef(null);
//   const { z, x, y } = useParams();
//   const { pathname, search } = useLocation();
//   const { mapView } = useMapController();

// const [initialView] = useState(() => {
//   const zoom = Number(z);
//   const tileX = Number(x);
//   const tileY = Number(y);

//   // A valid tile in the URL takes priority over a saved map view.
//   if (
//     Number.isInteger(zoom) &&
//     zoom >= 2 &&
//     zoom <= 19 &&
//     Number.isInteger(tileX) &&
//     Number.isInteger(tileY)
//   ) {
//     return {
//       center: tileToLngLat(zoom, tileX + 0.5, tileY + 0.5),
//       zoom,
//     };
//   }

//   const selectionCoordinates = getMapSelectionCoordinates(search);
//   if (selectionCoordinates) {
//     return { center: selectionCoordinates, zoom: 2 };
//   }

//   if (mapView?.pathname === pathname) {
//     return mapView;
//   }

//   // Default to tile z/x/y = 2/2/1.
//   return {
//     center: tileToLngLat(2, 2.5, 1.5),
//     zoom: 2,
//   };
// });


//   const [engine, setEngine] = useState(null);

//   useEffect(() => {
//     if (!container.current) return;

//     const map = new MapLibreMap({
//       container: container.current,
//       ...initialView,
//       // Start on a whole zoom level, even if mapView has a fractional zoom.
//       zoom: Math.round(initialView.zoom),
//       zoomSnap: 1,
//       minZoom: 2,
//       maxZoom: 19,
//       style:
//         import.meta.env.VITE_MAP_STYLE_URL ||
//         "/tiles/styles/basic-preview/style.json",
//     });

//     map.on("error", (event) => {
//       console.error("MapLibre error:", event.error);
//     });

//     const overlay = new MapLibreOverlay({
//       interleaved: true,
//       layers: [],
//     });

//     map.addControl(overlay);

//     // Trackpad gestures can leave a fractional zoom when the gesture ends.
//     const snapZoomToInteger = () => {
//       const zoom = map.getZoom();
//       const nearestInteger = Math.round(zoom);

//       if (zoom !== nearestInteger) {
//         map.setZoom(nearestInteger);
//       }
//     };

//     map.on("zoomend", snapZoomToInteger);

//     const handleLoad = () => setEngine({ map, overlay });
//     map.once("load", handleLoad);

//     const resizeObserver = new ResizeObserver(() => map.resize());
//     resizeObserver.observe(container.current);

//     return () => {
//       resizeObserver.disconnect();
//       map.off("zoomend", snapZoomToInteger);
//       map.remove();
//       setEngine(null);
//     };
//     // Initial view is used only when creating the map.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (!engine || !geoData) return;

//     const { map } = engine;

//     if (map.getSource("countries")) {
//       if (map.getLayer("countries-line")) map.removeLayer("countries-line");
//       if (map.getLayer("countries-fill")) map.removeLayer("countries-fill");
//       map.removeSource("countries");
//     }

//     map.addSource("countries", {
//       type: "geojson",
//       data: geoData,
//     });

//     map.addLayer({
//       id: "countries-fill",
//       type: "fill",
//       source: "countries",
//       paint: {
//         "fill-color": "#3388ff",
//         "fill-opacity": 0.2,
//       },
//     });

//     map.addLayer({
//       id: "countries-line",
//       type: "line",
//       source: "countries",
//       paint: {
//         "line-color": "#3388ff",
//         "line-width": 2,
//       },
//     });

//     return () => {
//       if (map.getLayer("countries-line")) map.removeLayer("countries-line");
//       if (map.getLayer("countries-fill")) map.removeLayer("countries-fill");
//       if (map.getSource("countries")) map.removeSource("countries");
//     };
//   }, [engine, geoData]);

//   return (
//     <div className="absolute inset-0 h-full w-full">
//       <div ref={container} className="h-full w-full" />

//       {engine && (
//         <>
//           <MapInstance map={engine.map} />
//           <MapDataLayers map={engine.map} overlay={engine.overlay} />
//         </>
//       )}
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MapLibreOverlay } from "@deck.gl/maplibre";

import { useMapController } from "@/context/MapControllerContext";
import { tileToLngLat } from "@/lib/map/mapTiles";
import { getMapSelectionCoordinates } from "@/lib/map/mapSelection";
import MapInstance from "./MapInstance";
import MapDataLayers from "./MapDataLayers";

setWorkerUrl(maplibreWorkerUrl);

const MIN_ZOOM = 2;
const MAX_ZOOM = 19;
const SELECTION_ZOOM = 12;

function getValidTileView(z, x, y) {
  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  if (
    !Number.isInteger(zoom) ||
    zoom < MIN_ZOOM ||
    zoom > MAX_ZOOM ||
    !Number.isInteger(tileX) ||
    !Number.isInteger(tileY)
  ) {
    return null;
  }

  const tileCount = 2 ** zoom;

  if (
    tileX < 0 ||
    tileX >= tileCount ||
    tileY < 0 ||
    tileY >= tileCount
  ) {
    return null;
  }

  return {
    center: tileToLngLat(zoom, tileX + 0.5, tileY + 0.5),
    zoom,
  };
}

export default function WorldMap({ geoData }) {
  const container = useRef(null);
  const { z, x, y } = useParams();
  const { pathname, search } = useLocation();
  const { mapView } = useMapController();

  const [initialView] = useState(() => {
    const selectionCoordinates = getMapSelectionCoordinates(search);

    if (selectionCoordinates) {
      return {
        center: selectionCoordinates,
        zoom: SELECTION_ZOOM,
      };
    }

    const tileView = getValidTileView(z, x, y);
    if (tileView) return tileView;

    if (mapView?.pathname === pathname) {
      return mapView;
    }

    // Default tile: z/x/y = 2/2/1.
    return {
      center: tileToLngLat(2, 2.5, 1.5),
      zoom: 2,
    };
  });

  const [engine, setEngine] = useState(null);

  useEffect(() => {
    if (!container.current) return;

    const map = new MapLibreMap({
      container: container.current,
      ...initialView,
      zoom: Math.round(initialView.zoom),
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomSnap: 1,
      scrollZoom: true,
      style:
        import.meta.env.VITE_MAP_STYLE_URL ||
        "/tiles/styles/basic-preview/style.json",
    });

    map.on("error", (event) => {
      console.error("MapLibre error:", event.error);
    });

    // Enable mouse-wheel zoom and the other map interactions.
    map.scrollZoom.enable();
    map.dragPan.enable();
    map.touchZoomRotate.enable();
    map.touchZoomRotate.disableRotation();
    map.dragRotate.disable();
    map.doubleClickZoom.enable();

    const overlay = new MapLibreOverlay({
      interleaved: true,
      layers: [],
    });

    map.addControl(overlay);

    const handleLoad = () => {
      setEngine({ map, overlay });
    };

    map.once("load", handleLoad);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(container.current);

    return () => {
      resizeObserver.disconnect();
      map.off("load", handleLoad);
      map.remove();
    };
    // Initial view is only used when creating the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter for a selected ship or port, but not when z/x/y change
  // as a result of panning the map.
  useEffect(() => {
    if (!engine) return;

    const coordinates = getMapSelectionCoordinates(search);

    if (coordinates) {
      engine.map.flyTo({
        center: coordinates,
        zoom: SELECTION_ZOOM,
        essential: true,
      });
    }
  }, [engine, search]);

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
      if (map.getLayer("countries-line")) {
        map.removeLayer("countries-line");
      }

      if (map.getLayer("countries-fill")) {
        map.removeLayer("countries-fill");
      }

      if (map.getSource("countries")) {
        map.removeSource("countries");
      }
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
