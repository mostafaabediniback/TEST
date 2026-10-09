import { useState } from "react";
import {
  Accessibility,
  Heart,
  Layers,
  Maximize,
  Navigation,
  Play,
  Share2,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";

import { VesselTypeFilter } from "./VesselTypeFilter";

const filterItems = [
  {
    id: "map",
    icon: Layers,
    title: "Map type",
    options: [
      { label: "Light map", value: "light" },
      { label: "Dark map", value: "dark" },
      { label: "Satellite map", value: "satellite" },
      { label: "Nautical charts", value: "nautical", locked: true },
    ],
  },
  {
    id: "favorites",
    icon: Heart,
    title: "Favorites",
    options: [
      { label: "All favorites", value: "all" },
      { label: "My routes", value: "routes" },
      { label: "Saved places", value: "places" },
    ],
  },
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
    id: "weather",
    icon: Wind,
    title: "Weather",
    options: [
      { label: "Wind", value: "wind" },
      { label: "Waves", value: "waves" },
      { label: "Temperature", value: "temperature" },
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
    id: "play",
    icon: Play,
    title: "Playback",
    options: [
      { label: "Start playback", value: "start" },
      { label: "Stop playback", value: "stop" },
    ],
  },
  {
    id: "accessibility",
    icon: Accessibility,
    title: "Accessibility",
    options: [
      { label: "Accessible routes", value: "accessible-routes" },
      { label: "High contrast", value: "high-contrast" },
    ],
  },
  {
    id: "navigation",
    icon: Navigation,
    label: "367K",
    title: "Navigation",
    options: [
      { label: "Start navigation", value: "start-navigation" },
      { label: "Route details", value: "route-details" },
    ],
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
  const popoverSide = isRtl ? "right" : "left";

  const [selectedFilters, setSelectedFilters] = useState({
    map: "light",
    favorites: "all",
    layers: [],
    weather: [],
    share: null,
    play: null,
    accessibility: [],
    navigation: null,
    time: "9m",
    fullscreen: null,
  });

  const handleSelect = (filterId, option) => {
    if (option.locked) return;

    setSelectedFilters((previous) => ({
      ...previous,
      [filterId]: option.value,
    }));

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
        const selectedValue = selectedFilters[item.id];

        return (
          <div key={item.id}>
            {index > 0 && item.id === "fullscreen" && <Separator />}

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t(item.title)}
                    title={t(item.title)}
                    className="relative"
                  />
                }
              >
                {Icon ? (
                  <Icon aria-hidden="true" className="size-5" />
                ) : (
                  <span className="text-xs">{item.label}</span>
                )}

                {item.label && Icon && (
                  <span className="absolute -right-1 -top-1 rounded bg-primary px-1 text-[9px] text-primary-foreground">
                    {item.label}
                  </span>
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
                  {item.options.map((option) => {
                    const isSelected = selectedValue === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        disabled={option.locked}
                        onClick={() => handleSelect(item.id, option)}
                        className="justify-between"
                      >
                        <span>{t(option.label)}</span>
                        {option.locked && (
                          <span className="text-xs opacity-60">Locked</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      })}
    </div>
  );
}
