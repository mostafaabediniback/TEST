import { Filter, Layers3, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { MapLayerControls } from "@/components/layout/SettingsPanel";
import { useCarFilters } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";

const statuses = [
  { value: "all", label: "All vehicles" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "offline", label: "Offline" },
];

export function MapToolbar() {
  const { status, setStatus } = useCarFilters();
  const { direction, isRtl, t } = useLocale();
  const popoverSide = isRtl ? "right" : "left";

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-background/95 p-1.5 shadow-panel backdrop-blur">
      <Popover>
        <PopoverTrigger
          render={
            <Button size="icon" variant="ghost" aria-label={t("Filter vehicles")} title={t("Filter vehicles")} />
          }
        >
          <Filter aria-hidden="true" className="size-5" />
        </PopoverTrigger>
        <PopoverContent side={popoverSide} align="start" dir={direction} className="w-64 max-w-[calc(100vw-5rem)] space-y-3 text-start">
          <PopoverTitle>{t("Status filter")}</PopoverTitle>
          <div className="grid grid-cols-2 gap-2">
            {statuses.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={status === item.value ? "default" : "outline"}
                onClick={() => setStatus(item.value)}
                aria-pressed={status === item.value}
                className="justify-center"
              >
                {t(item.label)}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger
          render={
            <Button size="icon" variant="ghost" aria-label={t("Map layers")} title={t("Map layers")} />
          }
        >
          <Layers3 aria-hidden="true" className="size-5" />
        </PopoverTrigger>
        <PopoverContent side={popoverSide} align="start" dir={direction} className="w-64 max-w-[calc(100vw-5rem)] text-start">
          <PopoverTitle>{t("Map layers")}</PopoverTitle>
          <Separator className="mb-2" />
          <MapLayerControls />
        </PopoverContent>
      </Popover>

      <Separator />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("Recenter map")}
        title={t("Recenter map")}
        onClick={() => window.dispatchEvent(new CustomEvent("car-map:recenter"))}
      >
        <LocateFixed aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}
