import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";
import { AIS_TIMESTAMP_FORMAT, formatTimestamp } from "@/lib/dateTime";

export default function PerformanceInsightsTab({ position, voyage }) {
  return (
    <DetailCard title="Performance insights">
      <DetailFields
        rows={[
          ["Speed", position.speed == null ? null : `${position.speed} knots`],
          ["Course", position.course == null ? null : `${position.course}°`],
          [
            "Navigational status",
            position.navigational_status ?? voyage.status,
          ],
          ["Reported ETA", formatTimestamp(voyage.create_time, AIS_TIMESTAMP_FORMAT)],
        ]}
      />
    </DetailCard>
  );
}
