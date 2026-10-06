import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const STATUS_COLORS = {
  available: "#16a34a",
  busy: "#f59e0b",
  offline: "#64748b",
};

const HIT_RADIUS = 11;

function createPopupContent(car) {
  const wrapper = document.createElement("div");
  wrapper.className = "car-popup";

  const name = document.createElement("strong");
  name.textContent = car.driverName;

  const plate = document.createElement("span");
  plate.textContent = `پلاک: ${car.plate}`;

  const status = document.createElement("span");
  status.textContent = `وضعیت: ${car.status}`;

  wrapper.append(name, plate, status);
  return wrapper;
}

export function CarsCanvasLayer({ cars }) {
  const map = useMap();
  const carsRef = useRef(cars);
  const redrawRef = useRef(() => {});
  const hitPointsRef = useRef([]);

  useEffect(() => {
    carsRef.current = cars;
    redrawRef.current();
  }, [cars]);

  useEffect(() => {
    const paneName = "cars-canvas-pane";
    let pane = map.getPane(paneName);

    if (!pane) {
      pane = map.createPane(paneName);
      pane.style.zIndex = "650";
      pane.style.pointerEvents = "none";
    }

    const canvas = L.DomUtil.create("canvas", "cars-canvas-layer");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    pane.appendChild(canvas);

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let animationFrameId = null;

    const draw = () => {
      animationFrameId = null;

      const size = map.getSize();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvasWidth = Math.round(size.x * dpr);
      const canvasHeight = Math.round(size.y * dpr);

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;
      }

      const topLeft = map.containerPointToLayerPoint(L.point(0, 0));
      L.DomUtil.setPosition(canvas, topLeft);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size.x, size.y);

      const hitPoints = [];
      const groupedCars = {
        available: [],
        busy: [],
        offline: [],
      };

      for (const car of carsRef.current) {
        const layerPoint = map.latLngToLayerPoint([car.lat, car.lng]);
        const x = layerPoint.x - topLeft.x;
        const y = layerPoint.y - topLeft.y;

        if (x < -12 || y < -12 || x > size.x + 12 || y > size.y + 12) {
          continue;
        }

        (groupedCars[car.status] || groupedCars.offline).push({ car, x, y });
        hitPoints.push({ car, x, y });
      }

      context.lineWidth = 1.5;

      for (const [status, points] of Object.entries(groupedCars)) {
        if (!points.length) continue;

        context.beginPath();
        for (const point of points) {
          context.moveTo(point.x + 5.25, point.y);
          context.arc(point.x, point.y, 5.25, 0, Math.PI * 2);
        }

        context.fillStyle = STATUS_COLORS[status] || STATUS_COLORS.offline;
        context.fill();
        context.strokeStyle = "rgba(255,255,255,0.92)";
        context.stroke();
      }

      hitPointsRef.current = hitPoints;
    };

    const scheduleDraw = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    const handleZoomStart = () => {
      canvas.style.visibility = "hidden";
    };

    const handleZoomEnd = () => {
      canvas.style.visibility = "visible";
      scheduleDraw();
    };

    const handleMapClick = (event) => {
      const point = map.latLngToContainerPoint(event.latlng);
      let closest = null;
      let closestDistanceSquared = HIT_RADIUS * HIT_RADIUS;

      for (const item of hitPointsRef.current) {
        const dx = item.x - point.x;
        const dy = item.y - point.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= closestDistanceSquared) {
          closest = item.car;
          closestDistanceSquared = distanceSquared;
        }
      }

      if (!closest) return;

      L.popup({ closeButton: true, offset: [0, -8] })
        .setLatLng([closest.lat, closest.lng])
        .setContent(createPopupContent(closest))
        .openOn(map);
    };

    redrawRef.current = scheduleDraw;

    map.on("moveend", scheduleDraw);
    map.on("resize", scheduleDraw);
    map.on("zoomstart", handleZoomStart);
    map.on("zoomend", handleZoomEnd);
    map.on("click", handleMapClick);

    scheduleDraw();

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      map.off("moveend", scheduleDraw);
      map.off("resize", scheduleDraw);
      map.off("zoomstart", handleZoomStart);
      map.off("zoomend", handleZoomEnd);
      map.off("click", handleMapClick);
      canvas.remove();
    };
  }, [map]);

  return null;
}
