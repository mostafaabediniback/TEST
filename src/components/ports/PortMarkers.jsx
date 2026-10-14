import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useSearchParams } from "react-router-dom";
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Anchor, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import anchorIcon from "@/assets/port-anchor.svg";
import MapPopup from "../map/MapPopup";
import ShipRow from "../ships/ShipRow";
import { getPortCoordinates, getPortKey } from "@/lib/portMarkers";

const PORT_ICON = {
  url: anchorIcon,
  width: 64,
  height: 64,
  anchorX: 32,
  anchorY: 32,
  mask: false,
};

export default function PortMarkers({ ports = [], map, layerManager }) {
  const { t, direction } = useLocale();
  const [search, setSearch] = useSearchParams();
  const selectedId = search.get("portId");

  const [selectedPort, setSelectedPort] = useState(null);
  const [hoveredPort, setHoveredPort] = useState(null);

  const subscribeToZoom = useCallback(
    (onChange) => {
      if (!map) return () => {};
      map.on("zoom", onChange);
      return () => map.off("zoom", onChange);
    },
    [map],
  );

  const getZoomSnapshot = useCallback(
    () => (map ? map.getZoom() : 5),
    [map],
  );

  const zoom = useSyncExternalStore(
    subscribeToZoom,
    getZoomSnapshot,
    getZoomSnapshot,
  );

  // Small at low zoom, larger at high zoom; clamped to 16–40 px.
  const portIconSize = Math.max(16, Math.min(40, 12 + (zoom - 2) * 3));

  const selected = useMemo(() => {
    if (selectedId === null) return null;

    return (
      ports.find((port) => getPortKey(port) === selectedId) ??
      (selectedPort && getPortKey(selectedPort) === selectedId
        ? selectedPort
        : null)
    );
  }, [ports, selectedId, selectedPort]);

  const selectedCoordinates = getPortCoordinates(selected);

  const markers = useMemo(
    () =>
      ports
        .map((port) => ({
          port,
          coordinates: getPortCoordinates(port),
        }))
        .filter((marker) => marker.coordinates),
    [ports],
  );

  const closeSelection = useCallback(() => {
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("portId");
        return next;
      },
      { replace: true },
    );

    setSelectedPort(null);
    setHoveredPort(null);
  }, [setSearch]);

  useEffect(() => {
    layerManager.setGroup("ports", {
      order: 10,

      onEmptyClick: () => {
        setSelectedPort(null);
        setHoveredPort(null);
        setSearch(
          (current) => {
            if (!current.has("portId")) return current;
            const next = new URLSearchParams(current);
            next.delete("portId");
            return next;
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
              (current) => {
                const next = new URLSearchParams(current);
                next.set("portId", id);
                next.delete("shipId");
                return next;
              },
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
    portIconSize,
  ]);

  useEffect(
    () => () => layerManager.removeGroup("ports"),
    [layerManager],
  );

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
          <div
            dir={direction}
            className="relative min-w-[230px] p-3 text-slate-800"
          >
            <button
              type="button"
              aria-label={t("closePortSelection")}
              onClick={closeSelection}
              className="absolute end-2 top-2 rounded-full p-1 text-slate-600 hover:bg-slate-100"
            >
              <X size={16} />
            </button>

            <h3 className="mb-3 flex items-center gap-2 pe-6 text-sm font-semibold">
              <Anchor size={18} className="text-teal-700" />
              {selected.name || t("unnamedPort")}
            </h3>

            <ShipRow
              label={t("country")}
              value={selected.country_name ?? selected.country}
            />
            <ShipRow
              label={t("unloCode")}
              value={selected.unlo_code ?? selected.unlocode}
            />
            <ShipRow
              label={t("latitude")}
              value={selectedCoordinates[1].toFixed(5)}
            />
            <ShipRow
              label={t("longitude")}
              value={selectedCoordinates[0].toFixed(5)}
            />
          </div>
        </MapPopup>
      )}
    </>
  );
}