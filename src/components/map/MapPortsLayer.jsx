import { useLocale } from "@/context/LocaleContext";
import { usePortsInVisibleTiles } from "@/hooks/usePortsInTiles";
import PortMarkers from "../ports/PortMarkers";

export default function MapPortsLayer({ map, layerManager }) {
  const { t } = useLocale();
  const { ports, isPending, isError } = usePortsInVisibleTiles({ map });
  return <>
    <div role="status" className="pointer-events-none absolute left-4 top-16 z-[1000] space-y-2 text-sm">
      {isPending && <p className="rounded bg-white px-3 py-2 shadow">{t("loadingPorts")}</p>}
      {isError && <p className="rounded bg-white px-3 py-2 text-amber-700 shadow">{t("loadPortsError")}</p>}
    </div>
    <PortMarkers ports={ports} map={map} layerManager={layerManager} />
  </>;
}
