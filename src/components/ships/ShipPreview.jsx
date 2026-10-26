import { useEffect, useState } from "react";
import TimestampWithRelative from "@/components/TimestampWithRelative";
import { useLocale } from "@/context/LocaleContext";
import { AIS_TIMESTAMP_FORMAT } from "@/lib/dateTime";
import { VesselFlag } from "../VesselFlag";
import VoyageTimeline from "./VoyageTimeline";

function isBinary(value) {
  return (
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" &&
      (value instanceof ArrayBuffer || ArrayBuffer.isView(value)))
  );
}

export default function ShipPreview({
  ship,
  photo,
  position,
  voyage,
  onDetailsClick,
  detailsLabel = "Vessel details",
  onPastTrackClick,
  isPastTrackActive = false,
}) {
  const { t } = useLocale();
  const shipData = ship;

  // Supports a direct URL or an object containing a URL.
  const imageUrl =
    typeof photo === "string"
      ? photo
      : (photo?.url ?? photo?.photo_url ?? photo?.image_url ?? null);

  // Supports a Blob, ArrayBuffer, or typed array from the image endpoint.
  const binaryPhoto = isBinary(photo)
    ? photo
    : isBinary(photo?.data)
      ? photo.data
      : isBinary(photo?.binary)
        ? photo.binary
        : null;

  const [binaryImageUrl, setBinaryImageUrl] = useState("");

  useEffect(() => {
    if (!binaryPhoto) {
      setBinaryImageUrl("");
      return;
    }

    const contentType =
      (typeof Blob !== "undefined" && binaryPhoto instanceof Blob
        ? binaryPhoto.type
        : null) ||
      photo?.mimeType ||
      photo?.contentType ||
      "image/jpeg";

    const blob =
      typeof Blob !== "undefined" && binaryPhoto instanceof Blob
        ? binaryPhoto
        : new Blob([binaryPhoto], { type: contentType });

    const objectUrl = URL.createObjectURL(blob);
    setBinaryImageUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [binaryPhoto, photo]);

  const displayImageUrl = imageUrl || binaryImageUrl;
  const speed = position?.speed ?? shipData?.speed;
  const course = position?.course ?? shipData?.course;
  const draught = shipData?.draft ?? position?.draught;

  return (
    <article className="map-popup-preview w-full font-sans">
      {/* Photo and vessel header */}
      {displayImageUrl ? (
        <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-slate-200">
          <img
            src={displayImageUrl}
            alt={shipData?.name || "Vessel"}
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-3 pt-10 text-white">
            <h2 className="text-lg font-bold leading-tight">
              {shipData?.name || "Unnamed vessel"}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span>{shipData?.vessel_type || "Vessel"}</span>
              {shipData?.flag && <VesselFlag country={shipData.flag} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 pe-7">
          <h2 className="text-lg font-bold">
            {shipData?.name || "Unnamed vessel"}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span>{shipData?.vessel_type || "Vessel"}</span>
            {shipData?.flag && <VesselFlag country={shipData.flag} />}
          </div>
        </div>
      )}

      {/* Voyage route */}
      <div className="my-3 flex min-w-0 items-center" aria-label="Voyage route">
        <VoyageTimeline voyage={voyage} compact />
      </div>

      {/* Actions */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={onPastTrackClick}
          disabled={!onPastTrackClick || shipData?.id == null}
          aria-pressed={isPastTrackActive}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
            isPastTrackActive
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          {t(isPastTrackActive ? "hidePastTrack" : "pastTrack")}
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
      <div className="grid grid-cols-3 divide-x rounded-md border text-xs rtl:divide-x-reverse">
        <div className="min-w-0 p-2">
          <p className="text-slate-500">Navigational status</p>
          <p className="font-semibold">
            {position?.navigational_status ?? shipData?.status ?? "Unavailable"}
          </p>
        </div>

        <div className="min-w-0 p-2">
          <p className="text-slate-500">Speed / Course</p>
          <p className="font-semibold">
            {speed != null ? `${speed} kn` : "—"}
            {" / "}
            {course != null ? `${course}°` : "—"}
          </p>
        </div>

        <div className="min-w-0 p-2">
          <p className="text-slate-500">Draught</p>
          <p className="font-semibold">
            {draught != null ? `${draught} m` : "—"}
          </p>
        </div>
      </div>

      {/* Position timestamp */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-2 text-xs text-slate-500">
        <span>Received:</span>
        <TimestampWithRelative
          value={position?.time}
          {...AIS_TIMESTAMP_FORMAT}
        />
      </div>
    </article>
  );
}
