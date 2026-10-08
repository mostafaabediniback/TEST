import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMap } from "react-leaflet";

import { useMapController } from "@/context/MapControllerContext";
import { useMapInfo } from "@/context/MapInfoContext";

export default function MapInstance() {
  const map = useMap();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { setMap } = useMapController();
  const { setMapInfo } = useMapInfo();

  useEffect(() => {
    setMap(map);

    return () => {
      setMap(null);
    };
  }, [map, setMap]);

  useEffect(() => {
    function updateMapInfo() {
      const center = map.getCenter();
      const zoom = map.getZoom();

      const z = Math.floor(zoom);
      const tileSize = 256;
      const scale = tileSize * 2 ** z;

      const latitudeRadians =
        (center.lat * Math.PI) / 180;

      const xPixel =
        ((center.lng + 180) / 360) * scale;

      const yPixel =
        ((1 -
          Math.log(
            Math.tan(latitudeRadians) +
              1 / Math.cos(latitudeRadians),
          ) /
            Math.PI) /
          2) *
        scale;

      const x = Math.floor(xPixel / tileSize);
      const y = Math.floor(yPixel / tileSize);

      setMapInfo({
        lat: center.lat,
        lng: center.lng,
        z,
        x,
        y,
      });

      if (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/")
      ) {
        const nextPath = `/dashboard/${z}/${x}/${y}`;

        // Avoid unnecessary history/navigation updates.
        if (window.location.pathname !== nextPath) {
          navigate(nextPath, {
            replace: true,
          });
        }
      }
    }

    // This updates the context but does not need to navigate immediately.
    updateMapInfo();

    map.on("moveend", updateMapInfo);
    map.on("zoomend", updateMapInfo);

    return () => {
      map.off("moveend", updateMapInfo);
      map.off("zoomend", updateMapInfo);
    };
  }, [
    map,
    navigate,
    pathname,
    setMapInfo,
  ]);

  return null;
}
