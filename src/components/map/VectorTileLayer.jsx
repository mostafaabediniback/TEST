import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function VectorTileLayer({ url }) {
  const map = useMap();

  useEffect(() => {
    if (!url) return undefined;

    let layer;
    let disposed = false;

    async function mountVectorLayer() {
      // Leaflet.VectorGrid is an older Leaflet plugin and attaches itself to L.
      // Exposing L globally before loading the plugin keeps it compatible with Vite.
      globalThis.L = L;
      await import("leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js");

      if (disposed || !L.vectorGrid?.protobuf) return;

      layer = L.vectorGrid.protobuf(url, {
        vectorTileLayerStyles: {
          water: {
            fill: true,
            fillColor: "#b7dbea",
            fillOpacity: 0.9,
            stroke: false,
          },
          waterway: { color: "#8ec5dc", weight: 1.2 },
          road: { color: "#ffffff", weight: 1.2, opacity: 0.95 },
          transportation: { color: "#ffffff", weight: 1.2, opacity: 0.95 },
          boundary: { color: "#94a3b8", weight: 0.8, opacity: 0.65 },
          building: {
            fill: true,
            fillColor: "#d6d3d1",
            fillOpacity: 0.45,
            stroke: false,
          },
          landuse: {
            fill: true,
            fillColor: "#dcebd4",
            fillOpacity: 0.25,
            stroke: false,
          },
          place: {
            radius: 1.5,
            fill: true,
            fillColor: "#475569",
            fillOpacity: 0.8,
          },
        },
        rendererFactory: L.canvas.tile,
        interactive: false,
        maxNativeZoom: 14,
      });

      layer.addTo(map);
    }

    mountVectorLayer().catch((error) => {
      console.error("Vector tile layer failed to load", error);
    });

    return () => {
      disposed = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map, url]);

  return null;
}
