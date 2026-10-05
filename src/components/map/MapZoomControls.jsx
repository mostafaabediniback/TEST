import { useEffect, useRef } from "react";
import L from "leaflet";
import { Minus, Plus } from "lucide-react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";

export function MapZoomControls() {
  const map = useMap();
  const { direction, t } = useLocale();
  const controlsRef = useRef(null);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(controlsRef.current);
    L.DomEvent.disableScrollPropagation(controlsRef.current);
  }, []);

  return (
    <div ref={controlsRef} className="absolute bottom-8 end-3 z-[700] flex flex-col overflow-hidden rounded-lg border bg-background shadow-panel" dir={direction}>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="rounded-none"
        onClick={() => map.zoomIn()}
        aria-label={t("Zoom in")}
        title={t("Zoom in")}
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Separator />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="rounded-none"
        onClick={() => map.zoomOut()}
        aria-label={t("Zoom out")}
        title={t("Zoom out")}
      >
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
}
