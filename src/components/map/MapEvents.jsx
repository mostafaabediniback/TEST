import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { useLocale } from "@/context/LocaleContext";

function latLngToTile(lat, lng, zoom) {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) * 0.5 * n);
  return { x, y };
}

function buildViewport(map) {
  const center = map.getCenter();
  const z = map.getZoom();
  const { x, y } = latLngToTile(center.lat, center.lng, z);
  return {
    lat: center.lat,
    lng: center.lng,
    z,
    x,
    y,
  };
}

export function MapEvents({ onViewportChange, initialCenter, initialZoom, focusedCar, showRaster }) {
  const map = useMap();
  const { direction, isRtl, t } = useLocale();
  const focusedId = focusedCar?.id;
  const focusedLat = focusedCar?.lat;
  const focusedLng = focusedCar?.lng;

  const events = useMapEvents({
    moveend() {
      onViewportChange(buildViewport(events));
    },
    zoomend() {
      onViewportChange(buildViewport(events));
    },
  });

  useEffect(() => {
    onViewportChange(buildViewport(map));
  }, [map, onViewportChange]);

  useEffect(() => {
    if (focusedId != null && Number.isFinite(focusedLat) && Number.isFinite(focusedLng)) {
      map.setView([focusedLat, focusedLng], 16);
    }
  }, [map, focusedId, focusedLat, focusedLng]);

  useEffect(() => {
    let frame;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false, debounceMoveend: true }));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(map.getContainer());
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);

  useEffect(() => {
    const attribution = map.attributionControl;
    attribution.setPosition(isRtl ? "bottomleft" : "bottomright");
    attribution.getContainer().dir = direction;
    if (!showRaster) return undefined;
    const credit = `&copy; <a href="https://www.openstreetmap.org/copyright">${t("OpenStreetMap contributors")}</a>`;
    attribution.addAttribution(credit);
    return () => attribution.removeAttribution(credit);
  }, [map, direction, isRtl, showRaster, t]);

  useEffect(() => {
    const recenter = () => map.setView(initialCenter, initialZoom, { animate: true });
    window.addEventListener("car-map:recenter", recenter);
    return () => window.removeEventListener("car-map:recenter", recenter);
  }, [map, initialCenter, initialZoom]);

  return null;
}
