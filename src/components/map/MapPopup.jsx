import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Popup } from "maplibre-gl";

export default function MapPopup({ map, coordinates, hover = false, children }) {
  const [container] = useState(() => document.createElement("div"));
  const [longitude, latitude] = coordinates;
  useEffect(() => {
    const lng = longitude + 360 * Math.round((map.getCenter().lng - longitude) / 360);
    const popup = new Popup({
      anchor: "bottom",
      offset: hover ? 14 : 20,
      maxWidth: hover ? "240px" : "320px",
      closeButton: false,
      closeOnClick: false,
      className: hover ? "ship-map-popup ship-map-hover" : "ship-map-popup",
    }).setLngLat([lng, latitude]).setDOMContent(container).addTo(map);
    return () => popup.remove();
  }, [map, longitude, latitude, hover, container]);
  return createPortal(children, container);
}
