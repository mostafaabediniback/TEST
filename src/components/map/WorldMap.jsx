// src/components/WorldMap.jsx

import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";

import MapInstance from "./MapInstance";
import MapShipsLayer from "./MapShipsLayer";

const DEFAULT_CENTER = [31.2304, 121.4737];
const DEFAULT_ZOOM = 10;

function tileToLatLng(z, x, y) {
  const tileCount = 2 ** z;

  const longitude = (x / tileCount) * 360 - 180;

  const latitudeRadians = Math.atan(
    Math.sinh(Math.PI - (2 * Math.PI * y) / tileCount),
  );

  const latitude = (latitudeRadians * 180) / Math.PI;

  return [latitude, longitude];
}

export default function WorldMap({ geoData }) {
  const { z, x, y } = useParams();

  const initialMapPosition = useMemo(() => {
    const parsedZoom = Number(z);
    const parsedX = Number(x);
    const parsedY = Number(y);

    const validValues =
      Number.isFinite(parsedZoom) &&
      Number.isFinite(parsedX) &&
      Number.isFinite(parsedY) &&
      parsedZoom >= 0 &&
      parsedX >= 0 &&
      parsedY >= 0;

    if (!validValues) {
      return {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      };
    }

    return {
      center: tileToLatLng(
        parsedZoom,
        parsedX + 0.5,
        parsedY + 0.5,
      ),
      zoom: parsedZoom,
    };
  }, [z, x, y]);

return (
  <div className="absolute inset-0 h-full w-full">
    <MapContainer
      center={initialMapPosition.center}
      zoom={initialMapPosition.zoom}
      minZoom={2}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapInstance />

      {geoData && <GeoJSON data={geoData} />}

      <MapShipsLayer />
    </MapContainer>
  </div>
);

}
