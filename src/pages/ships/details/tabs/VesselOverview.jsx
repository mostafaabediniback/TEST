import { Ship, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ShipPositionMap from "@/components/map/ShipPositionMap";
import VoyageTimeline from "@/components/ships/VoyageTimeline";
import DetailCard from "@/components/detail/DetailCard";
import TimestampWithRelative from "@/components/TimestampWithRelative";
import DetailFields from "@/components/detail/DetailFields";
import {
  AIS_TIMESTAMP_FORMAT,
  formatTimestamp,
  formatVesselTimestamp,
} from "@/lib/dateTime";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { VesselFlag } from "@/components/VesselFlag";
import VoyageTimelineTable from "@/components/formatTimelineTime";

export default function VesselOverview({
  ship = {},
  position = {},
  voyage = {},
  summary = {},
  coordinates,
  imageUrl,
  onShowOnMap,
  mapTo,
  canShowOnMap = false,
}) {
  const { t } = useLocale();

  // Merge both objects so ship fields remain available when summary is empty.
  const details = { ...ship, ...summary };
  const name = ship.name || details.name || "Unnamed vessel";
  const vesselType = ship.vessel_type || details.vessel_type || "Vessel";

  // Map coordinates use [longitude, latitude]; AIS position fields use lat/lon.
  const latitude = coordinates?.[1] ?? position.lat;
  const longitude = coordinates?.[0] ?? position.lon;

  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const lat = hasCoordinates ? Number(latitude) : null;
  const lon = hasCoordinates ? Number(longitude) : null;
  const mapCoordinates = hasCoordinates ? [lon, lat] : null;

  const generalRows = [
    ["Name", name],
    ["Flag", <VesselFlag key="vessel-flag" country={details.flag} />],
    ["IMO", details.imo],
    ["MMSI", details.mmsi],
    ["Call sign", details.call_sign ?? details.callsign],
    ["AIS transponder class", details.ais_class],
    ["General vessel type", vesselType],
    ["Detail vessel type", details.vessel_subtype],
    ["Year built", details.yob ?? details.year_built],
    ["Length overall", details.loa == null ? null : `${details.loa} m`],
    ["Width", details.width == null ? null : `${details.width} m`],
    ["Deadweight", details.dwt == null ? null : `${details.dwt} t`],
  ];

  const aisRows = [
    ["Navigational status", position.navigational_status ?? voyage.status],
    [
      "Position received",
      position.time ? (
        <TimestampWithRelative
          key="position-received"
          value={position.time}
          {...AIS_TIMESTAMP_FORMAT}
        />
      ) : null,
    ],
    [
      "Vessel's local time",
      formatVesselTimestamp(position.time, position.timezone ?? 0),
    ],
    [
      "Latitude/Longitude",
      position.lat != null && position.lon != null
        ? `${Number(position.lat).toFixed(5)}° / ${Number(position.lon).toFixed(5)}°`
        : null,
    ],
    ["Speed", position.speed == null ? null : `${position.speed} kn`],
    ["Course", position.course == null ? null : `${position.course}°`],
    ["True heading", position.heading == null ? null : `${position.heading}°`],
    [
      "Rate of turn",
      position.rate_of_turn == null ? null : `${position.rate_of_turn} °/min`,
    ],
    [
      "Draught",
      position.draught == null && ship.draft == null && details.draft == null
        ? null
        : `${position.draught ?? ship.draft ?? details.draft} m`,
    ],
    ["Reported destination", voyage.reported_destination ?? voyage.destination],
    ["Matched destination", voyage.matched_destination],
    ["Reported ETA", formatTimestamp(voyage.create_time, AIS_TIMESTAMP_FORMAT)],
    ["AIS vessel type", position.vessel_type ?? ship.vessel_type],
    ["AIS source", position.source ?? position.ais_source],
    [
      "Destination",
      voyage.destination ?? voyage.destination_port ?? voyage.arrival_port_name,
    ],
    [
      "ETA",
      formatTimestamp(voyage.eta ?? voyage.arrival_time, AIS_TIMESTAMP_FORMAT),
    ],
  ].map(([label, value]) => [
    label,
    value == null || value === "" ? "—" : value,
  ]);

  const vesselImage = imageUrl ?? ship.main_image ?? details.main_image ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <DetailCard title="Current voyage">
          <div className="relative h-72 overflow-hidden rounded-md bg-slate-100">
            {hasCoordinates ? (
              <>
                <ShipPositionMap coordinates={mapCoordinates} name={name} />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowOnMap}
                  disabled={!canShowOnMap}
                  nativeButton={false}
                  render={mapTo ? <Link to={mapTo} /> : <span />}
                  className="absolute end-3 top-3 z-10 bg-background/95 shadow-sm"
                >
                  <MapPin aria-hidden="true" />
                  {t("viewOnMap")}
                </Button>

                <div className="absolute bottom-3 left-3 z-10 rounded bg-slate-900/90 px-3 py-2 text-xs text-white">
                  {lat.toFixed(5)}, {lon.toFixed(5)}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Position unavailable
              </div>
            )}
          </div>

          <div className="mt-4">
            <VoyageTimeline voyage={voyage} />
          </div>
          <div className="mt-4">
            <VoyageTimelineTable voyage={voyage} />
          </div>
        </DetailCard>

        <DetailCard title="Summary">
          <h3 className="font-medium text-slate-800">Where is the ship?</h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary.location ? (
              <>
                {vesselType} <strong>{name}</strong> is currently located in{" "}
                <strong>{summary.location}</strong>.
              </>
            ) : hasCoordinates ? (
              <>
                <strong>{name}</strong> was last reported on{" "}
                <strong>
                  {lat.toFixed(4)}°, {lon.toFixed(4)}°
                </strong>
                .
              </>
            ) : (
              "The vessel's current location has not been reported."
            )}
          </p>

          <h3 className="mt-5 font-medium text-slate-800">
            What kind of ship is this?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            <strong>{name}</strong>
            {details.imo ? ` (IMO: ${details.imo})` : ""} is a{" "}
            <strong>{vesselType}</strong>
            {details.flag ? (
              <>
                {" "}
                and is sailing under the flag of <strong>{details.flag}</strong>
              </>
            ) : null}
            .{summary.description ? ` ${summary.description}` : ""}
          </p>
        </DetailCard>
      </div>

      <div className="space-y-5">
        <div className="grid gap-5 2xl:grid-cols-2">
          <DetailCard title="General">
            <div className="mb-4 h-48 overflow-hidden rounded-md bg-slate-100">
              {vesselImage ? (
                <img
                  src={vesselImage}
                  alt={`${name} vessel`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                  <Ship size={42} />
                  <span className="text-sm">No vessel photo available</span>
                </div>
              )}
            </div>

            <DetailFields rows={generalRows} />
          </DetailCard>

          <DetailCard title="Latest AIS information">
            <DetailFields rows={aisRows} />
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
