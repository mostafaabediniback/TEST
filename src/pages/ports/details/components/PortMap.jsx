import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";


export default function PortMap({
  port = {},
  onShowOnMap,
  mapTo,
  canShowOnMap = false,
}) {
  const { t } = useLocale();
  const containerRef = useRef(null);

  const latitude = Number(port.lat);
  const longitude = Number(port.lon);

  const hasCoordinates =
    port.lat != null &&
    port.lon != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  useEffect(() => {
    if (!containerRef.current || !hasCoordinates) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: import.meta.env.VITE_MAP_STYLE_URL || "/tiles/styles/basic-preview/style.json",
      center: [longitude, latitude],
      zoom: 10,
      minZoom: 2,
      maxZoom: 19,
    });

    const marker = new Marker({ color: "#2563eb" })
      .setLngLat([longitude, latitude])
      .addTo(map);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    map.on("error", (event) => {
      console.error("Port map error:", event.error);
    });

    return () => {
      resizeObserver.disconnect();
      marker.remove();
      map.remove();
    };
  }, [hasCoordinates, latitude, longitude]);

  if (!hasCoordinates) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500">
        Port location unavailable
      </div>
    );
  }

  return (
    <div className="relative h-72 overflow-hidden rounded-md bg-slate-100">
      <div ref={containerRef} className="h-full w-full" />

      <Button
        size="sm"
        variant="outline"
        onClick={onShowOnMap}
        disabled={!canShowOnMap}
        nativeButton={false}
        render={mapTo ? <Link to={mapTo} /> : <span />}
        className="absolute end-3 top-3 z-10 bg-background/95 shadow-sm"
      >
        <MapPin aria-hidden="true" />
        {t("viewOnMap")}
      </Button>
    </div>
  );
}
