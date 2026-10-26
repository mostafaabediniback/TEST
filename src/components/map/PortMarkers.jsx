import { formatTimestamp } from "@/lib/dateTime";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Anchor, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import anchorIcon from "@/assets/port-anchor.svg";
import MapPopup from "./MapPopup";
import { useMapController } from "@/context/MapControllerContext";
import { usePortDetails } from "@/hooks/usePortDetails";
import {
  clearMapSelection,
  getMapSelectionCoordinates,
  getMapSelectionSearch,
} from "@/lib/map/mapSelection";
import { getPortCoordinates, getPortKey } from "@/lib/map/portMarkers";

const PORT_ICON = {
  url: anchorIcon,
  width: 64,
  height: 64,
  anchorX: 32,
  anchorY: 32,
  mask: false,
};

export default function PortMarkers({ ports = [], map, layerManager }) {
  const navigate = useNavigate();
  const { t, direction } = useLocale();
  const [search, setSearch] = useSearchParams();
  const selectedId = search.get("portId");

  const { selectedPort, setSelectedPort } = useMapController();
  const portQuery = usePortDetails(selectedId, {
    enabled: selectedId !== null,
  });
  const [hoveredPort, setHoveredPort] = useState(null);

  const subscribeToZoom = useCallback(
    (onChange) => {
      if (!map) return () => {};
      map.on("zoom", onChange);
      return () => map.off("zoom", onChange);
    },
    [map],
  );

  const getZoomSnapshot = useCallback(() => (map ? map.getZoom() : 5), [map]);

  const zoom = useSyncExternalStore(
    subscribeToZoom,
    getZoomSnapshot,
    getZoomSnapshot,
  );

  // Small at low zoom, slightly larger at high zoom; clamped to 12–28 px.
  const portIconSize = Math.max(12, Math.min(28, 10 + (zoom - 2) * 2));

  const selected = useMemo(() => {
    if (selectedId === null) return null;

    const seed =
      ports.find((port) => getPortKey(port) === selectedId) ??
      (selectedPort && getPortKey(selectedPort) === selectedId
        ? selectedPort
        : null);
    const details = portQuery.data?.body ?? portQuery.data;
    const matchingDetails =
      details &&
      typeof details === "object" &&
      !Array.isArray(details) &&
      (details.id == null || String(details.id) === selectedId)
        ? details
        : {};
    return { ...(seed ?? { id: selectedId }), ...matchingDetails };
  }, [ports, selectedId, selectedPort, portQuery.data]);

  const selectedCoordinates = useMemo(
    () => getPortCoordinates(selected) ?? getMapSelectionCoordinates(search),
    [selected, search],
  );

  const markers = useMemo(() => {
    const visiblePorts = [...ports];
    if (
      selected &&
      selectedCoordinates &&
      !visiblePorts.some((port) => getPortKey(port) === selectedId)
    ) {
      visiblePorts.push({
        ...selected,
        lon: selectedCoordinates[0],
        lat: selectedCoordinates[1],
      });
    }
    return visiblePorts
      .map((port) => ({
        port,
        coordinates: getPortCoordinates(port),
      }))
      .filter((marker) => marker.coordinates);
  }, [ports, selected, selectedId, selectedCoordinates]);

  const closeSelection = useCallback(() => {
    setSearch((current) => clearMapSelection(current), { replace: true });

    setSelectedPort(null);
    setHoveredPort(null);
  }, [setSearch, setSelectedPort]);

  useEffect(() => {
    layerManager.setGroup("ports", {
      order: 10,

      onEmptyClick: () => {
        setSelectedPort(null);
        setHoveredPort(null);
        setSearch(
          (current) => {
            if (!current.has("portId")) return current;
            return clearMapSelection(current);
          },
          { replace: true },
        );
      },

      onHover: ({ object }) => {
        setHoveredPort(object?.port ?? null);
      },

      layers: [
        new ScatterplotLayer({
          id: "selected-port-ring",
          data:
            selected && selectedCoordinates
              ? [{ coordinates: selectedCoordinates }]
              : [],
          getPosition: (marker) => marker.coordinates,
          radiusUnits: "pixels",
          getRadius: 19,
          filled: false,
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 3,
          getLineColor: [15, 118, 110, 255],
          pickable: false,
        }),

        new IconLayer({
          id: "port-markers",
          data: markers,
          getPosition: (marker) => marker.coordinates,
          getIcon: () => PORT_ICON,
          getSize: portIconSize,
          sizeUnits: "pixels",
          billboard: true,
          pickable: true,

          onClick: ({ object }) => {
            if (!object?.port) return false;

            const port = object.port;
            const id = getPortKey(port);

            if (id === selectedId) {
              closeSelection();
              return true;
            }

            setSelectedPort(port);
            setHoveredPort(null);

            setSearch(
              (current) =>
                getMapSelectionSearch(
                  "port",
                  id,
                  getPortCoordinates(port),
                  current,
                ),
              { replace: true },
            );

            return true;
          },
        }),
      ],
    });
  }, [
    markers,
    selected,
    selectedCoordinates,
    selectedId,
    layerManager,
    setSearch,
    closeSelection,
    setSelectedPort,
    portIconSize,
  ]);

  useEffect(() => () => layerManager.removeGroup("ports"), [layerManager]);

  const hoverCoordinates = getPortCoordinates(hoveredPort);

  return (
    <>
      {hoverCoordinates && getPortKey(hoveredPort) !== selectedId && (
        <MapPopup
          map={map}
          coordinates={hoverCoordinates}
          markerRadius={portIconSize / 2}
          hover
        >
          <div
            dir={direction}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-teal-800"
          >
            <Anchor size={16} />
            {hoveredPort.name || t("unnamedPort")}
          </div>
        </MapPopup>
      )}

      {selected && selectedCoordinates && (
        <MapPopup
          map={map}
          coordinates={selectedCoordinates}
          markerRadius={portIconSize / 2}
        >
          <div dir={direction} className="relative p-3 text-slate-800">
            <button
              type="button"
              aria-label={t("closePortSelection")}
              onClick={closeSelection}
              className="absolute end-2 top-2 z-10 rounded-full p-1 text-slate-600 hover:bg-white/70"
            >
              <X size={16} />
            </button>

            <PortPreview
              port={selected}
              onDetailsClick={
                selected.id != null
                  ? () => {
                      setSelectedPort(selected);
                      navigate("/ports/" + encodeURIComponent(selected.id));
                    }
                  : undefined
              }
            />
            {portQuery.isError && (
              <p role="status" className="mt-2 text-xs text-amber-700">
                {t("partialPortData")}
              </p>
            )}
          </div>
        </MapPopup>
      )}
    </>
  );
}
// Port content is kept here; its visual layout follows the ship popup.
function PortPreview({ port, onDetailsClick }) {
  const { locale, t, formatNumber } = useLocale();
  const [now, setNow] = useState(() => Date.now());
  const [failedImage, setFailedImage] = useState(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const name = port.name || t("unnamedPort");
  const country =
    (typeof port.country === "object" ? port.country?.name : port.country) ??
    port.country_name ??
    port.countryName;
  const photo =
    port.main_image ??
    port.mainImage ??
    port.gallery_url ??
    port.galleryUrl ??
    port.image_url ??
    port.imageUrl;
  const imageUrl = typeof photo === "string" && photo.trim() ? photo : null;
  const timezone = port.timezone ?? port.timeZone;
  let localTime = formatTimestamp(port.local_time ?? port.localTime, { unit: "auto" });
  if (timezone) {
    try {
      localTime = formatTimestamp(now, {
        unit: "milliseconds",
        locale,
        timeZone: timezone,
        options: { dateStyle: "short", timeStyle: "short" },
      });
    } catch {
      // Keep the reported local time for unsupported server time-zone names.
    }
  }
  function formatCount(value) {
    if (Array.isArray(value)) return formatNumber(value.length);
    if (
      value == null ||
      typeof value === "boolean" ||
      String(value).trim() === ""
    )
      return "—";
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? formatNumber(count) : "—";
  }
  const activity = [
    [t("shipsInPort"), port.ships_in_port ?? port.shipsInPort],
    [t("expectedArrivals"), port.expected_arrivals ?? port.expectedArrivals],
    [t("recentPortCalls"), port.recent_port_calls ?? port.recentPortCalls],
  ];
  return (
    <article className="map-popup-preview w-full font-sans">
      {imageUrl && imageUrl !== failedImage ? (
        <div className="relative h-36 overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={name}
            onError={() => setFailedImage(imageUrl)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-white">
            <h2 className="text-lg font-bold">{name}</h2>
            <p className="text-xs">
              {port.type || t("port")}
              {country ? " · " + country : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 pe-7">
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-xs">
            {port.type || t("port")}
            {country ? " · " + country : ""}
          </p>
        </div>
      )}
      <div className="my-3 grid grid-cols-2 divide-x rounded-md border text-xs rtl:divide-x-reverse">
        <div className="min-w-0 p-2">
          <p className="text-slate-500">{t("unloCode")}</p>
          <p className="break-words font-semibold">
            {port.unlo_code ?? port.unlocode ?? "—"}
          </p>
        </div>
        <div className="min-w-0 p-2">
          <p className="text-slate-500">{t("timezone")}</p>
          <p className="break-words font-semibold">{timezone ?? "—"}</p>
        </div>
      </div>
      {onDetailsClick && (
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={onDetailsClick}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t("viewDetails")}
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 divide-x rounded-md border text-xs rtl:divide-x-reverse">
        {activity.map(([label, value]) => (
          <div key={label} className="min-w-0 p-2">
            <p className="text-slate-500">{label}</p>
            <p className="font-semibold">{formatCount(value)}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t pt-2 text-xs text-slate-500">
        {t("localTime")}: {String(localTime)}
      </div>
    </article>
  );
}

