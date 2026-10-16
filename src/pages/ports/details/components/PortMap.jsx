import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

export default function PortMap({ port, onShowOnMap, canShowOnMap }) {
  const { t } = useLocale();
  const hasCoordinates =
    port.lat != null &&
    port.lon != null &&
    Number.isFinite(Number(port.lat)) &&
    Number.isFinite(Number(port.lon));

  if (!hasCoordinates) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500">
        Port location unavailable
      </div>
    );
  }

  const lat = Number(port.lat);
  const lon = Number(port.lon);

  // OpenStreetMap embed centered on the port coordinates.
  const delta = 0.08;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="relative h-72 overflow-hidden rounded-md bg-slate-100">
      <iframe
        title={`Map showing ${port.name ?? "port"}`}
        src={mapUrl}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={onShowOnMap}
        disabled={!canShowOnMap}
        className="absolute end-3 top-3 bg-background/95 shadow-sm"
      >
        <MapPin aria-hidden="true" />
        {t("viewOnMap")}
      </Button>
    </div>
  );
}
