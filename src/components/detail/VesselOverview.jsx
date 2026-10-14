import { useState } from "react";
import {
  Building2,
  ChevronRight,
  MessageSquarePlus,
  Ship,
} from "lucide-react";

import ShipPositionMap from "@/components/map/ShipPositionMap";
import VoyageTimeline from "@/components/map/VoyageTimeline";
import DetailCard from "./DetailCard";
import DetailEmpty from "./DetailEmpty";
import DetailFields from "./DetailFields";
import formatTime from "@/lib/formatTime";

function getCompanies(companyData) {
  if (Array.isArray(companyData)) return companyData;
  return companyData?.items ?? companyData?.companies ?? [];
}

function BusinessCards({ companyData }) {
  const [showAll, setShowAll] = useState(false);
  const companies = getCompanies(companyData);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Businesses</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="At arrival location">
          {companies.length ? (
            <>
              <ul className="space-y-3">
                {companies
                  .slice(0, showAll ? companies.length : 5)
                  .map((company, index) => (
                    <li
                      key={company.id ?? index}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Building2 size={18} />
                      </span>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {company.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.type ??
                            company.service ??
                            "Maritime services"}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>

              {companies.length > 5 && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                  onClick={() => setShowAll((value) => !value)}
                >
                  {showAll ? "Show less" : "View full list"}
                  <ChevronRight size={15} />
                </button>
              )}
            </>
          ) : (
            <DetailEmpty>
              No businesses reported at the arrival location
            </DetailEmpty>
          )}
        </DetailCard>

        <DetailCard title="Near the vessel">
          <DetailEmpty>No nearby business data available</DetailEmpty>
        </DetailCard>
      </div>
    </section>
  );
}

function NotesCard({ id }) {
  const storageKey = `vessel-detail:${id}`;

  function readSavedNote() {
    if (typeof window === "undefined") return "";

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      return typeof saved.note === "string" ? saved.note : "";
    } catch {
      return "";
    }
  }

  const [note, setNote] = useState(readSavedNote);
  const [editing, setEditing] = useState(false);

  function saveNote(event) {
    event.preventDefault();

    const savedNote = note.trim();

    try {
      localStorage.setItem(storageKey, JSON.stringify({ note: savedNote }));
    } catch {
      // Keep the note in state if local storage is unavailable.
    }

    setNote(savedNote);
    setEditing(false);
  }

  return (
    <DetailCard title="Notes">
      {editing ? (
        <form onSubmit={saveNote}>
          <label
            htmlFor={`vessel-note-${id}`}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Private note
          </label>

          <textarea
            id={`vessel-note-${id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            placeholder="Add a note about this vessel..."
          />

          <div className="mt-3 flex gap-2">
            <button
              className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Save note
            </button>

            <button
              className="rounded-md border px-3 py-2 text-sm"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Notes are saved on this device.
          </p>
        </form>
      ) : (
        <div className="text-center">
          <MessageSquarePlus className="mx-auto text-slate-400" size={26} />

          <p className="my-3 whitespace-pre-wrap text-sm text-slate-600">
            {note || "Keep your vessel notes in one place"}
          </p>

          <button
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white"
            type="button"
            onClick={() => setEditing(true)}
          >
            {note ? "Edit note" : "Add a note"}
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Private · saved on this device
          </p>
        </div>
      )}
    </DetailCard>
  );
}

export default function VesselOverview({
  id,
  ship = {},
  position = {},
  voyage = {},
  summary = {},
  companies,
  coordinates,
  imageUrl,
}) {
  const details = summary ?? ship;
  const name = ship.name || details.name || "Unnamed vessel";
  const vesselType = ship.vessel_type || details.vessel_type || "Vessel";

  // API position fields are lat/lon. Map coordinates use [longitude, latitude].
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
    ["Flag", details.flag],
    ["IMO", details.imo],
    ["MMSI", details.mmsi],
    ["Call sign", details.call_sign ?? details.callsign],
    ["Vessel type", vesselType],
    ["Year built", details.yob ?? details.year_built],
    ["Length overall", details.loa == null ? null : `${details.loa} m`],
    ["Width", details.width == null ? null : `${details.width} m`],
    ["Deadweight", details.dwt == null ? null : `${details.dwt} t`],
  ];

const aisRows = [
  ["Navigational status", position.navigational_status ?? voyage.status],
  ["Position received", formatTime(position.time)],
  [
    "Vessel's local time",
    position.local_time ?? position.vessel_local_time,
  ],
  [
    "Latitude/Longitude",
    position.lat != null && position.lon != null
      ? `${Number(position.lat).toFixed(5)}° / ${Number(position.lon).toFixed(5)}°`
      : null,
  ],
    [
    "Speed",
    position.speed == null ? null : `${position.speed} kn`,
  ],
  [
    "Course",
    position.course == null ? null : `${position.course}°`,
  ],
  [
    "True heading",
    position.true_heading == null
      ? null
      : `${position.true_heading}°`,
  ],
  [
    "Rate of turn",
    position.rate_of_turn == null
      ? null
      : `${position.rate_of_turn} °/min`,
  ],
  [
    "Draught",
    position.draught == null && ship.draft == null && details.draft == null
      ? null
      : `${position.draught ?? ship.draft ?? details.draft} m`,
  ],
  [
    "Reported destination",
    voyage.reported_destination ?? voyage.destination,
  ],
  ["Matched destination", voyage.matched_destination],
  [
    "Reported ETA",
    formatTime(voyage.create_time)
  ],
  ["AIS vessel type", position.vessel_type ?? ship.vessel_type],
  ["AIS source", position.source ?? position.ais_source],
    [
    "Destination",
    voyage.destination ?? voyage.destination_port ?? voyage.arrival_port_name,
  ],
  ["ETA", voyage.eta ?? voyage.arrival_time],
].filter(([, value]) => value != null && value !== "");
  


  const vesselImage =
    imageUrl ??
    ship.main_image ??
    details.main_image ??
    null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <DetailCard title="Current voyage">
          <div className="relative h-72 overflow-hidden rounded-md bg-slate-100">
            {hasCoordinates ? (
              <>
                <ShipPositionMap
                  coordinates={mapCoordinates}
                  name={name}
                />

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
        </DetailCard>

        <BusinessCards companyData={companies} />
      </div>

      <div className="space-y-5">
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
                <strong>{name}</strong> was last reported at{" "}
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
                and is sailing under the flag of{" "}
                <strong>{details.flag}</strong>
              </>
            ) : null}
            .{summary.description ? ` ${summary.description}` : ""}
          </p>
        </DetailCard>

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

          <div className="space-y-5">
            <DetailCard title="Latest AIS information">
              <DetailFields rows={aisRows} />
            </DetailCard>

            <NotesCard id={id ?? ship.id ?? "unknown"} />
          </div>
        </div>
      </div>
    </div>
  );
}