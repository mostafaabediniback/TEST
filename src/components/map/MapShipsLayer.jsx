import { useShipsInVisibleTiles } from "@/hooks/useShipsInTiles";
import { useLocale } from "@/context/LocaleContext";
import ShipMarkers from "../ships/ShipMarkers";

export default function MapShipsLayer({ map, layerManager }) {
  const { t } = useLocale();
  const { ships, isPending, isError } = useShipsInVisibleTiles({ map });
  return (
    <>
      <div
        role="status"
        className="pointer-events-none absolute left-4 top-4 z-[1000] space-y-2 text-sm"
      >
        {isPending && (
          <p className="rounded bg-white px-3 py-2 shadow">
            {t("loadingShips")}
          </p>
        )}
        {isError && (
          <p className="rounded bg-white px-3 py-2 text-amber-700 shadow">
            {t("loadShipsError")}
          </p>
        )}
      </div>
      <ShipMarkers ships={ships} map={map} layerManager={layerManager} />
    </>
  );
}
