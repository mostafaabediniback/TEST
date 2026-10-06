import { CarFront, LoaderCircle, PanelsTopLeft } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export function MapStats({ stats }) {
  const { t } = useLocale();

  return (
    <div className="pointer-events-none absolute bottom-4 start-4 z-[750] flex items-center gap-2 rounded-xl border bg-background/90 px-3 py-2 text-xs shadow-panel backdrop-blur">
      <span className="inline-flex items-center gap-1.5">
        <CarFront className="size-4" aria-hidden="true" />
        {stats.cars.toLocaleString()} {t("Cars")}
      </span>
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <span className="inline-flex items-center gap-1.5">
        <PanelsTopLeft className="size-4" aria-hidden="true" />
        {stats.tiles} {t("Tiles")}
      </span>
      {stats.fetching > 0 ? (
        <>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <LoaderCircle
            className="size-4 animate-spin"
            aria-label={t("Refreshing map data")}
          />
        </>
      ) : null}
    </div>
  );
}
