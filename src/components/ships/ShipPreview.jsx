// ShipPreview.jsx
import VoyageTimeline from "./VoyageTimeline";
import { useLocale } from "@/context/LocaleContext";
import { useShipPreview } from "@/hooks/useShipPreview";

function formatTimestamp(value) {
  if (value == null || value === "") return "—";

  const numeric = Number(value);
  const milliseconds = Number.isFinite(numeric)
    ? numeric < 1e12
      ? numeric * 1000
      : numeric
    : Date.parse(value);

  if (!Number.isFinite(milliseconds)) return "—";

  return new Date(milliseconds).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ShipPreview({
  ship,
  onDetailsClick,
  detailsLabel = "Vessel details",
  onPastTrackClick,
  isPastTrackActive = false,
}) {
  const { t } = useLocale();
  const preview = useShipPreview(ship, Boolean(ship?.id));

  const shipData = preview.ship ?? ship;
  const photo = preview.photo;
  const voyage = preview.voyage;
  const position = preview.position;

  const imageUrl = photo?.url ?? photo?.photo_url ?? photo?.image_url;
  const speed = position?.speed ?? shipData?.speed;
  const course = position?.course ?? shipData?.course;
  const draught = shipData?.draft ?? position?.draught;

  return (
    <article className="w-full  font-sans">
      {/* Photo and vessel header */}
      {imageUrl ? (
        <div className="relative h-52">
          <img
            src={imageUrl}
            alt={shipData?.name || "Vessel"}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-white">
            <h2 className="text-lg font-bold">
              {shipData?.name || "Unnamed vessel"}
            </h2>
            <p className="text-xs">
              {shipData?.vessel_type || "Vessel"}
              {shipData?.flag ? ` · ${shipData.flag}` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <h2 className="text-lg font-bold">
            {shipData?.name || "Unnamed vessel"}
          </h2>
          <p className="text-xs">
            {shipData?.vessel_type || "Vessel"}
            {shipData?.flag ? ` · ${shipData.flag}` : ""}
          </p>
        </div>
      )}

      {/* {preview.isLoading && (
        <p className="px-3 pt-2 text-xs text-slate-500">
          Loading vessel information…
        </p>
      )} */}

      {/* Name, destination, and voyage times */}
      <div>
        {/* Route progress */}
        <div className="my-4 flex items-center" aria-label="Voyage route">
          <VoyageTimeline voyage={voyage} />
        </div>

        {/* Actions */}
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={onPastTrackClick}
            disabled={!onPastTrackClick || shipData?.id == null}
            aria-pressed={isPastTrackActive}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${isPastTrackActive ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-300 hover:bg-slate-50"}`}
          >
            {t(isPastTrackActive ? "hidePastTrack" : "pastTrack")}
          </button>

          <button
            type="button"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Use route tool
          </button>

          {onDetailsClick && (
            <button
              type="button"
              onClick={onDetailsClick}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {detailsLabel}
            </button>
          )}
        </div>

        {/* Vessel status */}
        <div className="grid grid-cols-3 divide-x rounded-md border text-xs">
          <div className="p-2">
            <p className="text-slate-500">Navigational status</p>
            <p className="font-semibold">
              {position?.navigational_status ??
                shipData?.status ??
                "Unavailable"}
            </p>
          </div>

          <div className="p-2">
            <p className="text-slate-500">Speed / Course</p>
            <p className="font-semibold">
              {speed != null ? `${speed} kn` : "—"}
              {" / "}
              {course != null ? `${course}°` : "—"}
            </p>
          </div>

          <div className="p-2">
            <p className="text-slate-500">Draught</p>
            <p className="font-semibold">
              {draught != null ? `${draught} m` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-3 border-t pt-2 text-xs text-slate-500">
          Received: {formatTimestamp(position?.time)}  ago (AIS source: {position?.time} )
        </div>
      </div>
    </article>
  );
}
