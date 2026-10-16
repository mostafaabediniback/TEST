import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";

export default function VesselCharacteristicsTab({ ship, position }) {
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
}
