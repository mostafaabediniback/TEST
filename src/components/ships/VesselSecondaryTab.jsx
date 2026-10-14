import formatTime from "@/lib/formatTime";
import DetailCard from "../detail/DetailCard";
import DetailEmpty from "../detail/DetailEmpty";
import DetailFields from "../detail/DetailFields";

export default function VesselSecondaryTab({
  activeTab,
  ship,
  position,
  voyage,
  port,
}) {
  switch (activeTab) {
    case "Port call log":
      return (
        <DetailCard title="Port call log">
          <p className="mb-4 text-sm text-slate-500">
            Events reported for the current voyage.
          </p>
          <DetailFields
            rows={[
              ["Departure port", voyage.origin ?? voyage.departure_port_name],
              [
                "Departure time",
                formatTime(voyage.departure_time) ?? voyage.departure,
              ],
              ["Arrival port", voyage.destination ?? voyage.arrival_port_name],
              ["Reported ETA", formatTime(voyage.arrival_time)],
              ["Current port", voyage.arrival_port_name],
            ]}
          />
        </DetailCard>
      );

    case "Vessel characteristics":
      return (
        <DetailCard title="Vessel characteristics">
          <DetailFields
            rows={[
              ["Name", ship.name],
              ["Flag", ship.flag],
              ["IMO", ship.imo],
              ["MMSI", ship.mmsi],
              ["Call sign", ship.call_sign ?? ship.callsign],
              ["Vessel type", ship.vessel_type],
              ["Year built", ship.yob ?? ship.year_built],
              ["Length overall", ship.loa == null ? null : `${ship.loa} m`],
              ["Width", ship.width == null ? null : `${ship.width} m`],
              ["Draught", position.draught ?? ship.draft],
              ["Deadweight", ship.dwt == null ? null : `${ship.dwt} t`],
            ]}
          />
        </DetailCard>
      );

    case "Ownership":
      return (
        <DetailCard title="Ownership">
          <DetailFields
            rows={[
              ["Owner", ship.owner],
              ["Manager", ship.manager],
              ["Operator", ship.operator],
            ]}
          />
        </DetailCard>
      );

    case "Performance insights":
      return (
        <DetailCard title="Performance insights">
          <DetailFields
            rows={[
              [
                "Speed",
                position.speed == null ? null : `${position.speed} knots`,
              ],
              [
                "Course",
                position.course == null ? null : `${position.course}°`,
              ],
              [
                "Navigational status",
                position.navigational_status ?? voyage.status,
              ],
              ["Reported ETA", formatTime(voyage.create_time)],
            ]}
          />
        </DetailCard>
      );

    case "Compliance":
      return (
        <DetailCard title="Vessel identification">
          <DetailFields
            rows={[
              ["IMO", ship.imo],
              ["MMSI", ship.mmsi],
              ["Flag", ship.flag],
              ["Call sign", ship.call_sign ?? ship.callsign],
            ]}
          />
          <div className="mt-4">
            <DetailEmpty>No compliance records available</DetailEmpty>
          </div>
        </DetailCard>
      );

    case "In the news":
      return (
        <DetailCard title="In the news">
          <DetailEmpty>No news available for this vessel</DetailEmpty>
        </DetailCard>
      );

    default:
      return null;
  }
}
