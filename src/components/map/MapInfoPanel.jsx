import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";

export function MapInfoPanel({ viewport, count, isFetching }) {
  const { direction, t, formatNumber } = useLocale();
  const coordinateOptions = { minimumFractionDigits: 5, maximumFractionDigits: 5, useGrouping: false };

  return (
    <Card className="map-card absolute bottom-8 end-16 z-[700] w-[220px] gap-0 py-0 shadow-panel" dir={direction}>
      <CardContent className="p-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">{t("Latitude")}</dt>
          <dd className="m-0 text-end font-medium tabular-nums"><bdi dir="ltr">{formatNumber(viewport.lat, coordinateOptions)}</bdi></dd>
          <dt className="text-muted-foreground">{t("Longitude")}</dt>
          <dd className="m-0 text-end font-medium tabular-nums"><bdi dir="ltr">{formatNumber(viewport.lng, coordinateOptions)}</bdi></dd>
          <dt className="text-muted-foreground">{t("Tile (z/x/y)")}</dt>
          <dd className="m-0 text-end font-medium tabular-nums">
            <bdi dir="ltr">{[viewport.z, viewport.x, viewport.y].map((value) => formatNumber(value, { useGrouping: false })).join(" / ")}</bdi>
          </dd>
        </dl>
        <Separator className="my-2" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground" role="status" aria-live="polite" aria-atomic="true">
          {isFetching ? <LoaderCircle className="size-3 animate-spin" aria-hidden="true" /> : null}
          {isFetching ? t("Updating…") : t(count === 1 ? "{count} car found" : "{count} cars found", { count: formatNumber(count) })}
        </div>
      </CardContent>
    </Card>
  );
}
