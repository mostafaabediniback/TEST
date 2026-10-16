import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMapController } from "@/context/MapControllerContext";
import { useMapInfo } from "@/context/MapInfoContext";
import { getMapView, lngLatToTile } from "@/lib/map/mapTiles";

export default function MapInstance({ map }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMap, setMapView } = useMapController();
  const { setMapInfo } = useMapInfo();

  useEffect(() => { setMap(map); return () => setMap(null); }, [map, setMap]);
  useEffect(() => {
    let point = null, frame = null;
    function updateInfo() {
      const position = point ? map.unproject(point) : map.getCenter();
      setMapInfo({ lat: position.lat, lng: ((position.lng + 180) % 360 + 360) % 360 - 180, ...lngLatToTile(position.lng, position.lat, Math.floor(map.getZoom())) });
    }
    function onMove(event) {
      point = event.point;
      if (frame === null) frame = requestAnimationFrame(() => { frame = null; updateInfo(); });
    }
    updateInfo();
    map.on("mousemove", onMove);
    map.on("moveend", updateInfo);
    return () => {
      map.off("mousemove", onMove);
      map.off("moveend", updateInfo);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [map, setMapInfo]);

  useEffect(() => {
    function updateView() {
      const { z, x, y } = lngLatToTile(map.getCenter().lng, map.getCenter().lat, Math.floor(map.getZoom()));
      const pathname = "/dashboard/" + z + "/" + x + "/" + y;
      setMapView(getMapView(map, pathname));
      if (pathname !== location.pathname) navigate({ pathname, search: location.search }, { replace: true, state: location.state });
    }
    updateView();
    map.on("moveend", updateView);
    return () => map.off("moveend", updateView);
  }, [map, navigate, location.pathname, location.search, location.state, setMapView]);
  return null;
}
