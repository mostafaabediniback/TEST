import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { useLocale } from "@/context/LocaleContext";

const statuses = new Set(["available", "busy", "offline"]);

function carIcon(status) {
  const safeStatus = statuses.has(status) ? status : "offline";
  return L.divIcon({
    className: "car-marker-shell",
    html: `<div class="car-marker car-marker--${safeStatus}" aria-hidden="true">🚗</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function CarMarker({ car, isSelected, drawerId, onCarSelect }) {
  const markerRef = useRef(null);
  const { t, formatNumber } = useLocale();
  const icon = useMemo(() => carIcon(car.status), [car.status]);
  const displayId = typeof car.id === "number" ? formatNumber(car.id, { useGrouping: false }) : String(car.id ?? "");
  const label = t("Car {id}: {driver}", { id: displayId, driver: car.driverName });

  useEffect(() => {
    // Leaflet manages marker DOM outside React; update its accessible labels too.
    const element = markerRef.current?.getElement();
    element?.setAttribute("title", label);
    element?.setAttribute("aria-label", label);
    element?.setAttribute("aria-haspopup", "dialog");
    element?.setAttribute("aria-expanded", String(isSelected));
    element?.setAttribute("aria-controls", drawerId);
  }, [icon, label, isSelected, drawerId]);

  const eventHandlers = useMemo(() => {
    const selectCar = () => onCarSelect(car, markerRef.current?.getElement());
    return {
      click: selectCar,
      keydown(event) {
        const { key, repeat } = event.originalEvent;
        if (!repeat && (key === "Enter" || key === " ")) {
          L.DomEvent.stop(event.originalEvent);
          selectCar();
        }
      },
    };
  }, [car, onCarSelect]);

  return (
    <Marker
      ref={markerRef}
      position={[car.lat, car.lng]}
      icon={icon}
      title={label}
      alt={label}
      eventHandlers={eventHandlers}
    />
  );
}

export function CarMarkers({ cars, selectedCarId, drawerId, onCarSelect }) {
  return cars.map((car) => (
    <CarMarker key={car.id} car={car} isSelected={selectedCarId === String(car.id)} drawerId={drawerId} onCarSelect={onCarSelect} />
  ));
}
