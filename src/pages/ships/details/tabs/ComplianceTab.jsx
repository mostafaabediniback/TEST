import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";
import DetailEmpty from "@/components/detail/DetailEmpty";

export default function ComplianceTab({ ship }) {
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
}
