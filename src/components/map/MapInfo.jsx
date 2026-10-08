import { useMapController } from "@/context/MapControllerContext";
import { useMapInfo } from "@/context/MapInfoContext";

function MapInfo() {
  const { map } = useMapController();
  const { mapInfo } = useMapInfo();

  const items = [
    { label: "Lat", value: mapInfo.lat?.toFixed(6) },
    { label: "Lng", value: mapInfo.lng?.toFixed(6) },
    { label: "X", value: mapInfo.x?.toFixed(0) },
    { label: "Y", value: mapInfo.y?.toFixed(0) },
    { label: "Zoom", value: mapInfo.z },
  ];

  return (
    <section
      aria-label="Map coordinates and zoom controls"
      className="w-40 overflow-hidden rounded-xl border border-border/80 bg-background/95 text-foreground shadow-lg shadow-black/10 backdrop-blur-md"
    >
<dl className="space-y-1.5 px-3 py-2.5">
  {items.map(({ label, value }) => (
    <div key={label} className="flex items-center justify-between gap-3">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[11px] font-medium tabular-nums">
        {value ?? "—"}
      </dd>
    </div>
  ))}
</dl>

<div className="flex items-center border-t border-border/70">
  <button
    type="button"
    aria-label="Zoom in"
    title="Zoom in"
    disabled={!map}
    onClick={() => map?.zoomIn()}
    className="flex h-9 flex-1 items-center justify-center text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
  >
    +
  </button>

  <span className="px-2 text-[10px] font-medium text-muted-foreground">
    {mapInfo.z != null ? `z ${mapInfo.z}` : "—"}
  </span>

  <button
    type="button"
    aria-label="Zoom out"
    title="Zoom out"
    disabled={!map}
    onClick={() => map?.zoomOut()}
    className="flex h-9 flex-1 items-center justify-center text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
  >
    −
  </button>
</div>

    </section>
  );
}

export default MapInfo;
