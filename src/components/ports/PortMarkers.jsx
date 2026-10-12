import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Anchor, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getPortCoordinates, getPortKey } from "@/lib/portMarkers";
import { getMapMarkerScale } from "@/lib/mapMarkerScale";
import { useMapZoom } from "@/hooks/useMapZoom";
import anchorIcon from "@/assets/port-anchor.svg";
import MapPopup from "../map/MapPopup";
import ShipRow from "../ships/ShipRow";

const PORT_ICON = { url: anchorIcon, width: 64, height: 64, anchorX: 32, anchorY: 32, mask: false };

export default function PortMarkers({ ports = [], map, layerManager }) {
  const { t, direction } = useLocale();
  const zoom = useMapZoom(map);
  const iconSize = 30 * getMapMarkerScale(zoom);
  const iconRadius = iconSize / 2;
  const selectionRadius = iconRadius + 4;
  const [search, setSearch] = useSearchParams();
  const selectedId = search.get("portId");
  const [selectedPort, setSelectedPort] = useState(null);
  const [hoveredPort, setHoveredPort] = useState(null);
  const selected = selectedId === null ? null : ports.find((port) => getPortKey(port) === selectedId)
    ?? (selectedPort && getPortKey(selectedPort) === selectedId ? selectedPort : null);
  const selectedCoordinates = getPortCoordinates(selected);
  const markers = useMemo(() => ports.map((port) => ({ port, coordinates: getPortCoordinates(port) }))
    .filter((marker) => marker.coordinates), [ports]);

  const closeSelection = useCallback(() => {
    setSearch((current) => {
      const next = new URLSearchParams(current);
      next.delete("portId");
      return next;
    }, { replace: true });
    setSelectedPort(null);
    setHoveredPort(null);
  }, [setSearch]);

  useEffect(() => {
    layerManager.setGroup("ports", {
      order: 10,
      onEmptyClick: () => { setSelectedPort(null); setHoveredPort(null); },
      onHover: ({ object }) => setHoveredPort(object?.port ?? null),
      layers: [
        new ScatterplotLayer({
          id: "selected-port-ring",
          data: selected ? [{ coordinates: getPortCoordinates(selected) }] : [],
          getPosition: (marker) => marker.coordinates,
          radiusUnits: "pixels",
          getRadius: selectionRadius,
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
          getSize: iconSize,
          sizeUnits: "pixels",
          billboard: true,
          pickable: true,
          onClick: ({ object }) => {
            if (!object?.port) return;
            const port = object.port;
            const id = getPortKey(port);
            if (id === selectedId) {
              closeSelection();
              return true;
            }
            setSelectedPort(port);
            setHoveredPort(null);
            setSearch((current) => {
              const next = new URLSearchParams(current);
              next.set("portId", id);
              return next;
            }, { replace: true });
            return true;
          },
        }),
      ],
    });
  }, [markers, selected, selectedId, layerManager, setSearch, closeSelection, iconSize, selectionRadius]);
  useEffect(() => () => layerManager.removeGroup("ports"), [layerManager]);
  const hoverCoordinates = getPortCoordinates(hoveredPort);
  return <>
    {hoverCoordinates && getPortKey(hoveredPort) !== selectedId && <MapPopup map={map} coordinates={hoverCoordinates} markerRadius={iconRadius} hover>
      <div dir={direction} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-teal-800">
        <Anchor size={16} />{hoveredPort.name || t("unnamedPort")}
      </div>
    </MapPopup>}
    {selected && selectedCoordinates && <MapPopup map={map} coordinates={selectedCoordinates} markerRadius={selectionRadius}>
      <div dir={direction} className="relative min-w-[230px] p-3 text-slate-800">
        <button type="button" aria-label={t("closePortSelection")} onClick={closeSelection} className="absolute end-2 top-2 rounded-full p-1 text-slate-600 hover:bg-slate-100"><X size={16} /></button>
        <h3 className="mb-3 flex items-center gap-2 pe-6 text-sm font-semibold"><Anchor size={18} className="text-teal-700" />{selected.name || t("unnamedPort")}</h3>
        <ShipRow label={t("country")} value={selected.country_name ?? selected.country} />
        <ShipRow label={t("unloCode")} value={selected.unlo_code ?? selected.unlocode} />
        <ShipRow label={t("latitude")} value={selectedCoordinates[1].toFixed(5)} />
        <ShipRow label={t("longitude")} value={selectedCoordinates[0].toFixed(5)} />
      </div>
    </MapPopup>}
  </>;
}
