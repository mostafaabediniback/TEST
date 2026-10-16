import { useEffect, useRef } from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import { MapLibreOverlay } from "@deck.gl/maplibre";
import { ScatterplotLayer } from "@deck.gl/layers";

export default function ShipPositionMap({ coordinates, name }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current || !coordinates) return;

    const map = new MapLibreMap({
      container: container.current,
      center: coordinates, // [longitude, latitude]
      zoom: 8,
      minZoom: 2,
      maxZoom: 19,
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
        layers: [{ id: "base-map", type: "raster", source: "osm" }],
      },
    });

    const overlay = new MapLibreOverlay({
      interleaved: true,
      layers: [
        new ScatterplotLayer({
          id: "detail-ship-marker",
          data: [{ coordinates, name }],
          getPosition: (item) => item.coordinates,
          getRadius: 9,
          radiusUnits: "pixels",
          getFillColor: [37, 99, 235, 242],
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          stroked: true,
          filled: true,
          pickable: false,
        }),
      ],
    });

    map.addControl(overlay);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, [coordinates, name]);

  return <div ref={container} className="h-full w-full" />;
}
