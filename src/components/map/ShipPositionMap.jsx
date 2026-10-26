import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";


export default function ShipPositionMap({ coordinates, name }) {
  const containerRef = useRef(null);

  const longitude = Number(coordinates?.[0]);
  const latitude = Number(coordinates?.[1]);

  useEffect(() => {
    if (
      !containerRef.current ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude)
    ) {
      return;
    }

    const map = new MapLibreMap({
      container: containerRef.current,
      center: coordinates,
      zoom: 8,
      minZoom: 2,
      maxZoom: 19,
      // style: {
      //   version: 8,
      //   sources: {
      //     osm: {
      //       type: "raster",
      //       tiles: [tileUrl],
      //       tileSize: 256,
      //       attribution: "Map data attribution",
      //     },
      //   },
      //   layers: [{ id: "base-map", type: "raster", source: "osm" }],
      // },
      style: import.meta.env.VITE_MAP_STYLE_URL || "/tiles/styles/basic-preview/style.json",
    });

    const marker = new Marker({ color: "#2563eb" })
      .setLngLat([longitude, latitude])
      .addTo(map);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    map.on("error", (event) => {
      console.error("Ship map error:", event.error);
    });

    return () => {
      resizeObserver.disconnect();
      marker.remove();
      map.remove();
    };
  }, [longitude, latitude]);

  return <div ref={containerRef} className="h-full w-full" />;
}
