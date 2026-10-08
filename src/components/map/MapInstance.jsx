import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMap } from "react-leaflet";

import { useMapController } from "@/context/MapControllerContext";
import { useMapInfo } from "@/context/MapInfoContext";

function getMapInfo(map, position) {
  const z = Math.floor(map.getZoom());
  const tileCount = 2 ** z;
  const point = map.project(position, z);
  const tileX = Math.floor(point.x / 256);
  const tileY = Math.floor(point.y / 256);
  const latLng = map.wrapLatLng(position);

  return {
    lat: latLng.lat,
    lng: latLng.lng,
    x: ((tileX % tileCount) + tileCount) % tileCount,
    y: Math.max(0, Math.min(tileCount - 1, tileY)),
    z,
  };
}

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
    let pointerPoint = null;
    let animationFrame = null;

    function updateMapInfo() {
      const position = pointerPoint
        ? map.containerPointToLatLng(pointerPoint)
        : map.getCenter();

      setMapInfo(getMapInfo(map, position));
    }

    function handleMouseMove(event) {
      pointerPoint = event.containerPoint;

      // Publish the latest pointer position at most once per frame.
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = null;
          updateMapInfo();
        });
      }
    }

    updateMapInfo();
    map.on("mousemove", handleMouseMove);
    map.on("moveend", updateMapInfo);
    map.on("zoomend", updateMapInfo);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("moveend", updateMapInfo);
      map.off("zoomend", updateMapInfo);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [map, setMapInfo]);

  useEffect(() => {
    function updateMapPath() {
      if (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/")
      ) {
        // The route follows the viewport center, independently of the pointer.
        const { z, x, y } = getMapInfo(map, map.getCenter());
        const nextPath = `/dashboard/${z}/${x}/${y}`;

        if (window.location.pathname !== nextPath) {
          navigate(nextPath, { replace: true });
        }
      }
    }

    updateMapPath();
    map.on("moveend", updateMapPath);
    map.on("zoomend", updateMapPath);

    return () => {
      map.off("moveend", updateMapPath);
      map.off("zoomend", updateMapPath);
    };
  }, [map, navigate, pathname]);

  return null;
}
