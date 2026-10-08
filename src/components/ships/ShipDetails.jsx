import ShipRow from "./ShipRow";
import { getShipCoordinates } from "@/lib/shipNavigation";

export default function ShipDetails({
  ship,
  photo,
  position,
  voyage,
  port,
  compact = false,
  isLoading = false,
  onDetailsClick,
  detailsLabel = "View details",
}) {
  const coordinates = getShipCoordinates(position) ?? getShipCoordinates(ship);
  const lat = coordinates?.[1];
  const lon = coordinates?.[0];

  const imageUrl =
    photo?.url ??
    photo?.photo_url ??
    photo?.image_url;

  return (
    <div
      className={`font-sans text-slate-800 ${
        compact ? "min-w-[200px]" : "min-w-[280px]"
      }`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ship?.name || "Ship"}
          className="mb-3 h-28 w-full rounded-lg object-cover"
        />
      )}

      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <span className="text-base">🚢</span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {ship?.name || "Unnamed ship"}
          </h3>

          <p className="text-[11px] text-emerald-600">
            Currently tracked
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="mb-2 text-xs text-slate-500">
          Loading ship information...
        </p>
      )}

      <div className="rounded-lg bg-slate-50 px-3 py-1">
        <ShipRow
          label="Type"
          value={ship?.vessel_type}
        />

        {!compact && (
          <>
            <ShipRow
              label="Flag"
              value={ship?.flag}
            />

            <ShipRow
              label="IMO"
              value={ship?.imo}
            />

            <ShipRow
              label="Latitude"
              value={
                Number.isFinite(lat)
                  ? lat.toFixed(5)
                  : "Unknown"
              }
            />

            <ShipRow
              label="Longitude"
              value={
                Number.isFinite(lon)
                  ? lon.toFixed(5)
                  : "Unknown"
              }
            />

            <ShipRow
              label="Destination"
              value={
                voyage?.destination ??
                voyage?.port_name
              }
            />

            <ShipRow
              label="Port"
              value={
                port?.name ??
                port?.port_name
              }
            />
          </>
        )}
      </div>

      {onDetailsClick && (
        <button
          type="button"
          onClick={onDetailsClick}
          className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          {detailsLabel}
        </button>
      )}
    </div>
  );
}
