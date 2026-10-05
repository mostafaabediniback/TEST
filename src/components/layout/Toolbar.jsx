import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useFilters } from "@/context/FilterContext";
import { useLocale } from "@/context/LocaleContext";
import { Filter, Layers3, LocateFixed } from "lucide-react";

const statuses = [
  { value: "all", label: "All " },
  { value: "available", label: "Available" },
];

export function Toolbar() {
  const { status, setStatus } = useFilters();
  const { direction, isRtl, t } = useLocale();
  const popoverSide = isRtl ? "right" : "left";

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-background/95 p-1.5 shadow-panel backdrop-blur">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t(" vehicles")}
              title={t("vehicles")}
            />
          }
        >
          <Filter aria-hidden="true" className="size-5" />
        </PopoverTrigger>
        <PopoverContent
          side={popoverSide}
          align="start"
          dir={direction}
          className="w-64 max-w-[calc(100vw-5rem)] space-y-3 text-start"
        >
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
            <Button
              size="icon"
              variant="ghost"
              aria-label={t(" layers")}
              title={t(" layers")}
            />
          }
        >
          <Layers3 aria-hidden="true" className="size-5" />
        </PopoverTrigger>
        <PopoverContent
          side={popoverSide}
          align="start"
          dir={direction}
          className="w-64 max-w-[calc(100vw-5rem)] text-start"
        >
          <PopoverTitle>{t(" layers")}</PopoverTitle>
          <Separator className="mb-2" />
        </PopoverContent>
      </Popover>

      <Separator />

      {/* <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("Recenter ")}
        title={t("Recenter ")}
        onClick={() =>
          window.dispatchEvent(new CustomEvent("recenter"))
        }
      >
        <LocateFixed aria-hidden="true" className="size-5" />
      </Button> */}
    </div>
  );
}
