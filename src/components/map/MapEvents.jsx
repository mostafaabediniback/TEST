import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useLocale } from "@/context/LocaleContext";
import { useMapPosition } from "@/context/MapPositionContext";
import { buildViewport } from "@/lib/mapPosition";

export function MapEvents({ onViewportChange, selectedCarId, focusedCar, showRaster }) {
  const map = useMap();
  const { position, initialCenter, restoredFromUrl, initialCarId, savePosition } = useMapPosition();
  const restoredSelectionRef = useRef(restoredFromUrl ? initialCarId : null);
  const { direction, isRtl, t } = useLocale();
  const focusedId = focusedCar?.id;
  const focusedLat = focusedCar?.lat;
  const focusedLng = focusedCar?.lng;

  useEffect(() => {
    let timer;
    const cancelPending = () => clearTimeout(timer);
    const onMoveEnd = () => {
      cancelPending();
      const center = map.getCenter();
      const next = buildViewport(center.lat, center.lng, map.getZoom());
      savePosition(next);
      // Coalesce rapid completed gestures; a new gesture cancels the pending fetch.
      timer = setTimeout(() => onViewportChange(next), 150);
    };
    map.on("movestart", cancelPending);
    map.on("moveend", onMoveEnd);
    return () => {
      cancelPending();
      map.off("movestart", cancelPending);
      map.off("moveend", onMoveEnd);
    };
  }, [map, onViewportChange, savePosition]);

  useEffect(() => {
    if (selectedCarId !== restoredSelectionRef.current) restoredSelectionRef.current = null;
    // A selected car in a refresh URL must not override its saved map position.
    if (restoredSelectionRef.current && String(focusedId) === restoredSelectionRef.current) return;
    if (focusedId != null && Number.isFinite(focusedLat) && Number.isFinite(focusedLng)) {
      map.setView([focusedLat, focusedLng], 16);
    }
  }, [map, selectedCarId, focusedId, focusedLat, focusedLng]);

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
    const recenter = () => map.setView(initialCenter, position.z, { animate: true });
    window.addEventListener("car-map:recenter", recenter);
    return () => window.removeEventListener("car-map:recenter", recenter);
  }, [map, initialCenter, position.z]);

  return null;
}
