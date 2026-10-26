import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Popup } from "maplibre-gl";
import { getMapPopupPlacement } from "@/lib/map/mapPopupPlacement";

export default function MapPopup({
  map,
  coordinates,
  hover = false,
  markerRadius = 7,
  children,
}) {
  const [container] = useState(() => document.createElement("div"));
  const [longitude, latitude] = coordinates;
  useEffect(() => {
    const maxWidth = hover ? 240 : 480;
    const lng =
      longitude + 360 * Math.round((map.getCenter().lng - longitude) / 360);
    const popup = new Popup({
      // Position from the top-left corner; the measured offset chooses a side.
      anchor: "top-left",
      maxWidth: `${maxWidth}px`,
      closeButton: false,
      closeOnClick: false,
      className: hover ? "ship-map-popup ship-map-hover" : "ship-map-popup",
    })
      .setLngLat([lng, latitude])
      .setDOMContent(container)
      .addTo(map);
    const element = popup.getElement();
    const content = element.querySelector(".maplibregl-popup-content");
    const mapContainer = map.getContainer();
    const obstacles = [
      ...(mapContainer
        .closest("[data-map-popup-boundary]")
        ?.querySelectorAll("[data-map-popup-obstacle]") ?? []),
    ];
    element.style.setProperty("--ship-popup-width", `${maxWidth}px`);

    function updatePosition() {
      const rect = mapContainer.getBoundingClientRect();
      const padding = 12;
      // Constrain to the visible part of the map, including the browser edges.
      const visibleBounds = {
        left: Math.max(0, -rect.left) + padding,
        top: Math.max(0, -rect.top) + padding,
        right:
          Math.min(mapContainer.clientWidth, window.innerWidth - rect.left) -
          padding,
        bottom:
          Math.min(mapContainer.clientHeight, window.innerHeight - rect.top) -
          padding,
      };
      const bounds = { ...visibleBounds };
      // The search controls float over the map. Reserve their actual height,
      // including room for the popup tip, instead of raising the popup z-index.
      for (const obstacle of obstacles) {
        const obstacleRect = obstacle.getBoundingClientRect();
        if (
          obstacleRect.width > 0 &&
          obstacleRect.height > 0 &&
          obstacleRect.right > rect.left + visibleBounds.left &&
          obstacleRect.left < rect.left + visibleBounds.right &&
          obstacleRect.bottom > rect.top + visibleBounds.top &&
          obstacleRect.top < rect.top + visibleBounds.bottom
        ) {
          bounds.top = Math.max(
            bounds.top,
            obstacleRect.bottom - rect.top + padding + 8,
          );
        }
      }
      const availableWidth = Math.max(0, bounds.right - bounds.left);
      const availableHeight = Math.max(0, bounds.bottom - bounds.top);
      if (!availableWidth || !availableHeight) {
        element.style.visibility = "hidden";
        return;
      }
      popup.setMaxWidth(`${Math.min(maxWidth, availableWidth)}px`);
      content.style.maxHeight = `${hover ? availableHeight : Math.min(600, availableHeight)}px`;
      const point = map.project(popup.getLngLat());
      // A marker near the search bar can still have its popup below the bar.
      element.style.visibility =
        point.x < visibleBounds.left - padding ||
        point.x > visibleBounds.right + padding ||
        point.y < visibleBounds.top - padding ||
        point.y > visibleBounds.bottom + padding
          ? "hidden"
          : "";
      const placement = getMapPopupPlacement(
        point,
        {
          width: element.offsetWidth,
          height: element.offsetHeight,
        },
        bounds,
        markerRadius + (hover ? 7 : 13),
      );
      element.dataset.side = placement.side;
      element.style.setProperty("--ship-popup-tip-x", `${placement.tipX}px`);
      element.style.setProperty("--ship-popup-tip-y", `${placement.tipY}px`);
      popup.setOffset(placement.offset);
    }

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(container);
    resizeObserver.observe(mapContainer);
    obstacles.forEach((obstacle) => resizeObserver.observe(obstacle));
    map.on("move", updatePosition);
    map.on("resize", updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    updatePosition();
    return () => {
      resizeObserver.disconnect();
      map.off("move", updatePosition);
      map.off("resize", updatePosition);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      popup.remove();
    };
  }, [map, longitude, latitude, hover, markerRadius, container]);
  return createPortal(children, container);
}
