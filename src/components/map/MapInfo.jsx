import { useMapController } from "@/context/MapControllerContext";
import { useMapInfo } from "@/context/MapInfoContext";

function toDegreesMinutes(
  value,
  positive,
  negative
) {
  if (value == null || !Number.isFinite(value)) return "—";

  const degrees = Math.floor(Math.abs(value));
  const minutes = ((Math.abs(value) - degrees) * 60).toFixed(2);
  const direction = value >= 0 ? positive : negative;

  return `${degrees}° ${minutes} ${direction}`;
}

function MapInfo() {
  const { map } = useMapController();
  const { mapInfo } = useMapInfo();

  const lat = mapInfo.lat;
  const lng = mapInfo.lng;

  const decimalCoordinates =
    lat != null && lng != null
      ? `(${lat.toFixed(6)}, ${lng.toFixed(6)})`
      : "—";

  return (
    <section
      aria-label="Map coordinates and zoom controls"
      className="flex items-center gap-2"
    >
      <div className="rounded-lg bg-[#51585d] px-2.5 py-1.5 text-right text-white shadow-lg">
        <div className="text-xs font-semibold leading-4">
          {toDegreesMinutes(lat, "N", "S")}
        </div>
        <div className="text-xs font-semibold leading-4">
          {toDegreesMinutes(lng, "E", "W")}
        </div>
        <div className="mt-0.5 text-[11px] leading-4 text-white/90">
          {decimalCoordinates}
        </div>
      </div>

      <div className="flex w-8 flex-col overflow-hidden rounded-lg bg-[#51585d] text-white shadow-lg">
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={!map}
          onClick={() => map?.zoomIn()}
          className="h-8 border-b border-white/20 text-lg leading-none hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>

        <span className="flex h-7 items-center justify-center border-b border-white/20 text-xs tabular-nums">
          {mapInfo.z ?? "—"}
        </span>

        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={!map}
          onClick={() => map?.zoomOut()}
          className="h-8 text-lg leading-none hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
      </div>
    </section>
  );
}

export default MapInfo;
