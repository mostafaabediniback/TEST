import { Layers, Maximize, Navigation, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";
import { useShipTotalCount } from "@/hooks/useShipTotalCount";

import { VesselTypeFilter } from "./VesselTypeFilter";

const filterItems = [
  {
    id: "layers",
    icon: Layers,
    title: "Layers",
    options: [
      { label: "Roads", value: "roads" },
      { label: "Buildings", value: "buildings" },
      { label: "Places", value: "places" },
    ],
  },
  {
    id: "share",
    icon: Share2,
    title: "Share",
    options: [
      { label: "Share map", value: "share-map" },
      { label: "Copy link", value: "copy-link" },
    ],
  },
  {
    id: "navigation",
    icon: Navigation,
    title: "Navigation",
  },
  {
    id: "time",
    label: "9m",
    title: "Time",
    options: [
      { label: "9 minutes", value: "9m" },
      { label: "30 minutes", value: "30m" },
      { label: "1 hour", value: "1h" },
    ],
  },
  {
    id: "fullscreen",
    icon: Maximize,
    title: "Display",
    options: [
      { label: "Fullscreen", value: "fullscreen" },
      { label: "Reset view", value: "reset" },
    ],
  },
];

export function Toolbar() {
  const { direction, isRtl, t } = useLocale();
  const { data: totalCount } = useShipTotalCount();
  const popoverSide = isRtl ? "right" : "left";

  const handleSelect = (filterId, option) => {
    if (option.locked) return;

    if (option.value === "copy-link") {
      navigator.clipboard.writeText(window.location.href);
    }

    if (option.value === "fullscreen") {
      document.documentElement.requestFullscreen?.();
    }

    if (option.value === "reset") {
      window.dispatchEvent(new CustomEvent("reset-map"));
    }
  };

  return (
    <div className="flex w-fit flex-col gap-1 rounded-xl border bg-background/95 p-1.5 shadow-panel backdrop-blur">
      <VesselTypeFilter />
      <Separator />

      {filterItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <div key={item.id}>
            {index > 0 && item.id === "fullscreen" && <Separator />}

            {item.id === "navigation" ? (
<Button
  type="button"
  size="icon"
  variant="ghost"
  aria-label={t(item.title)}
  title={t(item.title)}
  className="relative flex flex-col items-center justify-center gap-0 overflow-visible"
>
  <Icon aria-hidden="true" className="size-4" />

  {totalCount != null && (
    <span className="min-w-8 rounded-sm bg-primary px-1 text-center text-[9px] font-semibold leading-4 text-primary-foreground">
      {new Intl.NumberFormat().format(totalCount)}
    </span>
  )}
</Button>
            ) : (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t(item.title)}
                      title={t(item.title)}
                    />
                  }
                >
                  {Icon ? (
                    <Icon aria-hidden="true" className="size-5" />
                  ) : (
                    <span className="text-xs">{item.label}</span>
                  )}
                </PopoverTrigger>

                <PopoverContent
                  side={popoverSide}
                  align="start"
                  dir={direction}
                  className="w-64 max-w-[calc(100vw-5rem)] space-y-3 text-start"
                >
                  <PopoverTitle>{t(item.title)}</PopoverTitle>

                  <div className="grid gap-2">
                    {item.options.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={option.locked}
                        onClick={() => handleSelect(item.id, option)}
                        className="justify-between"
                      >
                        <span>{t(option.label)}</span>
                        {option.locked && (
                          <span className="text-xs opacity-60">Locked</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      })}
    </div>
  );
}